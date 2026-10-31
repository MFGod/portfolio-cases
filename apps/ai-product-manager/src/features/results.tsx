import { useRef, useState } from 'react';
import { canEdit, missingCriteria, priorityLabels, type Job, type Task } from '../domain';
import { Icon, plural, type Notify } from '../ui';
import { TaskEditor } from './task-editor';
import { SourcePane, sourceReference } from './source';

export function Results({
  job,
  notify,
  sourceOpen,
  showSource,
  hideSource,
  editing,
  editTask,
  sourceRequest,
  dirty,
  dirtyChanged,
}: {
  job: Job;
  notify: Notify;
  sourceOpen: boolean;
  showSource: () => void;
  hideSource: () => void;
  editing: Task | null;
  editTask: (task: Task | null) => void;
  sourceRequest: number;
  dirty: boolean;
  dirtyChanged: (value: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState(
    () => (job.tasks.find((task) => task.criteria.length > 0) ?? job.tasks[0])?.id,
  );
  const [missingOnly, setMissingOnly] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const selected = job.tasks.find((task) => task.id === selectedId);
  const missing = missingCriteria(job);
  const locked = !canEdit(job);
  const shown = job.tasks
    .filter(
      (task) =>
        !missingOnly || task.id === editing?.id || missing.some((item) => item.id === task.id),
    )
    .map((task) => (task.id === editing?.id ? { ...task, epic: editing.epic } : task));
  const epics = [...new Set(shown.map((task) => task.epic))];

  function closeEditor() {
    editTask(null);
    requestAnimationFrame(() => editButton.current?.focus());
  }

  return (
    <section className="review-workspace" aria-label="Проверка задач">
      <div className="review-toolbar">
        <div className="filter-tabs" role="group" aria-label="Фильтр задач">
          <button
            disabled={dirty}
            aria-pressed={!missingOnly}
            onClick={() => setMissingOnly(false)}
          >
            Все задачи <span>{job.tasks.length}</span>
          </button>
          <button
            disabled={dirty}
            aria-pressed={missingOnly}
            onClick={() => {
              setMissingOnly(true);
              editTask(null);
              if (!missing.some((task) => task.id === selectedId)) setSelectedId(missing[0]?.id);
            }}
          >
            Без критериев <span>{missing.length}</span>
          </button>
        </div>
        {locked && <p className="toolbar-note">Передача началась. Версия задач зафиксирована.</p>}
      </div>
      <div className={'review-body ' + (sourceOpen ? 'source-visible' : '')}>
        <div className="task-groups">
          {shown.length === 0 && <p className="empty-state">У всех задач есть критерии приёмки.</p>}
          {epics.map((epic) => {
            const tasks = shown.filter((task) => task.epic === epic);
            if (!tasks.length) return null;
            return (
              <section className="epic-group" key={epic} aria-label={epic}>
                <h2>
                  {epic}
                  <span>{tasks.length}</span>
                </h2>
                <ul className="task-list">
                  {tasks.map((task) => {
                    const open = task.id === selectedId;
                    return (
                      <li className={'task-row ' + (open ? 'selected' : '')} key={task.id}>
                        <button
                          className="task-select"
                          disabled={dirty}
                          aria-expanded={open}
                          aria-controls={'task-detail-' + task.id}
                          onClick={() => {
                            setSelectedId(open ? undefined : task.id);
                            editTask(null);
                          }}
                        >
                          <Icon name="chevron" />
                          <span className="task-name">{task.title}</span>
                          <span className={'priority ' + task.priority}>
                            <i aria-hidden="true" />
                            {priorityLabels[task.priority]}
                          </span>
                          <span
                            className={'criteria-status ' + (task.criteria.length ? '' : 'missing')}
                          >
                            <Icon name={task.criteria.length ? 'check' : 'warning'} />
                            {task.criteria.length
                              ? plural(task.criteria.length, 'критерий', 'критерия', 'критериев')
                              : 'Нет критериев приёмки'}
                          </span>
                        </button>
                        {open && (
                          <div className="task-detail" id={'task-detail-' + task.id}>
                            {editing?.id === task.id ? (
                              <TaskEditor
                                key={editing.id}
                                task={editing}
                                job={job}
                                close={closeEditor}
                                dirtyChanged={dirtyChanged}
                                saved={() => notify('Изменения сохранены')}
                              />
                            ) : (
                              <>
                                <h3>Критерии приёмки</h3>
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
                                  <p className="muted">В исходном документе критерии не указаны.</p>
                                )}
                                <div className="task-detail-actions">
                                  <button
                                    ref={editButton}
                                    className="button secondary"
                                    disabled={locked}
                                    onClick={() =>
                                      editTask({ ...task, criteria: [...task.criteria] })
                                    }
                                  >
                                    <Icon name="edit" />
                                    Редактировать
                                  </button>
                                  {task.source && (
                                    <button className="text-link" onClick={showSource}>
                                      <Icon name="source" />
                                      {sourceReference(job.source, task)}
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
        {sourceOpen && (
          <SourcePane job={job} task={selected} close={hideSource} revealKey={sourceRequest} />
        )}
      </div>
    </section>
  );
}
