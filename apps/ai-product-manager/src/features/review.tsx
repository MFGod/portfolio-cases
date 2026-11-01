import { useState } from 'react';
import { active, statusLabels, type Job, type Task } from '../domain';

const progress: Record<string, number> = { queued: 4, reading: 25, splitting: 55, checking: 85 };
import { download, Icon, outline, type Notify } from '../ui';
import { Results } from './results';
import { JobControls } from './job-controls';
import { Steps } from './steps';

export function Review({
  job,
  notify,
  dirty,
  dirtyChanged,
}: {
  job?: Job;
  notify: Notify;
  dirty: boolean;
  dirtyChanged: (value: boolean) => void;
}) {
  const [editing, setEditing] = useState<Task | null>(null);
  const [sourceRequest, setSourceRequest] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(() => matchMedia('(min-width: 1100px)').matches);
  if (!job)
    return (
      <section className="empty-state">
        <h1 className="page-title">Документы</h1>
        <p>Добавьте текст требований для разбора.</p>
        <a className="button primary" href="#/analyze">
          Новый документ
        </a>
      </section>
    );
  const ready = job.status === 'ready';
  return (
    <>
      <header className="review-header">
        <Steps job={job} />
        <div className="review-heading">
          <div className="document-heading">
            <h1 className="page-title">{job.title}</h1>
            <div className="document-meta">
              <span>{job.filename}</span>
              {ready && <span>{outline(job)}</span>}
            </div>
          </div>
          {ready && (
            <div className="actions review-actions">
              <button
                className="button secondary source-toggle"
                aria-pressed={sourceOpen}
                onClick={() => setSourceOpen(!sourceOpen)}
              >
                <Icon name="source" />
                {sourceOpen ? 'Скрыть исходник' : 'Показать исходник'}
              </button>
            </div>
          )}
        </div>
      </header>
      {ready ? (
        <Results
          job={job}
          notify={notify}
          sourceOpen={sourceOpen}
          showSource={() => {
            setSourceOpen(true);
            setSourceRequest((value) => value + 1);
          }}
          hideSource={() => setSourceOpen(false)}
          editing={editing}
          editTask={setEditing}
          sourceRequest={sourceRequest}
          dirty={dirty}
          dirtyChanged={dirtyChanged}
        />
      ) : (
        <section className="document-state" aria-live="polite">
          <h2>
            {active(job.status)
              ? 'Документ обрабатывается'
              : job.status === 'empty'
                ? 'В тексте нет требований'
                : job.status === 'cancelled'
                  ? 'Обработка отменена'
                  : 'Документ не удалось разобрать'}
          </h2>
          {active(job.status) && (
            <progress
              className="export-progress"
              value={progress[job.status]}
              max={100}
              aria-label={statusLabels[job.status]}
            />
          )}
          <p>
            {active(job.status)
              ? statusLabels[job.status] + '. Можно открыть другой документ, разбор продолжится.'
              : job.status === 'empty'
                ? 'Добавьте действия, которые должен выполнять продукт.'
                : job.status === 'cancelled'
                  ? 'Текст документа сохранён.'
                  : job.log.at(-1)}
          </p>
          <JobControls job={job} notify={notify} primary />
          <details className="job-history">
            <summary>Исходный текст и журнал</summary>
            <pre>{job.source}</pre>
            <ol>
              {job.log.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ol>
          </details>
        </section>
      )}
      {ready && (
        <footer className="step-bar">
          <div className="actions">
            <button
              className="button secondary download-action"
              disabled={!!editing}
              aria-label="Скачать Markdown"
              data-tooltip="Скачать Markdown"
              onClick={() => download(job)}
            >
              <Icon name="download" />
            </button>
            <a
              className={'button export-action ' + (editing ? 'secondary' : 'primary')}
              href={'#/export/' + job.id}
              aria-disabled={dirty || undefined}
            >
              {job.exportStatus === 'done' ? 'Переданные задачи' : 'К передаче'}
              <Icon name="arrow" />
            </a>
          </div>
        </footer>
      )}
    </>
  );
}
