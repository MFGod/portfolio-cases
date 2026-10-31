import { type Profile } from './content';
import {
  createProfileRecord,
  isProfile,
  profileNameError,
  readProfile,
  sameProfile,
  withPersistenceLock,
  type PersistenceStore,
  type ProfileRecord,
  type Reading,
} from './persistence';

type ProfileState = {
  profile: Profile;
  revision: number;
  dirty: boolean;
  storageError: boolean;
  recoveryWarning: string | null;
  conflict: string | null;
};

export class ProfilePersistence {
  private stored: Reading<ProfileRecord>;
  private state: ProfileState;

  constructor(private readonly store: PersistenceStore) {
    this.stored = readProfile(store);
    this.state = {
      profile: { ...this.stored.value.draft },
      revision: 0,
      dirty: !sameProfile(this.stored.value.draft, this.stored.value.confirmed),
      storageError: this.stored.storageError,
      recoveryWarning: this.stored.recoveryWarning,
      conflict: null,
    };
  }

  getSnapshot = () => this.state;

  update<K extends keyof Profile>(key: K, value: Profile[K]) {
    const profile = { ...this.state.profile, [key]: value };
    if (!isProfile(profile) || sameProfile(profile, this.state.profile)) return;
    this.state = {
      ...this.state,
      profile,
      revision: this.state.revision + 1,
      dirty: !sameProfile(profile, this.stored.value.confirmed),
    };
  }

  sync() {
    const latest = readProfile(this.store);
    if (!this.checkReading(latest)) return;
    if (latest.fingerprint === this.stored.fingerprint) {
      if (this.state.storageError || this.state.recoveryWarning) {
        this.state = { ...this.state, storageError: false, recoveryWarning: null };
      }
      return;
    }
    if (this.state.dirty && !sameProfile(this.state.profile, latest.value.draft)) {
      this.setConflict();
      return;
    }
    this.adopt(latest);
  }

  persistDraft = () =>
    this.lockWrite(() => {
      if (!this.canWrite()) return false;
      return this.write(createProfileRecord(this.stored.value.confirmed, this.state.profile));
    });

  confirm = (revision: number) =>
    this.lockWrite(() => {
      if (!this.stored.value.stamp) return false;
      if (revision !== this.state.revision || profileNameError(this.state.profile)) return false;
      if (!this.canWrite()) return false;
      return this.write(createProfileRecord(this.state.profile, this.state.profile));
    });

  useStoredProfile = async () => {
    const latest = readProfile(this.store);
    if (this.checkReading(latest)) this.adopt(latest);
  };

  keepLocalProfile = () =>
    withPersistenceLock('profile', () => {
      const latest = readProfile(this.store);
      if (!this.checkReading(latest)) return;
      this.stored = latest;
      this.state = { ...this.state, conflict: null };
      this.write(createProfileRecord(latest.value.confirmed, this.state.profile));
    }).catch(() => {
      this.state = { ...this.state, storageError: true };
    });

  recoverProfile = () =>
    withPersistenceLock('profile', () => {
      const latest = readProfile(this.store);
      if (latest.storageError) {
        this.state = { ...this.state, storageError: true };
        return;
      }
      if (!latest.recoveryWarning) {
        if (this.state.dirty && !sameProfile(this.state.profile, latest.value.draft)) {
          this.state = { ...this.state, recoveryWarning: null };
          this.setConflict();
        } else {
          this.adopt(latest);
        }
        return;
      }
      this.write(createProfileRecord(latest.value.confirmed, this.state.profile));
    }).catch(() => {
      this.state = { ...this.state, storageError: true };
    });

  private checkReading(latest: Reading<ProfileRecord>) {
    if (!latest.storageError && !latest.recoveryWarning) return true;
    this.state = {
      ...this.state,
      storageError: latest.storageError,
      recoveryWarning: latest.recoveryWarning ?? this.state.recoveryWarning,
    };
    return false;
  }

  private canWrite() {
    if (this.state.recoveryWarning || this.state.conflict) return false;
    const latest = readProfile(this.store);
    if (!this.checkReading(latest)) return false;
    if (latest.fingerprint === this.stored.fingerprint) return true;
    if (sameProfile(this.state.profile, latest.value.draft)) {
      this.stored = latest;
      return true;
    }
    this.setConflict();
    return false;
  }

  private async lockWrite(write: () => boolean) {
    try {
      return await withPersistenceLock('profile', write);
    } catch {
      this.state = { ...this.state, storageError: true };
      return false;
    }
  }

  private setConflict() {
    this.state = {
      ...this.state,
      conflict: 'Профиль изменён в другой вкладке. Выберите версию для сохранения.',
    };
  }

  private adopt(latest: Reading<ProfileRecord>) {
    this.stored = latest;
    this.state = {
      profile: { ...latest.value.draft },
      revision: this.state.revision + 1,
      dirty: !sameProfile(latest.value.draft, latest.value.confirmed),
      storageError: false,
      recoveryWarning: null,
      conflict: null,
    };
  }

  private write(record: ProfileRecord) {
    try {
      this.store.set('profile-state', record);
      this.stored = {
        value: record,
        fingerprint: JSON.stringify({ record }),
        recoveryWarning: null,
        storageError: false,
      };
      this.state = {
        ...this.state,
        dirty: !sameProfile(record.draft, record.confirmed),
        storageError: false,
        recoveryWarning: null,
        conflict: null,
      };
      return true;
    } catch {
      this.state = { ...this.state, storageError: true };
      return false;
    }
  }
}
