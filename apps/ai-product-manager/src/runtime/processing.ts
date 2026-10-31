import { active, analyze, type Job, type JobStatus } from '../domain';
import type { Coordination } from './coordination';
import type { Kit, Storage } from './storage';

export function createProcessor(
  kit: Kit,
  storage: Storage,
  coordination: Coordination,
  pause: () => Promise<void>,
) {
  let requested = false;
  let disposed = false;
  const queued = () => [...storage.read().jobs].reverse().find((job) => job.status === 'queued');

  async function process(job: Job) {
    const valid = (latest: Job) => latest.attempt === job.attempt && active(latest.status);
    async function write(transform: (latest: Job) => Job) {
      if (disposed) return false;
      let accepted = false;
      await storage.update(job.id, (latest) => {
        if (!valid(latest)) return latest;
        accepted = true;
        return transform(latest);
      });
      return accepted;
    }
    try {
      for (const [status, message] of [
        ['reading', 'Документ прочитан'],
        ['splitting', 'Требования разделены'],
        ['checking', 'Структура проверена'],
      ] as [JobStatus, string][]) {
        if (!(await write((latest) => ({ ...latest, status })))) return;
        await kit.demo.request(() => true);
        await pause();
        if (!(await write((latest) => ({ ...latest, log: [...latest.log, message] })))) return;
      }
      let tasks;
      try {
        tasks = analyze(job.source);
      } catch (error) {
        await write((latest) => ({
          ...latest,
          status: 'error',
          issue: 'content',
          log: [
            ...latest.log,
            error instanceof Error ? error.message : 'Проверьте текст документа.',
          ],
        }));
        return;
      }
      await write((latest) => ({
        ...latest,
        tasks,
        status: tasks.length ? 'ready' : 'empty',
        issue: tasks.length ? undefined : 'content',
        log: [...latest.log, tasks.length ? 'Готово к проверке' : 'Требования не найдены'],
      }));
    } catch (error) {
      await write((latest) => ({
        ...latest,
        status: 'error',
        issue: 'temporary',
        log: [...latest.log, error instanceof Error ? error.message : 'Ошибка обработки.'],
      }));
    }
  }

  async function run() {
    if (storage.read().jobs.some((job) => active(job.status) && job.status !== 'queued'))
      await storage.change((latest) => ({
        ...latest,
        jobs: latest.jobs.map((job) =>
          active(job.status) && job.status !== 'queued'
            ? { ...job, status: 'queued' as const, log: [...job.log, 'Обработка продолжена'] }
            : job,
        ),
      }));
    let job = queued();
    while (!disposed && job) {
      await process(job);
      job = queued();
    }
  }

  return {
    request() {
      if (requested || disposed || !storage.read().jobs.some((job) => active(job.status))) return;
      requested = true;
      let failed = false;
      void coordination
        .exclusive('processing', run)
        .catch((error: unknown) => {
          failed = true;
          storage.report(error);
        })
        .finally(() => {
          requested = false;
          try {
            if (!disposed && !failed && queued()) this.request();
          } catch {}
        });
    },
    dispose() {
      disposed = true;
    },
  };
}
