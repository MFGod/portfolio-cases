import type { createCase } from '@cases/demo-kit';
import { seed, type Job, type Workspace } from '../domain';
import { restoreWorkspace } from '../domain/restore';
import type { Coordination } from './coordination';

export type Kit = ReturnType<typeof createCase>;
export type Storage = ReturnType<typeof workspaceStorage>;

export function workspaceStorage(kit: Kit, coordination: Coordination) {
  let state: Workspace = { jobs: [], selected: '' };
  let selection: string | undefined;
  let error = '';
  const emit = () => listeners.forEach((listener) => listener());
  const listeners = new Set<() => void>();
  const read = () => restoreWorkspace(kit.store.get<unknown>('workspace', seed()));
  function publish(next: Workspace) {
    const selected = next.jobs.some((job) => job.id === selection)
      ? selection!
      : next.selected || next.jobs[0]?.id || '';
    state = { ...next, selected };
    emit();
  }
  async function change(transform: (latest: Workspace) => Workspace) {
    return coordination.exclusive('workspace', () => {
      const next = restoreWorkspace(transform(read()));
      try {
        kit.store.set('workspace', next);
      } catch {
        throw new Error(
          'Не удалось сохранить изменения. Освободите место в хранилище браузера и повторите действие.',
        );
      }
      error = '';
      publish(next);
      return next;
    });
  }
  return {
    read,
    change,
    getError: () => error,
    report(failure: unknown) {
      error = failure instanceof Error ? failure.message : 'Не удалось сохранить изменения.';
      state = { ...state };
      emit();
    },
    refresh: () => publish(read()),
    getSnapshot: () => state,
    current: (id: string) => read().jobs.find((job) => job.id === id),
    update: (id: string, transform: (job: Job) => Job) =>
      change((latest) => ({
        ...latest,
        jobs: latest.jobs.map((job) => (job.id === id ? transform(job) : job)),
      })),
    select(id: string) {
      if (!state.jobs.some((job) => job.id === id)) return;
      selection = id;
      publish(state);
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
