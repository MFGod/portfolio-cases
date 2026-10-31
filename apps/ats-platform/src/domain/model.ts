export const stages = ['Новые', 'Скрининг', 'Интервью', 'Оффер', 'Выход'] as const;
export type Role = 'recruiter' | 'manager';
export type VacancyStatus = 'open' | 'paused' | 'closed';
export type Vacancy = {
  id: string;
  title: string;
  team: string;
  location: string;
  format: string;
  salaryFrom: number;
  salaryTo: number;
  headcount: number;
  manager: string;
  description: string;
  status: VacancyStatus;
  priority: boolean;
};
export type Candidate = {
  id: string;
  vacancyId: string;
  name: string;
  position: string;
  experience: string;
  source: string;
  salary: number;
  tags: string[];
  stage: number;
  reached: number[];
  history: { stage: number; at: string }[];
};
export type Workspace = { vacancies: Vacancy[]; candidates: Candidate[] };
export const statusLabels: Record<VacancyStatus, string> = {
  open: 'В работе',
  paused: 'На паузе',
  closed: 'Закрыта',
};

export type EditorDraft = Omit<Vacancy, 'id'>;
export type FieldErrors = Partial<Record<keyof EditorDraft, string>>;
export const validateVacancy = (draft: EditorDraft): FieldErrors => {
  const next: FieldErrors = {};
  if (typeof draft.title !== 'string' || draft.title.trim().length < 5)
    next.title = 'Введите название от 5 символов.';
  if (typeof draft.team !== 'string' || !draft.team.trim()) next.team = 'Выберите команду.';
  if (typeof draft.location !== 'string' || !draft.location.trim())
    next.location = 'Укажите город.';
  if (typeof draft.manager !== 'string' || !draft.manager.trim())
    next.manager = 'Выберите нанимающего руководителя.';
  if (!Number.isInteger(draft.headcount) || draft.headcount < 1 || draft.headcount > 20)
    next.headcount = 'Укажите целое число от 1 до 20.';
  if (!Number.isFinite(draft.salaryFrom) || draft.salaryFrom <= 0 || draft.salaryFrom > 10000000)
    next.salaryFrom = 'Укажите сумму от 1 до 10 000 000 ₽.';
  if (!Number.isFinite(draft.salaryTo) || draft.salaryTo <= 0 || draft.salaryTo > 10000000)
    next.salaryTo = 'Укажите сумму от 1 до 10 000 000 ₽.';
  else if (draft.salaryTo < draft.salaryFrom)
    next.salaryTo = 'Верхняя граница должна быть не ниже нижней.';
  if (typeof draft.description !== 'string' || draft.description.trim().length < 20)
    next.description = 'Опишите задачи, минимум 20 символов.';
  return next;
};

export const canMove = (role: Role, from: number, to: number) =>
  Number.isInteger(from) &&
  Number.isInteger(to) &&
  from >= 0 &&
  from < stages.length &&
  from !== to &&
  to >= 0 &&
  to < stages.length &&
  (role === 'recruiter' || (role === 'manager' && from >= 2 && to >= 2));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const isStage = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < stages.length;
export const isRole = (value: unknown): value is Role =>
  value === 'recruiter' || value === 'manager';

export const isVacancy = (value: unknown): value is Vacancy => {
  if (!isRecord(value)) return false;
  if (
    !['id', 'title', 'team', 'location', 'format', 'manager', 'description'].every((field) =>
      isText(value[field]),
    )
  )
    return false;
  if (value.status !== 'open' && value.status !== 'paused' && value.status !== 'closed')
    return false;
  if (typeof value.priority !== 'boolean') return false;
  return Object.keys(validateVacancy(value as Vacancy)).length === 0;
};

const isCandidate = (value: unknown): value is Candidate => {
  if (!isRecord(value)) return false;
  if (
    !['id', 'vacancyId', 'name', 'position', 'experience', 'source'].every((field) =>
      isText(value[field]),
    )
  )
    return false;
  if (typeof value.salary !== 'number' || !Number.isFinite(value.salary) || value.salary <= 0)
    return false;
  if (!Array.isArray(value.tags) || !value.tags.every(isText) || !isStage(value.stage))
    return false;
  if (!Array.isArray(value.reached) || !value.reached.every(isStage)) return false;
  const reached = value.reached;
  if (new Set(reached).size !== reached.length) return false;
  const lastReached = Math.max(...reached);
  if (!reached.includes(value.stage) || lastReached + 1 !== reached.length) return false;
  if (!Array.isArray(value.history) || value.history.length === 0) return false;
  if (
    !value.history.every(
      (entry: unknown) =>
        isRecord(entry) &&
        isStage(entry.stage) &&
        reached.includes(entry.stage) &&
        typeof entry.at === 'string' &&
        Number.isFinite(Date.parse(entry.at)),
    )
  )
    return false;
  const lastEntry: unknown = value.history[value.history.length - 1];
  return isRecord(lastEntry) && lastEntry.stage === value.stage;
};

export const isWorkspace = (value: unknown): value is Workspace => {
  if (!isRecord(value) || !Array.isArray(value.vacancies) || !Array.isArray(value.candidates))
    return false;
  if (!value.vacancies.every(isVacancy) || !value.candidates.every(isCandidate)) return false;
  const vacancyIds = new Set(value.vacancies.map((vacancy) => vacancy.id));
  const candidateIds = new Set(value.candidates.map((candidate) => candidate.id));
  return (
    vacancyIds.size === value.vacancies.length &&
    candidateIds.size === value.candidates.length &&
    value.candidates.every((candidate) => vacancyIds.has(candidate.vacancyId))
  );
};
