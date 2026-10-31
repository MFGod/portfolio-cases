import { active, type Job } from '../domain';

const titles = ['Текст', 'Разбор', 'Проверка', 'Передача'];

function currentStep(job: Job | undefined, sending: boolean) {
  if (!job) return 0;
  if (job.exportStatus === 'done') return titles.length;
  if (active(job.status) || job.status !== 'ready') return 1;
  return sending ? 3 : 2;
}

export function Steps({ job, sending = false }: { job?: Job; sending?: boolean }) {
  const current = currentStep(job, sending);
  return (
    <ol className="steps" aria-label="Путь документа">
      {titles.map((title, index) => (
        <li
          key={title}
          data-state={index < current ? 'done' : index === current ? 'current' : 'todo'}
          aria-current={index === current ? 'step' : undefined}
        >
          <span>{title}</span>
        </li>
      ))}
    </ol>
  );
}
