import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { errorText, kit, load, WishlistError, type Snapshot } from '../model';

export type ActionKind = 'save' | 'book' | 'copy' | 'delete' | 'read' | 'restore';
export function useWishlist() {
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [recoverable, setRecoverable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<ActionKind>();
  const [error, setError] = useState('');
  const [scope, setScope] = useState('');
  const [toast, setToast] = useState('');
  const pending = useRef(false);
  const mounted = useRef(true);
  const generation = useRef(0);
  const refreshAfterSave = useRef(false);
  const reload = async (background = false) => {
    if (pending.current) {
      refreshAfterSave.current = true;
      return;
    }
    const version = ++generation.current;
    if (!background) setLoading(true);
    try {
      const next = await load();
      if (!mounted.current || version !== generation.current) return;
      setSnapshot(next);
      setLoadError('');
      setRecoverable(false);
    } catch (cause) {
      if (!mounted.current || version !== generation.current) return;
      setLoadError(errorText(cause));
      setRecoverable(cause instanceof WishlistError && cause.recoverable);
    } finally {
      if (mounted.current && version === generation.current) setLoading(false);
    }
  };
  const reloadEvent = useEffectEvent(reload);
  useEffect(() => {
    mounted.current = true;
    void reloadEvent();
    const sync = (event: StorageEvent) => {
      if (event.key === null || event.key === `${kit.slug}:wishlist-v1`) void reloadEvent(true);
    };
    window.addEventListener('storage', sync);
    return () => {
      mounted.current = false;
      generation.current += 1;
      window.removeEventListener('storage', sync);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const execute = async (
    task: () => Promise<Snapshot>,
    kind: ActionKind,
    message: string,
    target = '',
  ) => {
    if (pending.current) throw new Error('Дождитесь завершения действия.');
    pending.current = true;
    generation.current += 1;
    setBusy(true);
    setAction(kind);
    setScope(target);
    setError('');
    setToast('');
    try {
      const next = await task();
      if (mounted.current) {
        setSnapshot(next);
        setToast(message);
        setLoadError('');
        setRecoverable(false);
      }
      return next;
    } catch (cause) {
      if (mounted.current) {
        setError(errorText(cause));
        if (cause instanceof WishlistError && cause.recoverable) {
          setRecoverable(true);
          setLoadError(errorText(cause));
        }
      }
      throw cause;
    } finally {
      pending.current = false;
      if (mounted.current) {
        setBusy(false);
        setLoading(false);
        if (refreshAfterSave.current) {
          refreshAfterSave.current = false;
          void reload(true);
        }
      }
    }
  };
  return {
    snapshot,
    loading,
    loadError,
    recoverable,
    reload,
    busy,
    isPending: () => pending.current,
    action,
    scope,
    error,
    clearError: () => setError(''),
    toast,
    setToast,
    execute,
  };
}
