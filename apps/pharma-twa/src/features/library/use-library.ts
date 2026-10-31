import { useCallback, useEffect, useState } from 'react';
import { materials, type Material } from '../../domain/content';
import { FavoritesPersistence } from '../../domain/favorites-persistence';
import { kit } from '../../kit';

type LoadState = 'loading' | 'ready' | 'error';

export function useLibrary(notify: (message: string) => void) {
  const [catalog, setCatalog] = useState<Material[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [attempt, setAttempt] = useState(0);
  const [persistence] = useState(() => new FavoritesPersistence(kit.store));
  const [snapshot, setSnapshot] = useState(persistence.getSnapshot);
  const refresh = useCallback(() => setSnapshot(persistence.getSnapshot()), [persistence]);

  useEffect(() => {
    let active = true;
    setState('loading');
    void kit.demo
      .request(() => materials)
      .then((data) => {
        if (!active) return;
        persistence.sync();
        refresh();
        setCatalog(data);
        setState('ready');
      })
      .catch(() => {
        if (active) setState('error');
      });
    return () => {
      active = false;
    };
  }, [attempt, persistence, refresh]);

  useEffect(() => {
    const sync = () => {
      persistence.sync();
      refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === `${kit.slug}:favorites`) sync();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', sync);
    };
  }, [persistence, refresh]);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const operation = persistence.toggleFavorite(
        id,
        async (write) => await kit.demo.request(write),
      );
      refresh();
      const added = await operation;
      refresh();
      if (added !== null) notify(added ? 'Добавлено в избранное' : 'Убрано из избранного');
    },
    [persistence, refresh, notify],
  );

  return {
    catalog,
    state,
    reload: () => setAttempt((value) => value + 1),
    ...snapshot,
    dismissFailure: () => {
      persistence.dismissFailure();
      refresh();
    },
    recoverFavorites: async () => {
      await persistence.recoverFavorites();
      refresh();
    },
    toggleFavorite,
  };
}

export type Library = ReturnType<typeof useLibrary>;
