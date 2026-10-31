import { active, canEdit, type Job, type Task } from './domain';
import { browserCoordination, type Coordination } from './runtime/coordination';
import { createExporter } from './runtime/exporting';
import { createProcessor } from './runtime/processing';
import { workspaceStorage, type Kit } from './runtime/storage';

type Options = { coordination?: Coordination; pause?: () => Promise<void> };
const recoverable = (job: Job) => ['error', 'cancelled', 'empty'].includes(job.status);

function documentInput(title: string, source: string, filename: string) {
  if (!title.trim() || title.trim().length > 100)
    throw new Error('Укажите название до 100 символов.');
  if (source.trim().length < 10 || source.length > 50_000 || source.includes('\0'))
    throw new Error('Добавьте текст требований от 10 до 50 000 символов.');
  if (filename.length > 255) throw new Error('Сократите имя файла до 255 символов.');
  return { title: title.trim(), source, filename };
}

export function createWorkspace(kit: Kit, options: Options = {}) {
  const coordination = options.coordination ?? browserCoordination(kit.slug);
  const storage = workspaceStorage(kit, coordination);
  const processor = createProcessor(
    kit,
    storage,
    coordination,
    options.pause ?? (() => new Promise((resolve) => setTimeout(resolve, 250))),
  );
  const exporter = createExporter(kit, storage, coordination);
  let loaded = false;
  let disposed = false;
  const unsubscribe = coordination.subscribe(() => {
    if (!loaded || disposed) return;
    try {
      storage.refresh();
      processor.request();
    } catch (error) {
      storage.report(error);
    }
  });

  async function requeue(id: string, input?: ReturnType<typeof documentInput>) {
    await storage.update(id, (job) => {
      if (!recoverable(job) || job.tickets.length)
        throw new Error('Этот документ нельзя отправить повторно.');
      if (!input && (job.status === 'empty' || job.issue === 'content'))
        throw new Error('Исправьте текст документа перед повторной обработкой.');
      return {
        ...job,
        ...input,
        status: 'queued',
        issue: undefined,
        attempt: job.attempt + 1,
        tasks: [],
        missingAccepted: false,
        log: [
          ...job.log,
          input ? 'Текст исправлен, документ поставлен в очередь' : 'Повторная попытка',
        ],
      };
    });
    processor.request();
  }

  return {
    subscribe: storage.subscribe,
    getSnapshot: storage.getSnapshot,
    getError: storage.getError,
    async load() {
      if (disposed) return;
      await kit.demo.request(() => true);
      await storage.change((latest) => latest);
      loaded = true;
      await exporter.recover();
      processor.request();
    },
    select: storage.select,
    async submit(title: string, source: string, filename: string) {
      const input = documentInput(title, source, filename);
      const job = await kit.demo.request<Job>(() => ({
        ...input,
        id: crypto.randomUUID(),
        created: new Date().toISOString(),
        status: 'queued',
        attempt: 1,
        tasks: [],
        log: ['Документ поставлен в очередь'],
        tickets: [],
        exportStatus: 'idle',
        exportError: '',
      }));
      await storage.change((latest) => {
        if (latest.jobs.length >= 30) throw new Error('В очереди уже 30 документов.');
        return { jobs: [job, ...latest.jobs], selected: job.id };
      });
      storage.select(job.id);
      processor.request();
      return job.id;
    },
    async cancel(id: string) {
      await storage.update(id, (job) =>
        active(job.status)
          ? { ...job, status: 'cancelled', log: [...job.log, 'Обработка отменена'] }
          : job,
      );
    },
    retry: (id: string) => requeue(id),
    revise: (id: string, title: string, source: string, filename: string) =>
      requeue(id, documentInput(title, source, filename)),
    async saveTask(id: string, edited: Task) {
      if (
        !edited.title.trim() ||
        !edited.epic.trim() ||
        !['high', 'medium', 'low'].includes(edited.priority) ||
        !Array.isArray(edited.criteria) ||
        edited.criteria.some((value) => typeof value !== 'string')
      )
        throw new Error('Проверьте название, эпик и критерии задачи.');
      const saved = await kit.demo.request(() => structuredClone(edited));
      await storage.update(id, (job) => {
        if (!canEdit(job)) throw new Error('Передача уже началась. Версия задач зафиксирована.');
        const current = job.tasks.find((task) => task.id === saved.id);
        if (!current) throw new Error('Задача больше не найдена в документе.');
        if ((current.version ?? 0) !== (saved.version ?? 0))
          throw new Error(
            'Эту задачу изменили в другой вкладке. Ваш текст сохранён в редакторе. Скопируйте его и откройте актуальную версию.',
          );
        return {
          ...job,
          missingAccepted: false,
          tasks: job.tasks.map((task) =>
            task.id === saved.id
              ? {
                  ...task,
                  title: saved.title.trim(),
                  epic: saved.epic.trim(),
                  priority: saved.priority,
                  criteria: saved.criteria.map((value) => value.trim()).filter(Boolean),
                  version: (task.version ?? 0) + 1,
                }
              : task,
          ),
        };
      });
    },
    exportJob: exporter.transfer,
    dispose() {
      disposed = true;
      loaded = false;
      unsubscribe();
      processor.dispose();
    },
  };
}

export type WorkspaceRuntime = ReturnType<typeof createWorkspace>;
