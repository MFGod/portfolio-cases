import { useEffect, useRef, useState } from 'react';
import type { Content, Entry, Page } from './data';
import { EditorSkeleton, Glyph, Notice, Price, Prose } from './components';
import { kit, mutate, readDraft, readPublished } from './runtime';
import { RequestList } from './Requests';
import { EditorFields, SearchSnippet } from './EditorFields';

type Section = 'agent' | 'article' | 'pages';

const sectionLabels: Record<Section, string> = {
  agent: 'Агенты',
  article: 'Статьи',
  pages: 'Страницы',
};

export function Editor({
  requests = false,
  beforeLeave,
}: {
  requests?: boolean;
  beforeLeave: { current: (() => boolean) | null };
}) {
  const [working, setWorking] = useState<Content | null>(null);
  const [saved, setSaved] = useState<Content | null>(null);
  const [selected, setSelected] = useState('meeting');
  const [section, setSection] = useState<Section>('agent');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [retryAction, setRetryAction] = useState<'load' | 'save' | 'publish'>('load');
  const preview = useRef<HTMLDialogElement>(null);
  const previewButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void kit.demo
      .request(readDraft)
      .then((content) => {
        if (active) {
          setWorking(content);
          setSaved(content);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('Не удалось загрузить черновик.');
          setRetryAction('load');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  const dirty = JSON.stringify(working) !== JSON.stringify(saved);
  useEffect(() => {
    beforeLeave.current = () =>
      !dirty || window.confirm('Есть несохранённые изменения. Покинуть редактор и потерять их?');
    const guard = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => {
      beforeLeave.current = null;
      window.removeEventListener('beforeunload', guard);
    };
  }, [dirty, beforeLeave]);
  const target: Entry | Page | undefined =
    section === 'pages'
      ? working?.pages.find((page) => page.id === selected)
      : working?.entries.find((entry) => entry.id === selected);
  const entry = target && 'kind' in target ? target : undefined;
  function update(field: string, value: string | number) {
    if (!working) return;
    setWorking(
      section === 'pages'
        ? {
            ...working,
            pages: working.pages.map((page) =>
              page.id === selected ? { ...page, [field]: value } : page,
            ),
          }
        : {
            ...working,
            entries: working.entries.map((item) =>
              item.id === selected ? { ...item, [field]: value } : item,
            ),
          },
    );
    setError('');
    setMessage('');
  }
  function pickSection(next: Section) {
    setSection(next);
    setSelected(
      next === 'pages'
        ? 'catalog'
        : (working?.entries.find((item) => item.kind === next)?.id ?? ''),
    );
    setMessage('');
    setError('');
  }
  async function save(publishing = false) {
    if (!working || pending) return;
    if (
      !target?.title.trim() ||
      !target.seoTitle.trim() ||
      !target.seoDescription.trim() ||
      (entry &&
        (!entry.summary.trim() ||
          !entry.body.trim() ||
          !Number.isFinite(entry.price) ||
          entry.price < 0))
    ) {
      setError('Заполните все поля. Цена не может быть отрицательной.');
      setRetryAction(publishing ? 'publish' : 'save');
      return;
    }
    setPending(true);
    setError('');
    setMessage('');
    try {
      await mutate(() => {
        kit.store.set('draft-v2', working);
        return true;
      });
      setSaved(structuredClone(working));
      if (publishing) {
        const content = await mutate(() => {
          const next = { ...working, revision: readPublished().revision + 1 };
          kit.store.set('published-v2', next);
          kit.store.set('draft-v2', next);
          return next;
        });
        setWorking(content);
        setSaved(structuredClone(content));
        setMessage(`Версия ${content.revision} опубликована`);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : publishing
            ? 'Не удалось опубликовать.'
            : 'Не удалось сохранить черновик.',
      );
      setRetryAction(publishing ? 'publish' : 'save');
    } finally {
      setPending(false);
    }
  }
  const publish = () => save(true);
  const publicPath =
    section === 'pages'
      ? selected === 'request'
        ? '#/request/meeting'
        : `#/${selected}`
      : `#/${entry?.kind === 'article' ? 'articles' : 'agents'}/${selected}`;
  return (
    <>
      <div className="editor-head">
        <h1 className="page-title">Редактор</h1>
        <nav className="editor-tabs" aria-label="Разделы редактора">
          <a aria-current={!requests ? 'page' : undefined} href="#/editor">
            Контент
          </a>
          <a aria-current={requests ? 'page' : undefined} href="#/editor/requests">
            Заявки
          </a>
        </nav>
      </div>
      {requests ? (
        <RequestList />
      ) : loading ? (
        <EditorSkeleton />
      ) : !working ? (
        <Notice error retry={() => setAttempt((n) => n + 1)}>
          {error}
        </Notice>
      ) : (
        <>
          <div className="editor-toolbar">
            <p className="save-state">
              <span className={`status-dot ${dirty ? 'unsaved' : ''}`} aria-hidden="true" />
              {pending
                ? 'Сохраняем…'
                : dirty
                  ? 'Есть несохранённые изменения'
                  : 'Черновик сохранён'}
            </p>
            <div className="actions">
              <button
                className="button secondary"
                disabled={pending || !dirty}
                onClick={() => void save()}
              >
                Сохранить
              </button>
              <button
                ref={previewButton}
                className="button secondary"
                disabled={pending || dirty}
                onClick={() => preview.current?.showModal()}
              >
                Предпросмотр
              </button>
              <button className="button" disabled={pending} onClick={() => void publish()}>
                Опубликовать
              </button>
            </div>
          </div>
          <div aria-live="polite">
            {message && (
              <Notice>
                {message}
                {message.startsWith('Версия') && (
                  <>
                    {'. '}
                    <a href={publicPath}>Открыть страницу</a>
                  </>
                )}
              </Notice>
            )}
            {error && (
              <Notice
                error
                retry={() =>
                  retryAction === 'save'
                    ? void save()
                    : retryAction === 'publish'
                      ? void publish()
                      : setAttempt((n) => n + 1)
                }
              >
                {error}
              </Notice>
            )}
          </div>
          <div className="editor-layout">
            <aside className="editor-sidebar" aria-label="Записи">
              <div className="segmented" role="group" aria-label="Тип записей">
                {(Object.keys(sectionLabels) as Section[]).map((tab) => (
                  <button
                    key={tab}
                    aria-pressed={section === tab}
                    disabled={dirty || pending}
                    onClick={() => pickSection(tab)}
                  >
                    {sectionLabels[tab]}
                  </button>
                ))}
              </div>
              <div className="entry-list">
                {(section === 'pages'
                  ? working.pages
                  : working.entries.filter((item) => item.kind === section)
                ).map((item) => (
                  <button
                    aria-pressed={selected === item.id}
                    disabled={dirty || pending}
                    key={item.id}
                    onClick={() => {
                      setSelected(item.id);
                      setMessage('');
                      setError('');
                    }}
                  >
                    {item.title.trim() || 'Без названия'}
                  </button>
                ))}
              </div>
              {dirty && (
                <div className="dirty-hint">
                  <p>Сохраните или отмените правки, чтобы открыть другую запись.</p>
                  <button
                    className="text-button"
                    onClick={() => {
                      setWorking(structuredClone(saved));
                      setError('');
                    }}
                  >
                    Отменить изменения
                  </button>
                </div>
              )}
            </aside>
            {target && (
              <EditorFields
                target={target}
                publicPath={publicPath}
                disabled={pending}
                update={update}
              />
            )}
          </div>
          <dialog
            className="preview-dialog"
            ref={preview}
            aria-labelledby="preview-title"
            onClose={() => previewButton.current?.focus()}
          >
            <div className="preview-toolbar">
              <span>Предпросмотр</span>
              <button className="button secondary" onClick={() => preview.current?.close()}>
                <Glyph name="close" size={16} />
                Закрыть
              </button>
            </div>
            <div className="preview-content">
              <h2 id="preview-title">{target?.title}</h2>
              {entry ? (
                <>
                  <p className="lead">{entry.summary}</p>
                  <Prose text={entry.body} />
                  {entry.kind === 'agent' && <Price value={entry.price} />}
                </>
              ) : (
                target && <SearchSnippet target={target} path={publicPath.slice(2)} />
              )}
            </div>
          </dialog>
        </>
      )}
    </>
  );
}
