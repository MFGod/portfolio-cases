import { useState } from 'react';
import { active, type Job } from '../domain';
import { workspace } from '../kit';
import { errorMessage, type Notify } from '../ui';

export function JobControls({
  job,
  notify,
  primary = false,
}: {
  job: Job;
  notify: Notify;
  primary?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run(action: 'cancel' | 'retry') {
    setBusy(true);
    setError('');
    try {
      await workspace[action](job.id);
      notify(action === 'cancel' ? 'Обработка отменена' : 'Документ снова в очереди');
    } catch (cause) {
      setError(errorMessage(cause, 'Не удалось изменить обработку. Повторите попытку.'));
    } finally {
      setBusy(false);
    }
  }
  const buttonClass = 'button ' + (primary ? 'primary' : 'secondary');
  return (
    <div className="job-control-group">
      <div className="job-actions">
        {active(job.status) ? (
          <button
            className="button secondary cancel-action"
            disabled={busy}
            onClick={() => void run('cancel')}
          >
            {busy ? 'Отменяем…' : 'Отменить обработку'}
          </button>
        ) : job.status === 'ready' ? (
          <a href={'#/review/' + job.id} className={buttonClass}>
            Открыть задачи
          </a>
        ) : (
          <>
            <a className={buttonClass} href={'#/edit/' + job.id}>
              Исправить текст
            </a>
            {job.issue !== 'content' && job.status !== 'empty' && (
              <button
                className="button secondary retry-action"
                disabled={busy}
                onClick={() => void run('retry')}
              >
                {busy ? 'Добавляем…' : 'Повторить разбор'}
              </button>
            )}
          </>
        )}
      </div>
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
