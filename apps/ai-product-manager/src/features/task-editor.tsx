import { useEffect, useRef, useState, type FormEvent } from 'react';
import { canEdit, priorityLabels, type Job, type Priority, type Task } from '../domain';
import { workspace } from '../kit';
import { errorMessage } from '../ui';

export function TaskEditor({
  task,
  job,
  close,
  saved,
  dirtyChanged,
}: {
  task: Task;
  job: Job;
  close: () => void;
  saved: () => void;
  dirtyChanged: (value: boolean) => void;
}) {
  const [base, setBase] = useState(task);
  const [title, setTitle] = useState(task.title);
  const [epic, setEpic] = useState(task.epic);
  const [criteria, setCriteria] = useState(task.criteria.join('\n'));
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const titleInput = useRef<HTMLInputElement>(null);
  const latest = job.tasks.find((item) => item.id === task.id);
  const conflict = latest && (latest.version ?? 0) !== (base.version ?? 0);
  const locked = !canEdit(job);
  const dirty =
    title !== base.title ||
    epic !== base.epic ||
    priority !== base.priority ||
    criteria !== base.criteria.join('\n');
  useEffect(() => {
    dirtyChanged(dirty);
    return () => dirtyChanged(false);
  }, [dirty, dirtyChanged]);
  useEffect(() => {
    if (!dirty) return;
    const stopNavigation = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('a[href^="#/"]')) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      titleInput.current?.focus();
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    document.addEventListener('click', stopNavigation, true);
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      document.removeEventListener('click', stopNavigation, true);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [dirty]);
  useEffect(() => {
    titleInput.current?.focus();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!title.trim() || !epic.trim()) {
      setError('Заполните название задачи и эпик.');
      return;
    }
    setBusy(true);
    try {
      await workspace.saveTask(job.id, {
        ...base,
        title: title.trim(),
        epic: epic.trim(),
        priority,
        criteria: criteria
          .split('\n')
          .map((criterion) => criterion.trim())
          .filter(Boolean),
      });
      saved();
      close();
    } catch (cause) {
      setError(errorMessage(cause, 'Не удалось сохранить задачу. Повторите попытку.'));
    } finally {
      setBusy(false);
    }
  }

  function loadLatest() {
    if (!latest) return;
    setBase(latest);
    setTitle(latest.title);
    setEpic(latest.epic);
    setPriority(latest.priority);
    setCriteria(latest.criteria.join('\n'));
    setError('');
    titleInput.current?.focus();
  }

  return (
    <form
      className="task-editor"
      onSubmit={(event) => void submit(event)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) {
          event.preventDefault();
          close();
        }
      }}
    >
      <label>
        Название задачи
        <input
          ref={titleInput}
          value={title}
          maxLength={500}
          required
          disabled={busy || locked}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <div className="editor-fields">
        <label>
          Эпик
          <input
            value={epic}
            maxLength={100}
            required
            disabled={busy || locked}
            onChange={(event) => setEpic(event.target.value)}
          />
        </label>
        <label>
          Приоритет
          <select
            value={priority}
            disabled={busy || locked}
            onChange={(event) => setPriority(event.target.value as Priority)}
          >
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Критерии приёмки
        <textarea
          value={criteria}
          rows={4}
          maxLength={10000}
          disabled={busy || locked}
          aria-describedby="criteria-hint"
          onChange={(event) => setCriteria(event.target.value)}
        />
        <span className="hint" id="criteria-hint">
          Каждый критерий с новой строки. Поле можно оставить пустым.
        </span>
      </label>
      {locked && (
        <p className="info-box">Передача началась. Сохранить правки этой версии нельзя.</p>
      )}
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
      {conflict && (
        <div className="conflict-box" role="alert">
          <p>Задача изменена в другой вкладке. Ваши правки остались в форме.</p>
          <button type="button" className="text-link" disabled={busy} onClick={loadLatest}>
            Загрузить сохранённую версию
          </button>
        </div>
      )}
      {dirty && (
        <p className="hint" role="status">
          Сохраните или отмените правки
        </p>
      )}
      <div className="form-footer">
        <button className="button primary save-action" disabled={busy || locked || !!conflict}>
          {busy ? 'Сохраняем…' : 'Сохранить задачу'}
        </button>
        <button className="button secondary" type="button" disabled={busy} onClick={close}>
          Отменить правки
        </button>
      </div>
    </form>
  );
}
