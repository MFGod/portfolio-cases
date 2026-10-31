import { useState } from 'react';
import { missingCriteria, type Job } from '../domain';
import { workspace } from '../kit';
import { download, errorMessage, Icon, outline, plural, type Notify } from '../ui';
import { Steps } from './steps';
import { ExportTaskList, TicketLog } from './export-parts';

export function Export({
  jobs,
  selected,
  notify,
}: {
  jobs: Job[];
  selected?: Job;
  notify: Notify;
}) {
  const job =
    selected?.status === 'ready' ? selected : jobs.find((item) => item.status === 'ready');
  if (!job)
    return (
      <section className="empty-state">
        <h1 className="page-title">Передача задач</h1>
        <p>Нет документов с готовыми задачами.</p>
        <a className="button primary" href="#/analyze">
          Новый документ
        </a>
      </section>
    );
  return (
    <>
      <header className="review-header">
        <Steps job={job} sending />
        <div className="document-heading">
          <h1 className="page-title">{job.title}</h1>
          <div className="document-meta">
            <span>{job.filename}</span>
            <span>{outline(job)}</span>
          </div>
        </div>
      </header>
      <div className="standard-page export-page">
        <ExportDocument
          key={job.id}
          job={job}
          notify={notify}
          workspaceBusy={jobs.some((item) => item.exportStatus === 'pending')}
        />
      </div>
    </>
  );
}

function ExportDocument({
  job,
  notify,
  workspaceBusy,
}: {
  job: Job;
  notify: Notify;
  workspaceBusy: boolean;
}) {
  const [approvedRevision, setApprovedRevision] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const missing = missingCriteria(job);
  const revision = job.tasks.map((task) => task.id + ':' + (task.version ?? 0)).join('|');
  const approved = approvedRevision === revision;
  const busy = workspaceBusy || submitting;
  const done = job.exportStatus === 'done';
  const sent = job.tickets.length;
  const needsApproval = missing.length > 0 && !job.missingAccepted;
  const label =
    job.exportStatus === 'pending' || submitting
      ? 'Передаём задачи…'
      : job.exportStatus === 'error' || sent > 0
        ? 'Продолжить передачу'
        : 'Передать в трекер';

  async function send() {
    setError('');
    setSubmitting(true);
    try {
      await workspace.exportJob(job.id, approved || !!job.missingAccepted);
      const updated = workspace.getSnapshot().jobs.find((item) => item.id === job.id);
      notify(
        updated?.exportStatus === 'done'
          ? 'Все задачи переданы в Orbit Track'
          : 'Передача остановлена. Созданные задачи сохранены.',
      );
    } catch (cause) {
      setError(errorMessage(cause, 'Не удалось передать задачи. Повторите попытку.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="export-layout">
      <section className="export-form" aria-label="Передача задач">
        <div className="export-destination">
          <span className="tracker-mark" aria-hidden="true">
            <Icon name="layers" />
          </span>
          <div>
            <h2>Orbit Track</h2>
            <p>Проект «Коворкинг», очередь ORB</p>
          </div>
        </div>
        <div className="export-review-heading">
          <h2>{done ? 'Переданные задачи' : 'Задачи к передаче'}</h2>
        </div>
        <ExportTaskList job={job} />
        {needsApproval && !done && (
          <div className="export-approval">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={approved}
                disabled={busy}
                onChange={(event) => setApprovedRevision(event.target.checked ? revision : '')}
              />
              <span>
                Разрешаю передать {plural(missing.length, 'задачу', 'задачи', 'задач')} без
                критериев приёмки
              </span>
            </label>
          </div>
        )}
        {job.missingAccepted && missing.length > 0 && (
          <p className="muted approved-note">
            Передача {plural(missing.length, 'задачи', 'задач', 'задач')} без критериев
            подтверждена.
          </p>
        )}
        {(job.exportError || error) && (
          <p className="error-box" role="alert">
            {error || job.exportError}
          </p>
        )}
        {(sent > 0 || busy || done) && (
          <div className="export-status" role="status" aria-live="polite">
            <div>
              <span>{done ? 'Все задачи переданы' : 'Передано задач'}</span>
              <span>
                {sent} из {job.tasks.length}
              </span>
            </div>
            <progress
              className="export-progress"
              max={job.tasks.length}
              value={sent}
              aria-label="Передано задач"
            />
          </div>
        )}
        <div className="step-bar export-footer">
          {!done ? (
            <a className="button secondary" href={'#/review/' + job.id}>
              Вернуться к проверке
            </a>
          ) : (
            <span />
          )}
          <div className="actions">
            <button
              className={'button ' + (done ? 'primary' : 'secondary')}
              disabled={busy}
              onClick={() => download(job)}
            >
              Скачать Markdown
            </button>
            {!done && (
              <button
                className="button primary send-action"
                disabled={busy || (needsApproval && !approved)}
                onClick={() => void send()}
              >
                {label}
                <Icon name="arrow" />
              </button>
            )}
          </div>
        </div>
      </section>
      <TicketLog job={job} />
    </div>
  );
}
