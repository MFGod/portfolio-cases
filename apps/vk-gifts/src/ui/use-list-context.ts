import { useRef, useState } from 'react';
import { kit } from '../model';
import type { Category } from '../features/categories';

export type Sort = 'recent' | 'price-up' | 'price-down';
export type ListContext = { category: Category; sort: Sort };
const emptyList: ListContext = { category: 'all', sort: 'recent' };
const emptyView = { own: emptyList, lev: emptyList, asya: emptyList, search: '' };
type View = typeof emptyView;
const isContext = (value: unknown): value is ListContext => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    ['all', 'home', 'hobby', 'style'].includes(String(item.category)) &&
    ['recent', 'price-up', 'price-down'].includes(String(item.sort))
  );
};
const readView = (): View => {
  try {
    const value = kit.store.get<unknown>('view-context-v1', null);
    if (!value || typeof value !== 'object') return emptyView;
    const item = value as Record<string, unknown>;
    if (
      isContext(item.own) &&
      isContext(item.lev) &&
      isContext(item.asya) &&
      typeof item.search === 'string' &&
      item.search.length <= 100
    )
      return { own: item.own, lev: item.lev, asya: item.asya, search: item.search };
  } catch {
    return emptyView;
  }
  return emptyView;
};
export function useListContext() {
  const [view, setView] = useState(readView);
  const latest = useRef(view);
  const [error, setError] = useState('');
  const commit = (next: View) => {
    latest.current = next;
    setView(next);
    try {
      kit.store.set('view-context-v1', next);
      setError('');
    } catch {
      setError('Фильтры действуют до закрытия страницы: хранилище недоступно.');
    }
  };
  const changeList = (id: string, patch: Partial<ListContext>) => {
    const key = id === 'lev' || id === 'asya' ? id : 'own';
    commit({ ...latest.current, [key]: { ...latest.current[key], ...patch } });
  };
  return {
    view,
    error,
    changeList,
    changeSearch: (search: string) => commit({ ...latest.current, search }),
  };
}
