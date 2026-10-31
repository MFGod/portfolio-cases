import type { Job } from '../domain';
import { workspace } from '../kit';
import { Icon, outline } from '../ui';
import logo from '../assets/logo.webp';

export function Sidebar({ jobs, selected }: { jobs: Job[]; selected?: Job }) {
  return (
    <header className="sidebar">
      <a href="#/review" className="brand">
        <img className="brand-mark" src={logo} alt="" />
        <span className="brand-name">Контур задач</span>
      </a>
      <a href="#/analyze" className="button secondary new-document">
        <Icon name="plus" />
        Новый документ
      </a>
      <nav className="document-nav" aria-label="Документы">
        {jobs.map((job) => (
          <a
            key={job.id}
            href={'#/review/' + job.id}
            aria-current={selected?.id === job.id ? 'true' : undefined}
            onClick={() => workspace.select(job.id)}
          >
            <span>{job.title}</span>
            <small>
              {job.exportStatus === 'done'
                ? 'Передано в трекер'
                : job.status === 'ready'
                  ? outline(job)
                  : job.status === 'cancelled'
                    ? 'Разбор отменён'
                    : job.status === 'empty'
                      ? 'Нужны требования'
                      : job.status === 'error'
                        ? 'Нужна проверка'
                        : 'Обрабатывается'}
            </small>
          </a>
        ))}
      </nav>
    </header>
  );
}
