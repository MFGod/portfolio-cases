import { useCallback, useEffect, useState } from 'react';
import { type Profile } from '../../domain/content';
import { profileNameError } from '../../domain/persistence';
import { ProfilePersistence } from '../../domain/profile-persistence';
import { kit } from '../../kit';

type SaveState = 'saved' | 'waiting' | 'saving' | 'error' | 'invalid';

export function useProfile() {
  const [persistence] = useState(() => new ProfilePersistence(kit.store));
  const [snapshot, setSnapshot] = useState(persistence.getSnapshot);
  const [saveState, setSaveState] = useState<SaveState>(snapshot.dirty ? 'waiting' : 'saved');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const refresh = useCallback(() => setSnapshot(persistence.getSnapshot()), [persistence]);
  const nameError = profileNameError(snapshot.profile);

  useEffect(() => {
    let active = true;
    setLoadState('loading');
    void kit.demo
      .request(() => persistence.sync())
      .then(() => {
        if (!active) return;
        refresh();
        setLoadState(persistence.getSnapshot().storageError ? 'error' : 'ready');
      })
      .catch(() => {
        if (active) setLoadState('error');
      });
    return () => {
      active = false;
    };
  }, [loadAttempt, persistence, refresh]);

  useEffect(() => {
    const sync = () => {
      persistence.sync();
      refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith(`${kit.slug}:profile-`)) sync();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', sync);
    };
  }, [persistence, refresh]);

  const update = useCallback(
    <K extends keyof Profile>(key: K, value: Profile[K]) => {
      persistence.update(key, value);
      refresh();
      setSaveState('waiting');
      void persistence.persistDraft().then(refresh);
    },
    [persistence, refresh],
  );

  useEffect(() => {
    if (loadState !== 'ready') return;
    if (snapshot.storageError || snapshot.recoveryWarning || snapshot.conflict) {
      setSaveState('error');
      return;
    }
    if (nameError) {
      setSaveState('invalid');
      return;
    }
    if (!snapshot.dirty) {
      setSaveState('saved');
      return;
    }
    let active = true;
    const revision = snapshot.revision;
    setSaveState('waiting');
    const timer = window.setTimeout(() => {
      setSaveState('saving');
      void kit.demo
        .request(() => (active ? persistence.confirm(revision) : false))
        .then((saved) => {
          if (!active) return;
          refresh();
          setSaveState(saved ? 'saved' : 'error');
        })
        .catch(() => {
          if (active) setSaveState('error');
        });
    }, 600);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [snapshot, nameError, loadState, saveAttempt, persistence, refresh]);

  const runRecovery = async (action: () => Promise<void>) => {
    await action();
    refresh();
    setSaveAttempt((attempt) => attempt + 1);
  };

  return {
    profile: snapshot.profile,
    nameError,
    update,
    saveState,
    loadState,
    storageError: snapshot.storageError,
    recoveryWarning: snapshot.recoveryWarning,
    conflict: snapshot.conflict,
    retryLoad: () => setLoadAttempt((attempt) => attempt + 1),
    retrySave: async () => {
      await persistence.persistDraft();
      refresh();
      setSaveAttempt((attempt) => attempt + 1);
    },
    useStoredProfile: () => runRecovery(persistence.useStoredProfile),
    keepLocalProfile: () => runRecovery(persistence.keepLocalProfile),
    recoverProfile: () => runRecovery(persistence.recoverProfile),
  };
}
