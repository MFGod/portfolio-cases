import { useEffect, useRef, useState, type FormEvent } from 'react';
import { example, type Job } from '../domain';
import { kit, workspace } from '../kit';
import { errorMessage, Icon, type Notify } from '../ui';
import { emptyDraft, maxChars, readTextFile, restoreDraft, type Draft } from './document-file';
import { Steps } from './steps';

const sample: Draft = { title: 'Бронирование рабочих мест', text: example, filename: 'Пример.md' };

export function Analyze({
  draftId,
  recovery,
  notify,
}: {
  draftId: string;
  recovery?: Job;
  notify: Notify;
}) {
  const recoveryKey = recovery ? 'draft:edit:' + recovery.id + ':' + recovery.attempt : '';
  const key = recovery ? recoveryKey + ':' + draftId : 'draft:' + draftId;
  const [draft, setDraft] = useState<Draft>(() => {
    const fallback = recovery
      ? restoreDraft(
          recoveryKey,
          { title: recovery.title, text: recovery.source, filename: recovery.filename },
          false,
        )
      : emptyDraft;
    return draftId ? restoreDraft(key, fallback, !recovery) : fallback;
  });
  const [previous, setPrevious] = useState<Draft | null>(null);
  const [busy, setBusy] = useState<'file' | 'submit' | ''>('');
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const recoverable = !recovery || ['error', 'cancelled', 'empty'].includes(recovery.status);

  useEffect(() => {
    if (!draftId || !recoverable) return;
    try {
      kit.store.set(key, draft);
    } catch {
      setError('Черновик не удалось сохранить. Скопируйте текст перед закрытием вкладки.');
    }
  }, [draft, draftId, key, recoverable]);

  function replaceDraft(next: Draft) {
    setPrevious(draft);
    setDraft(next);
    setError('');
  }

  async function upload(file: File) {
    setBusy('file');
    setError('');
    try {
      const text = await readTextFile(file);
      replaceDraft({
        title: file.name.replace(/\.(txt|md)$/i, '').slice(0, 100),
        text,
        filename: file.name,
      });
      notify('Документ загружен');
    } catch (cause) {
      setError(errorMessage(cause, 'Не удалось прочитать файл. Выберите другой документ.'));
    } finally {
      setBusy('');
      if (input.current) input.current.value = '';
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!draft.title.trim() || draft.text.trim().length < 10) {
      setError('Добавьте название и требования длиной от 10 символов.');
      return;
    }
    setBusy('submit');
    try {
      const id = recovery
        ? (await workspace.revise(recovery.id, draft.title.trim(), draft.text, draft.filename),
          recovery.id)
        : await workspace.submit(draft.title.trim(), draft.text, draft.filename);
      notify(recovery ? 'Исправленный документ добавлен в очередь' : 'Документ добавлен в очередь');
      location.hash = '#/review/' + id;
    } catch (cause) {
      setError(errorMessage(cause, 'Не удалось добавить документ. Повторите попытку.'));
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="form-page">
      <a className="breadcrumb" href={recovery ? '#/review/' + recovery.id : '#/review'}>
        <Icon name="chevron" />
        {recovery ? 'К документу' : 'К документам'}
      </a>
      <Steps />
      <h1 className="page-title">{recovery ? 'Исправление документа' : 'Новый документ'}</h1>
      {recovery && (
        <p className="form-context">
          {recovery.status === 'empty'
            ? 'В прошлой версии не было требований. Добавьте действия, которые должен выполнять продукт.'
            : 'Исправьте текст и отправьте документ на повторный разбор.'}
        </p>
      )}
      {!recoverable ? (
        <div className="empty-state">
          <p>Этот документ уже обрабатывается или готов к проверке.</p>
          <a className="button primary" href={'#/review/' + recovery?.id}>
            Открыть документ
          </a>
        </div>
      ) : (
        <form className="document-form" onSubmit={(event) => void submit(event)}>
          <label>
            Название документа
            <input
              value={draft.title}
              maxLength={100}
              required
              disabled={!!busy}
              placeholder="Бронирование рабочих мест"
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </label>
          <div className="field-heading">
            <label htmlFor="requirements">Требования</label>
            <button
              type="button"
              className="text-link"
              disabled={!!busy}
              onClick={() => replaceDraft(sample)}
            >
              Вставить пример
            </button>
          </div>
          <textarea
            id="requirements"
            className="requirements"
            value={draft.text}
            required
            minLength={10}
            maxLength={maxChars}
            disabled={!!busy}
            aria-describedby="requirements-meta"
            placeholder={
              '## Бронирование\n- Показывать свободные места на выбранную дату.\n  Критерий: занятые места скрыты.'
            }
            onChange={(event) =>
              setDraft({ ...draft, text: event.target.value, filename: 'Вставленный текст' })
            }
          />
          <div className="text-meta" id="requirements-meta">
            <span>{draft.filename}</span>
            <span>{draft.text.length.toLocaleString('ru-RU')} из 50 000</span>
          </div>
          {previous && (
            <div className="replacement-notice">
              <span>Текст заменён</span>
              <button
                className="text-link"
                type="button"
                disabled={!!busy}
                onClick={() => {
                  setDraft(previous);
                  setPrevious(null);
                  setError('');
                }}
              >
                Вернуть предыдущий текст
              </button>
            </div>
          )}
          <input
            ref={input}
            className="visually-hidden"
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            tabIndex={-1}
            aria-label="Текстовый документ"
            disabled={!!busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          {error && (
            <p role="alert" className="error-box">
              {error}
            </p>
          )}
          <div className="form-footer">
            <button className="button primary analyze-action" disabled={!!busy}>
              {busy === 'submit'
                ? 'Добавляем в очередь…'
                : recovery
                  ? 'Разобрать исправленный текст'
                  : 'Разобрать документ'}
            </button>
            <button
              type="button"
              className="button secondary upload-action"
              disabled={!!busy}
              onClick={() => input.current?.click()}
            >
              <Icon name="upload" />
              {busy === 'file' ? 'Читаем файл…' : 'Загрузить файл'}
            </button>
            <span className="hint">TXT или MD до 200 КБ, UTF-8</span>
          </div>
        </form>
      )}
    </div>
  );
}
