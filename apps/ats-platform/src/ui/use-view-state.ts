import { useEffect, useRef, useState } from 'react';
import { readRole, readRoleError, writeRole, type Role } from '../domain/workspace';
import { kit } from '../kit';

type ViewState = {
  selected: string;
  vacancyQuery: string;
  vacancyStatus: 'all' | 'open' | 'paused' | 'closed';
  pipelineQuery: string;
  pipelineStage: number | 'all';
  reportFilter: string;
};
const defaults: ViewState = {
  selected: 'v1',
  vacancyQuery: '',
  vacancyStatus: 'all',
  pipelineQuery: '',
  pipelineStage: 'all',
  reportFilter: 'all',
};
const isView = (value: unknown): value is ViewState => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    ['selected', 'vacancyQuery', 'pipelineQuery', 'reportFilter'].every(
      (key) => typeof item[key] === 'string' && item[key].length <= 200,
    ) &&
    ['all', 'open', 'paused', 'closed'].includes(String(item.vacancyStatus)) &&
    (item.pipelineStage === 'all' ||
      (Number.isInteger(item.pipelineStage) &&
        Number(item.pipelineStage) >= 0 &&
        Number(item.pipelineStage) <= 4))
  );
};
const readView = (): ViewState => {
  try {
    const saved = kit.store.get<unknown>('view-context-v1', null);
    if (isView(saved)) return saved;
    const selected = kit.store.get<unknown>('selected-vacancy', 'v1');
    return { ...defaults, selected: typeof selected === 'string' ? selected : 'v1' };
  } catch {
    return defaults;
  }
};

export function useViewState() {
  const [view, setView] = useState(readView);
  const viewRef = useRef(view);
  const [role, setRole] = useState<Role>(readRole);
  const [error, setError] = useState(readRoleError);
  useEffect(() => {
    const syncRole = (event: StorageEvent) => {
      if (event.key !== null && event.key !== `${kit.slug}:role`) return;
      setRole(readRole());
      setError(readRoleError());
    };
    window.addEventListener('storage', syncRole);
    return () => window.removeEventListener('storage', syncRole);
  }, []);
  const change = (patch: Partial<ViewState>) => {
    const next = { ...viewRef.current, ...patch };
    viewRef.current = next;
    setView(next);
    try {
      kit.store.set('view-context-v1', next);
    } catch {
      setError('Фильтры действуют до закрытия страницы: хранилище недоступно.');
    }
  };
  const changeRole = (next: Role) => {
    try {
      writeRole(next);
      setRole(next);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось сохранить роль.');
    }
  };
  return { view, change, role, changeRole, error };
}
