import { computed, onBeforeUnmount, ref, type Ref } from 'vue';
import type { createCase } from '@cases/demo-kit';
import { categories, type CategoryKey } from './tickets.js';
import { HistoryError, remainingCount, type HistoryFailure, type Pick } from './domain/history.js';
import { createHistoryRepository, type RunLocked } from './domain/repository.js';
import { historyCsv } from './domain/csv.js';

export type { Pick } from './domain/history.js';
type CaseKit = ReturnType<typeof createCase>;
type Operation = 'draw' | 'undo' | 'recover' | 'export';

export const useDraw = (kit: CaseKit, category: Ref<CategoryKey>) => {
  const history = ref<Pick[]>([]);
  const current = computed(() => history.value[0] ?? null);
  const loading = ref(true);
  const operation = ref<Operation | null>(null);
  const pending = computed(() => loading.value || operation.value !== null);
  const error = ref<string | null>(null);
  const failure = ref<HistoryFailure | null>(null);
  const lastOperation = ref<Operation | 'load'>('load');
  const notice = ref('');
  let disposed = false;
  let refreshId = 0;
  let requestedCategory = category.value;
  let undoTarget: Pick | null = null;

  const runLocked: RunLocked = async (resolve) => {
    if (!navigator.locks) throw new HistoryError('locks');
    return navigator.locks.request('prize-randomizer:history', resolve);
  };
  const repository = createHistoryRepository({
    store: kit.store,
    runLocked,
    request: kit.demo.request,
  });
  const available = computed(() => remainingCount(history.value, category.value));
  const range = computed(() => categories[category.value]);

  const reportError = (caught: unknown) => {
    failure.value = caught instanceof HistoryError ? caught.code : null;
    error.value =
      caught instanceof HistoryError ? caught.message : 'Не удалось завершить действие. Повторите.';
  };
  const clearError = () => {
    error.value = null;
    failure.value = null;
  };

  const load = async (background = false) => {
    if (operation.value) return;
    const requestId = ++refreshId;
    if (!background) {
      lastOperation.value = 'load';
      loading.value = true;
      clearError();
    }
    try {
      const next = await kit.demo.request(repository.read);
      if (!disposed && requestId === refreshId) {
        const changed = JSON.stringify(history.value) !== JSON.stringify(next);
        history.value = next;
        if (background && lastOperation.value === 'load') clearError();
        if (background && changed) notice.value = 'История обновлена в другой вкладке.';
      }
    } catch (caught) {
      if (!disposed && requestId === refreshId) {
        if (background && error.value && lastOperation.value !== 'load') return;
        lastOperation.value = 'load';
        reportError(caught);
      }
    } finally {
      if (!disposed && requestId === refreshId) loading.value = false;
    }
  };

  const change = async (kind: Operation, resolve: () => Promise<Pick[]>) => {
    if (pending.value) return;
    ++refreshId;
    operation.value = kind;
    lastOperation.value = kind;
    notice.value = '';
    clearError();
    try {
      const next = await resolve();
      if (disposed) return;
      history.value = next;
      notice.value =
        kind === 'draw'
          ? 'Билет выбран и сохранён.'
          : kind === 'undo'
            ? 'Последний выбор отменён. Билет снова участвует.'
            : 'История восстановлена.';
    } catch (caught) {
      if (!disposed) {
        reportError(caught);
        if (caught instanceof HistoryError && caught.code === 'conflict') {
          try {
            history.value = repository.read();
          } catch {}
        }
      }
    } finally {
      if (!disposed) operation.value = null;
    }
  };

  const draw = () => {
    if (pending.value) return;
    requestedCategory = category.value;
    return change('draw', () => repository.draw(requestedCategory));
  };
  const undoLast = (target: Pick | null = current.value) => {
    if (pending.value || !target) return;
    undoTarget = target;
    return change('undo', () => repository.undo(target));
  };
  const recover = () => change('recover', repository.recover);
  const downloadCsv = async () => {
    if (pending.value) return;
    ++refreshId;
    operation.value = 'export';
    lastOperation.value = 'export';
    clearError();
    notice.value = '';
    try {
      const next = await kit.demo.request(repository.read);
      if (disposed) return;
      history.value = next;
      const url = URL.createObjectURL(
        new Blob([historyCsv(next)], { type: 'text/csv;charset=utf-8' }),
      );
      const link = Object.assign(document.createElement('a'), {
        href: url,
        download: 'prize-draw-history.csv',
      });
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notice.value = 'История выгружена в CSV.';
    } catch (caught) {
      if (!disposed) reportError(caught);
    } finally {
      if (!disposed) operation.value = null;
    }
  };
  const retry = () => {
    if (lastOperation.value === 'draw')
      return change('draw', () => repository.draw(requestedCategory));
    if (lastOperation.value === 'undo') return undoLast(undoTarget);
    if (lastOperation.value === 'recover') return recover();
    if (lastOperation.value === 'export') return downloadCsv();
    return load();
  };

  const sync = () => {
    if (!pending.value) void load(true);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === 'prize-randomizer:history') sync();
  };
  const onVisibility = () => {
    if (document.visibilityState === 'visible') sync();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener('focus', sync);
  document.addEventListener('visibilitychange', onVisibility);
  onBeforeUnmount(() => {
    disposed = true;
    ++refreshId;
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('focus', sync);
    document.removeEventListener('visibilitychange', onVisibility);
  });
  void load();

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
