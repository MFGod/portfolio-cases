import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { createCase } from '@cases/demo-kit';
import { categories, type CategoryKey } from './tickets.js';
import { HistoryError, remainingCount, type HistoryFailure, type Pick } from './domain/history.js';
import { createHistoryRepository, type RunLocked } from './domain/repository.js';
import { historyCsv } from './domain/csv.js';

export type { Pick } from './domain/history.js';
type CaseKit = ReturnType<typeof createCase>;
type Operation = 'draw' | 'undo' | 'recover' | 'export';

export const useDraw = (kit: CaseKit, category: CategoryKey) => {
  const [history, setHistory] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<HistoryFailure | null>(null);
  const [lastOperation, setLastOperation] = useState<Operation | 'load'>('load');
  const [notice, setNotice] = useState('');
  const disposed = useRef(false);
  const refreshId = useRef(0);
  const requestedCategory = useRef(category);
  const undoTarget = useRef<Pick | null>(null);
  const repositoryRef = useRef<ReturnType<typeof createHistoryRepository> | null>(null);

  if (repositoryRef.current === null) {
    const runLocked: RunLocked = async (resolve) => {
      if (!navigator.locks) throw new HistoryError('locks');
      return navigator.locks.request('prize-randomizer:history', resolve);
    };
    repositoryRef.current = createHistoryRepository({
      store: kit.store,
      runLocked,
      request: kit.demo.request,
    });
  }
  const repository = repositoryRef.current;
  const current = history[0] ?? null;
  const pending = loading || operation !== null;
  const available = remainingCount(history, category);
  const range = categories[category];

  const reportError = (caught: unknown) => {
    setFailure(caught instanceof HistoryError ? caught.code : null);
    setError(
      caught instanceof HistoryError ? caught.message : 'Не удалось завершить действие. Повторите.',
    );
  };
  const clearError = () => {
    setError(null);
    setFailure(null);
  };

  const load = async (background = false) => {
    if (operation) return;
    const requestId = ++refreshId.current;
    if (!background) {
      setLastOperation('load');
      setLoading(true);
      clearError();
    }
    try {
      const next = await kit.demo.request(repository.read);
      if (!disposed.current && requestId === refreshId.current) {
        const changed = JSON.stringify(history) !== JSON.stringify(next);
        setHistory(next);
        if (background && lastOperation === 'load') clearError();
        if (background && changed) setNotice('История обновлена в другой вкладке.');
      }
    } catch (caught) {
      if (!disposed.current && requestId === refreshId.current) {
        if (background && error && lastOperation !== 'load') return;
        setLastOperation('load');
        reportError(caught);
      }
    } finally {
      if (!disposed.current && requestId === refreshId.current) setLoading(false);
    }
  };

  const change = async (
    kind: Operation,
    resolve: () => Promise<Pick[]>,
  ): Promise<Pick[] | undefined> => {
    if (pending) return undefined;
    ++refreshId.current;
    setOperation(kind);
    setLastOperation(kind);
    setNotice('');
    clearError();
    try {
      const next = await resolve();
      if (disposed.current) return undefined;
      setHistory(next);
      setNotice(
        kind === 'draw'
          ? 'Билет выбран и сохранён.'
          : kind === 'undo'
            ? 'Последний выбор отменён. Билет снова участвует.'
            : 'История восстановлена.',
      );
      return next;
    } catch (caught) {
      if (!disposed.current) {
        reportError(caught);
        if (caught instanceof HistoryError && caught.code === 'conflict') {
          try {
            setHistory(repository.read());
          } catch {}
        }
      }
      return undefined;
    } finally {
      if (!disposed.current) setOperation(null);
    }
  };

  const draw = () => {
    if (pending) return undefined;
    requestedCategory.current = category;
    return change('draw', () => repository.draw(requestedCategory.current));
  };
  const undoLast = (target: Pick | null = current) => {
    if (pending || !target) return undefined;
    undoTarget.current = target;
    return change('undo', () => repository.undo(target));
  };
  const recover = () => change('recover', repository.recover);
  const downloadCsv = async () => {
    if (pending) return;
    ++refreshId.current;
    setOperation('export');
    setLastOperation('export');
    clearError();
    setNotice('');
    try {
      const next = await kit.demo.request(repository.read);
      if (disposed.current) return;
      setHistory(next);
      const url = URL.createObjectURL(
        new Blob([historyCsv(next)], { type: 'text/csv;charset=utf-8' }),
      );
      const link = Object.assign(document.createElement('a'), {
        href: url,
        download: 'prize-draw-history.csv',
      });
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('История выгружена в CSV.');
    } catch (caught) {
      if (!disposed.current) reportError(caught);
    } finally {
      if (!disposed.current) setOperation(null);
    }
  };
  const retry = () => {
    if (lastOperation === 'draw') {
      return change('draw', () => repository.draw(requestedCategory.current));
    }
    if (lastOperation === 'undo') return undoLast(undoTarget.current);
    if (lastOperation === 'recover') return recover();
    if (lastOperation === 'export') return downloadCsv();
    return load();
  };

  const loadEvent = useEffectEvent(load);
  const syncEvent = useEffectEvent(() => {
    if (!pending) void load(true);
  });

  useEffect(() => {
    disposed.current = false;
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'prize-randomizer:history') syncEvent();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncEvent();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', syncEvent);
    document.addEventListener('visibilitychange', onVisibility);
    void loadEvent();
    return () => {
      disposed.current = true;
      ++refreshId.current;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', syncEvent);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return {
    history,
    current,
    pending,
    loading,
    operation,
    error,
    failure,
    notice,
    available,
    range,
    draw,
    undoLast,
    downloadCsv,
    load,
    recover,
    retry,
  };
};

export type DrawController = ReturnType<typeof useDraw>;
