import { useEffect, useRef } from 'react';
import type { Job, Task } from '../domain';
import { Icon } from '../ui';

export function sourceReference(source: string, task: Task) {
  if (!task.source) return 'Фрагмент в исходнике';
  const start = source.slice(0, task.source.start).split('\n').length;
  const end = source.slice(0, Math.max(task.source.start, task.source.end - 1)).split('\n').length;
  return start === end
    ? 'Строка ' + start + ' в исходнике'
    : 'Строки ' + start + ' по ' + end + ' в исходнике';
}

export function SourcePane({
  job,
  task,
  close,
  revealKey,
}: {
  job: Job;
  task?: Task;
  close: () => void;
  revealKey: number;
}) {
  const pane = useRef<HTMLDivElement>(null);
  const highlighted = useRef<HTMLDivElement>(null);
  const range = task?.source;
  const lines = job.source.split('\n');
  let offset = 0;
  useEffect(() => {
    const container = pane.current;
    const line = highlighted.current;
    if (!container || !line) return;
    container.scrollTo({
      top: Math.max(0, line.offsetTop - container.offsetTop - container.clientHeight / 4),
    });
  }, [task?.id, revealKey]);
  return (
    <aside className="source-pane" aria-label="Исходный документ">
      <div className="source-head">
        <div>
          <h2>Исходный документ</h2>
          <p>{job.filename}</p>
        </div>
        <button className="icon-button" onClick={close} aria-label="Закрыть исходный документ">
          <Icon name="close" />
        </button>
      </div>
      <button className="text-link source-back" onClick={close}>
        Вернуться к задачам
      </button>
      <div className="source-lines" ref={pane}>
        {lines.map((line, index) => {
          const start = offset;
          offset += line.length + 1;
          const selected = range && range.start < start + line.length && range.end > start;
          const from = selected ? Math.max(0, range.start - start) : 0;
          const to = selected ? Math.min(line.length, range.end - start) : 0;
          return (
            <div
              className={
                'source-line ' +
                (selected ? 'linked' : '') +
                (/^#/.test(line) ? ' source-heading' : '')
              }
              key={index}
              ref={selected && range.start >= start ? highlighted : undefined}
            >
              <span className="source-line-number" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                {selected ? (
                  <>
                    {line.slice(0, from)}
                    <mark>{line.slice(from, to)}</mark>
                    {line.slice(to)}
                  </>
                ) : (
                  line || '\u00a0'
                )}
              </span>
            </div>
          );
        })}
      </div>
      {task && !range && (
        <p className="source-note">У этой задачи нет сохранённой ссылки на исходник.</p>
      )}
    </aside>
  );
}
