import { defaultProfile, materials, type Profile } from './content';

export type PersistenceStore = {
  get: <T>(key: string, fallback: T) => T;
  set: (key: string, value: unknown) => void;
};
export type ProfileRecord = {
  version: 1;
  confirmed: Profile;
  draft: Profile;
  stamp: string;
};
export type Reading<T> = {
  value: T;
  fingerprint: string;
  recoveryWarning: string | null;
  storageError: boolean;
};

const profileWarning = 'Сохранённый профиль повреждён. Выберите восстановление.';
const favoritesWarning = 'Сохранённое избранное повреждено. Восстановите список.';
const materialIds = new Set(materials.map((item) => item.id));
const limits = { name: 90, specialty: 100, city: 80, goal: 500 } as const;
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isRevision = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

export function isProfile(value: unknown): value is Profile {
  return (
    isObject(value) &&
    Object.entries(limits).every(
      ([key, limit]) => typeof value[key] === 'string' && value[key].length <= limit,
    ) &&
    typeof value.avatar === 'string' &&
    ['sage', 'clay', 'blue'].includes(value.avatar)
  );
}

function isLegacyDraft(value: unknown): value is { value: Profile; revision: number } {
  return isObject(value) && isProfile(value.value) && isRevision(value.revision);
}

export const profileNameError = (profile: Profile) =>
  profile.name.trim().length < 2 ? 'Укажите имя и фамилию, минимум 2 символа.' : '';
export const sameProfile = (left: Profile, right: Profile) =>
  left.name === right.name &&
  left.specialty === right.specialty &&
  left.city === right.city &&
  left.goal === right.goal &&
  left.avatar === right.avatar;
export const isMaterialId = (id: string) => materialIds.has(id);

export function createProfileRecord(confirmed: Profile, draft: Profile): ProfileRecord {
  return {
    version: 1,
    confirmed: { ...confirmed },
    draft: { ...draft },
    stamp: crypto.randomUUID(),
  };
}

export function readProfile(store: PersistenceStore): Reading<ProfileRecord> {
  const fallback: ProfileRecord = {
    version: 1,
    confirmed: { ...defaultProfile },
    draft: { ...defaultProfile },
    stamp: '',
  };
  try {
    const record = store.get<unknown>('profile-state', undefined);
    if (record !== undefined) {
      const valid =
        isObject(record) &&
        record.version === 1 &&
        typeof record.stamp === 'string' &&
        isProfile(record.confirmed) &&
        !profileNameError(record.confirmed) &&
        isProfile(record.draft);
      return {
        value: valid ? (record as ProfileRecord) : fallback,
        fingerprint: JSON.stringify({ record }),
        recoveryWarning: valid ? null : profileWarning,
        storageError: false,
      };
    }
    const confirmed = store.get<unknown>('profile-confirmed', undefined);
    const draft = store.get<unknown>('profile-draft', undefined);
    const revision = store.get<unknown>('profile-revision', undefined);
    const validConfirmed = isProfile(confirmed) && !profileNameError(confirmed);
    const validDraft = isLegacyDraft(draft);
    const invalid =
      (confirmed !== undefined && !validConfirmed) ||
      (draft !== undefined && !validDraft) ||
      (revision !== undefined && !isRevision(revision)) ||
      (validDraft && isRevision(revision) && draft.revision < revision);
    const saved = validConfirmed ? confirmed : fallback.confirmed;
    return {
      value: {
        ...fallback,
        confirmed: saved,
        draft: validDraft && !invalid ? draft.value : saved,
      },
      fingerprint: JSON.stringify({ confirmed, draft, revision }),
      recoveryWarning: invalid ? profileWarning : null,
      storageError: false,
    };
  } catch {
    return { value: fallback, fingerprint: '', recoveryWarning: null, storageError: true };
  }
}

export function readFavorites(store: PersistenceStore): Reading<string[]> {
  try {
    const raw = store.get<unknown>('favorites', undefined);
    const valid =
      raw === undefined ||
      (Array.isArray(raw) &&
        raw.every((id) => typeof id === 'string' && isMaterialId(id)) &&
        new Set(raw).size === raw.length);
    return {
      value: valid && Array.isArray(raw) ? [...raw] : [],
      fingerprint: JSON.stringify({ raw }),
      recoveryWarning: valid ? null : favoritesWarning,
      storageError: false,
    };
  } catch {
    return {
      value: [],
      fingerprint: '',
      recoveryWarning: 'Не удалось прочитать сохранённое избранное.',
      storageError: true,
    };
  }
}

export async function withPersistenceLock<T>(key: string, write: () => T): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(`pharma-twa:${key}`, write);
  }
  return write();
}
