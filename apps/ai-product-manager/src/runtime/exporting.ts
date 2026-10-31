import { missingCriteria, type Ticket } from '../domain';
import type { Coordination } from './coordination';
import type { Kit, Storage } from './storage';

const interrupted = 'Передача прервалась. Продолжите её, чтобы передать оставшиеся задачи.';

export function createExporter(kit: Kit, storage: Storage, coordination: Coordination) {
  async function recover() {
    for (const job of storage.read().jobs.filter((item) => item.exportStatus === 'pending')) {
      await coordination.ifAvailable(`export:${job.id}`, () =>
        storage.update(job.id, (latest) =>
          latest.exportStatus === 'pending'
            ? { ...latest, exportStatus: 'error', exportError: interrupted }
            : latest,
        ),
      );
    }
  }
  async function transfer(id: string, allowMissing = false) {
    return coordination.exclusive(`export:${id}`, async () => {
      const job = storage.current(id);
      if (!job || job.status !== 'ready') throw new Error('Документ ещё не готов к передаче.');
      if (job.exportStatus === 'done') return;
      await storage.update(id, (latest) => {
        if (!latest.tasks.length) throw new Error('В документе нет задач для передачи.');
        if (missingCriteria(latest).length && !allowMissing && !latest.missingAccepted)
          throw new Error('Подтвердите передачу задач без критериев приёмки.');
        return {
          ...latest,
          exportStatus: 'pending',
          exportError: '',
          missingAccepted:
            missingCriteria(latest).length > 0 && (allowMissing || !!latest.missingAccepted),
        };
      });
      try {
        for (const task of storage.current(id)?.tasks ?? []) {
          if (storage.current(id)?.tickets.some((ticket) => ticket.taskId === task.id)) continue;
          await kit.demo.request(() => true);
          await storage.change((workspace) => {
            const latest = workspace.jobs.find((item) => item.id === id)!;
            if (latest.tickets.some((ticket) => ticket.taskId === task.id)) return workspace;
            const maximum = workspace.jobs.reduce(
              (max, item) =>
                item.tickets.reduce((value, ticket) => {
                  const number = /^ORB-(\d+)$/.exec(ticket.id);
                  return number ? Math.max(value, Number(number[1])) : value;
                }, max),
              100,
            );
            const ticket: Ticket = {
              taskId: task.id,
              id: `ORB-${maximum + 1}`,
              title: task.title,
              epic: task.epic,
              priority: task.priority,
              criteria: [...task.criteria],
            };
            return {
              ...workspace,
              jobs: workspace.jobs.map((item) =>
                item.id === id ? { ...item, tickets: [...item.tickets, ticket] } : item,
              ),
            };
          });
        }
        await storage.update(id, (latest) => ({
          ...latest,
          exportStatus: 'done',
          exportError: '',
        }));
      } catch (error) {
        await storage.update(id, (latest) => ({
          ...latest,
          exportStatus: 'error',
          exportError: error instanceof Error ? error.message : 'Не удалось передать задачи.',
        }));
      }
    });
  }
  return { recover, transfer };
}
