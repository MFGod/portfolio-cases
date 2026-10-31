import { priorityLabels, type Job } from '../domain';
import { Icon } from '../ui';

export function ExportTaskList({ job }: { job: Job }) {
  return (
    <ol className="export-task-list">
      {job.tasks.map((task) => {
        const sent = job.tickets.find((ticket) => ticket.taskId === task.id);
        return (
          <li key={task.id}>
            <div className="export-task-heading">
              <h3>{task.title}</h3>
              {sent && <span className="ticket-id">{sent.id}</span>}
            </div>
            <p className="export-task-meta">
              {task.epic}, {priorityLabels[task.priority].toLowerCase()} приоритет
            </p>
            {task.criteria.length ? (
              <ul className="criteria">
                {task.criteria.map((criterion, index) => (
                  <li key={index}>
                    <Icon name="check" />
                    {criterion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="criteria-status missing">
                <Icon name="warning" />
                Критерии приёмки не указаны
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function TicketLog({ job }: { job: Job }) {
  if (!job.tickets.length) return null;
  return (
    <aside className="ticket-log" aria-labelledby="tickets-title">
      <h2 id="tickets-title">Созданные задачи</h2>
      <ol>
        {job.tickets.map((ticket) => (
          <li key={ticket.id}>
            <span className="ticket-id">{ticket.id}</span>
            <span>{ticket.title}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
