import { canMove, isRole, isVacancy, isWorkspace, validateVacancy } from './model';
import type { Role, Vacancy, Workspace } from './model';
import { makeSeed } from './seed';

export const workspaceKey = 'workspace-v1';
export type WorkspaceErrorKind = 'corrupt' | 'storage' | 'role' | 'conflict' | 'locking';
export class WorkspaceError extends Error {
  constructor(
    public readonly kind: WorkspaceErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'WorkspaceError';
  }
}

export type WorkspaceStore = {
  get: <T>(key: string, fallback: T) => T;
  set: (key: string, value: unknown) => void;
};
export type WorkspaceLock = <T>(operation: () => T) => Promise<T>;

export const withWorkspaceLock: WorkspaceLock = async (operation) => {
  if (typeof navigator === 'undefined' || !navigator.locks)
    throw new WorkspaceError(
      'locking',
      'Безопасное сохранение недоступно в этом браузере. Откройте приложение в актуальном браузере.',
    );
  return navigator.locks.request('ats-platform:workspace-v1', { mode: 'exclusive' }, operation);
};

const sameVacancy = (left: Vacancy | undefined, right: Vacancy | undefined) => {
  if (!left || !right) return left === right;
  return (
    (Object.keys(left) as (keyof Vacancy)[]).every((key) => left[key] === right[key]) &&
    Object.keys(left).length === Object.keys(right).length
  );
};

export const createWorkspaceRepository = (store: WorkspaceStore, lock: WorkspaceLock) => {
  let roleError = '';
  const read = <T>(key: string, fallback: T): unknown => {
    try {
      return store.get<unknown>(key, fallback);
    } catch {
      throw new WorkspaceError('storage', 'Не удалось прочитать сохранённые данные.');
    }
  };
  const write = (key: string, value: unknown) => {
    try {
      store.set(key, value);
    } catch {
      throw new WorkspaceError(
        'storage',
        'Не удалось сохранить данные. Проверьте доступ к хранилищу.',
      );
    }
  };
  const load = (): Workspace => {
    const value = read(workspaceKey, undefined);
    if (value === undefined) return makeSeed();
    if (!isWorkspace(value))
      throw new WorkspaceError('corrupt', 'Сохранённые данные повреждены. Изменения не внесены.');
    return value;
  };
  const strictRole = (): Role => {
    const role = read('role', 'recruiter');
    if (!isRole(role))
      throw new WorkspaceError('role', 'Сохранённая роль повреждена. Выберите роль повторно.');
    return role;
  };
  const readRole = (): Role => {
    try {
      const role = strictRole();
      roleError = '';
      return role;
    } catch (error) {
      roleError = error instanceof Error ? error.message : 'Не удалось прочитать роль.';
      return 'manager';
    }
  };
  const readRoleError = () => {
    readRole();
    return roleError;
  };
  const writeRole = (role: Role) => {
    if (!isRole(role)) throw new WorkspaceError('role', 'Выберите доступную роль.');
    write('role', role);
    roleError = '';
  };
  const saveVacancy = (base: Workspace, vacancy: Vacancy) =>
    lock(() => {
      const current = load();
      if (strictRole() !== 'recruiter')
        throw new Error('Создавать и редактировать вакансии может рекрутер.');
      const validation = validateVacancy(vacancy);
      if (Object.keys(validation).length) throw new Error(Object.values(validation)[0]);
      if (!isVacancy(vacancy)) throw new Error('Проверьте поля вакансии.');
      const original = base.vacancies.find((item) => item.id === vacancy.id);
      const stored = current.vacancies.find((item) => item.id === vacancy.id);
      if (!sameVacancy(original, stored))
        throw new WorkspaceError(
          'conflict',
          'Вакансия изменена в другой вкладке. Откройте её заново перед сохранением.',
        );
      const next = {
        ...current,
        vacancies: stored
          ? current.vacancies.map((item) => (item.id === vacancy.id ? vacancy : item))
          : [vacancy, ...current.vacancies],
      };
      write(workspaceKey, next);
      return next;
    });
  const moveCandidate = (base: Workspace, id: string, stage: number) =>
    lock(() => {
      const current = load();
      const role = strictRole();
      const original = base.candidates.find((item) => item.id === id);
      const candidate = current.candidates.find((item) => item.id === id);
      if (!original || !candidate || !canMove(role, original.stage, stage))
        throw new Error('Этот переход недоступен для выбранной роли.');
      const vacancy = current.vacancies.find((item) => item.id === candidate.vacancyId);
      if (vacancy?.status !== 'open')
        throw new Error('Подбор приостановлен. Рекрутер может изменить статус вакансии.');
      if (candidate.stage === stage) return current;
      if (
        candidate.stage !== original.stage ||
        JSON.stringify(candidate.history) !== JSON.stringify(original.history)
      )
        throw new WorkspaceError(
          'conflict',
          'Этап кандидата изменён в другой вкладке. Откройте его заново.',
        );
      if (!canMove(role, candidate.stage, stage))
        throw new Error('Этот переход недоступен для выбранной роли.');
      const next = {
        ...current,
        candidates: current.candidates.map((item) =>
          item.id === id
            ? {
                ...item,
                stage,
                reached: Array.from(
                  new Set([
                    ...item.reached,
                    ...Array.from({ length: stage + 1 }, (_, index) => index),
                  ]),
                ).sort((left, right) => left - right),
                history: [...item.history, { stage, at: new Date().toISOString() }],
              }
            : item,
        ),
      };
      write(workspaceKey, next);
      return next;
    });
  const restoreWorkspace = () =>
    lock(() => {
      const next = makeSeed();
      write(workspaceKey, next);
      return next;
    });
  return { load, readRole, readRoleError, writeRole, saveVacancy, moveCandidate, restoreWorkspace };
};
