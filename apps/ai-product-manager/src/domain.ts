import { analyze } from './domain/parser';

export { analyze };

export type Priority = 'high' | 'medium' | 'low';
export type Task = {
  id: string;
  epic: string;
  title: string;
  criteria: string[];
  priority: Priority;
  source?: { start: number; end: number };
  version?: number;
};
export type JobStatus =
  'queued' | 'reading' | 'splitting' | 'checking' | 'ready' | 'error' | 'cancelled' | 'empty';
export type Ticket = {
  taskId: string;
  id: string;
  title: string;
  epic: string;
  priority: Priority;
  criteria: string[];
};
export type Job = {
  id: string;
  title: string;
  source: string;
  filename: string;
  created: string;
  status: JobStatus;
  attempt: number;
  tasks: Task[];
  log: string[];
  tickets: Ticket[];
  exportStatus: 'idle' | 'pending' | 'error' | 'done';
  exportError: string;
  issue?: 'content' | 'temporary';
  missingAccepted?: boolean;
};
export type Workspace = { jobs: Job[]; selected: string };

export const example = `# Коворкинг

## Бронирование
- Показывать свободные рабочие места на выбранную дату.
- Позволять участнику забронировать место на два часа.
  Критерий: после бронирования место исчезает из списка свободных.
- При занятом месте показывать сообщение и предлагать другое время.

## Мои записи
- Показывать список предстоящих бронирований участника.
- Разрешать отмену бронирования до начала встречи.
  Критерий: после отмены место снова доступно для бронирования.`;

export const statusLabels: Record<JobStatus, string> = {
  queued: 'В очереди',
  reading: 'Чтение документа',
  splitting: 'Разбор требований',
  checking: 'Проверка структуры',
  ready: 'Готово к проверке',
  error: 'Ошибка обработки',
  cancelled: 'Отменено',
  empty: 'Нет требований',
};
export const priorityLabels: Record<Priority, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};
export const active = (status: JobStatus) =>
  ['queued', 'reading', 'splitting', 'checking'].includes(status);

export function seed(): Workspace {
  const ready: Job = {
    id: 'sample-workshop',
    title: 'Бронирование рабочих мест',
    source: example,
    filename: 'workshop.md',
    created: '2026-10-22T09:30:00',
    status: 'ready',
    attempt: 1,
    tasks: analyze(example),
    log: [
      'Документ поставлен в очередь',
      'Документ прочитан',
      'Требования разделены',
      'Структура проверена',
      'Готово к проверке',
    ],
    tickets: [],
    exportStatus: 'idle',
    exportError: '',
  };
  return {
    jobs: [
      ready,
      {
        ...ready,
        id: 'sample-cancelled',
        title: 'Каталог материалов',
        source: '## Каталог\n- Показывать доступные материалы с фильтром по типу.',
        filename: 'catalog.txt',
        status: 'cancelled',
        tasks: [],
        log: ['Документ поставлен в очередь', 'Обработка отменена'],
      },
    ],
    selected: ready.id,
  };
}

export function missingCriteria(job: Job): Task[] {
  return job.tasks.filter((task) => !task.criteria.some((criterion) => criterion.trim()));
}

export function canEdit(job: Job): boolean {
  return (
    job.status === 'ready' &&
    job.tickets.length === 0 &&
    job.exportStatus !== 'pending' &&
    job.exportStatus !== 'done'
  );
}

export function markdown(job: Job): string {
  const groups = new Map<string, Task[]>();
  for (const task of job.tasks) {
    const group = groups.get(task.epic) ?? [];
    group.push(task);
    groups.set(task.epic, group);
  }
  const sections = [...groups].map(([epic, tasks]) => {
    const content = tasks.map((task) => {
      const criteria = task.criteria.filter((criterion) => criterion.trim());
      return (
        `### ${task.title}\n\nПриоритет: ${priorityLabels[task.priority]}\n\n` +
        (criteria.length
          ? criteria.map((criterion) => `- [ ] ${criterion}`).join('\n')
          : 'Критерии приёмки не указаны.')
      );
    });
    return `## ${epic}\n\n${content.join('\n\n')}`;
  });
  return `# ${job.title}\n\n${sections.join('\n\n')}`;
}
