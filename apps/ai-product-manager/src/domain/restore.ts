import { analyze, type Job, type Task, type Ticket, type Workspace } from '../domain';
import { choice, integer, invalid, list, record, string, unique } from './validation';

const priorities = ['high', 'medium', 'low'] as const;
const statuses = [
  'queued',
  'reading',
  'splitting',
  'checking',
  'ready',
  'error',
  'cancelled',
  'empty',
] as const;
const exportStatuses = ['idle', 'pending', 'error', 'done'] as const;

function readContent(raw: unknown, path: string) {
  const value = record(raw, path);
  return {
    ...value,
    id: string(value.id, `${path}.id`, true),
    title: string(value.title, `${path}.title`, true),
    epic: string(value.epic, `${path}.epic`, true),
    priority: choice(value.priority, priorities, `${path}.priority`),
    criteria: list(value.criteria, `${path}.criteria`, string),
  };
}

function readTask(raw: unknown, path: string, source: string, original?: Task): Task {
  const value = record(raw, path);
  const content = readContent(value, path);
  const version = value.version === undefined ? 0 : integer(value.version, `${path}.version`);
  let range = original?.source;
  if (value.source !== undefined) {
    const saved = record(value.source, `${path}.source`);
    const start = integer(saved.start, `${path}.source.start`);
    const end = integer(saved.end, `${path}.source.end`);
    if (end <= start || end > source.length) invalid(`${path}.source: неверный диапазон`);
    range = { start, end };
  }
  const generated = new Set(
    [content.title, original?.title]
      .filter((title) => title !== undefined)
      .map((title) => `Проверить выполнение требования: ${title}`),
  );
  const criteria = content.criteria.filter(
    (criterion) =>
      version > 0 || !generated.has(criterion) || original?.criteria.includes(criterion),
  );
  return { ...content, criteria, source: range, version };
}

function readTicket(raw: unknown, path: string): Ticket {
  const value = record(raw, path);
  return { ...readContent(value, path), taskId: string(value.taskId, `${path}.taskId`, true) };
}

function originalTasks(source: string): Map<string, Task> {
  try {
    return new Map(analyze(source).map((task) => [task.id, task]));
  } catch {
    return new Map();
  }
}

function readJob(raw: unknown, path: string): Job {
  const value = record(raw, path);
  const source = string(value.source, `${path}.source`);
  const original = originalTasks(source);
  const tasks = list(value.tasks, `${path}.tasks`, (task, taskPath) => {
    const id = record(task, taskPath).id;
    return readTask(task, taskPath, source, typeof id === 'string' ? original.get(id) : undefined);
  });
  const tickets = list(value.tickets, `${path}.tickets`, readTicket);
  unique(tasks, (task) => task.id, `${path}.tasks`);
  unique(tickets, (ticket) => ticket.id, `${path}.tickets`);
  const issue =
    value.issue === undefined
      ? undefined
      : choice(value.issue, ['content', 'temporary'], `${path}.issue`);
  if (value.missingAccepted !== undefined && typeof value.missingAccepted !== 'boolean')
    invalid(`${path}.missingAccepted`);
  return {
    ...value,
    id: string(value.id, `${path}.id`, true),
    title: string(value.title, `${path}.title`, true),
    source,
    filename: string(value.filename, `${path}.filename`),
    created: string(value.created, `${path}.created`, true),
    status: choice(value.status, statuses, `${path}.status`),
    attempt: integer(value.attempt, `${path}.attempt`),
    tasks,
    log: list(value.log, `${path}.log`, string),
    tickets,
    exportStatus: choice(value.exportStatus, exportStatuses, `${path}.exportStatus`),
    exportError: string(value.exportError, `${path}.exportError`),
    issue,
    missingAccepted: value.missingAccepted,
  };
}

export function restoreWorkspace(raw: unknown): Workspace {
  const value = record(raw, 'рабочая область');
  const jobs = list(value.jobs, 'документы', readJob);
  unique(jobs, (job) => job.id, 'документы');
  const selected = string(value.selected, 'выбранный документ');
  if (selected && !jobs.some((job) => job.id === selected)) invalid('выбранный документ не найден');
  return { ...value, jobs, selected };
}
