import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
import {
  loadWorkspace,
  restoreWorkspace,
  WorkspaceError,
  workspaceKey,
  type Workspace,
} from './domain/workspace';
import { kit } from './kit';

const emptyWorkspace: Workspace = { vacancies: [], candidates: [] };

export function useWorkspace() {
  const [workspace, setWorkspaceState] = useState<Workspace>(emptyWorkspace);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionKind, setActionKind] = useState<'workspace' | 'report'>('workspace');
  const [notice, setNotice] = useState('');
  const [recoveryRequired, setRecoveryRequired] = useState(false);
  const pendingRef = useRef(false);
  const retryRef = useRef<() => void>(() => {});
  const mountedRef = useRef(true);
  const generationRef = useRef(0);
  const refreshAfterPendingRef = useRef(false);

  const setWorkspace = useCallback((next: SetStateAction<Workspace>) => {
    generationRef.current += 1;
    if (mountedRef.current) setWorkspaceState(next);
  }, []);

  const reload = useCallback(async (background = false) => {
    if (pendingRef.current) {
      refreshAfterPendingRef.current = true;
      return;
    }
    const generation = ++generationRef.current;
    if (!background) setLoading(true);
    try {
      const data = await loadWorkspace();
      if (!mountedRef.current || generation !== generationRef.current) return;
      setWorkspaceState(data);
      setLoadError('');
      setRecoveryRequired(false);
    } catch (error) {
      if (!mountedRef.current || generation !== generationRef.current) return;
      setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить данные.');
      setRecoveryRequired(error instanceof WorkspaceError && error.kind === 'corrupt');
    } finally {
      if (mountedRef.current && generation === generationRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void reload();
    const sync = (event: StorageEvent) => {
      if (event.key === null || event.key === `${kit.slug}:${workspaceKey}`) void reload(true);
    };
    window.addEventListener('storage', sync);
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      window.removeEventListener('storage', sync);
    };
  }, [reload]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const run = async (
    operation: () => Promise<void>,
    success: string,
    kind: 'workspace' | 'report' = 'workspace',
  ) => {
    if (pendingRef.current || !mountedRef.current) return;
    pendingRef.current = true;
    generationRef.current += 1;
    setPending(true);
    setActionError('');
    setActionKind(kind);
    setNotice('');
    retryRef.current = () => void run(operation, success, kind);
    try {
      await operation();
      if (mountedRef.current) setNotice(success);
    } catch (error) {
      if (mountedRef.current) {
        setActionError(error instanceof Error ? error.message : 'Не удалось сохранить изменения.');
        if (error instanceof WorkspaceError && error.kind === 'corrupt') setRecoveryRequired(true);
      }
    } finally {
      pendingRef.current = false;
      if (mountedRef.current) {
        setPending(false);
        setLoading(false);
        if (refreshAfterPendingRef.current) {
          refreshAfterPendingRef.current = false;
          void reload(true);
        }
      }
    }
  };

  const recover = () =>
    run(async () => {
      setWorkspace(await restoreWorkspace());
      if (mountedRef.current) {
        setRecoveryRequired(false);
        setLoadError('');
      }
    }, 'Исходные данные восстановлены.');

  return {
    workspace,
    setWorkspace,
    loading,
    loadError,
    reload,
    pending,
    isPending: () => pendingRef.current,
    actionError,
    actionKind,
    setActionError,
    notice,
    setNotice,
    recoveryRequired,
    recover,
    run,
    retry: () => retryRef.current(),
  };
}
