import { useEffect, useRef, useState } from 'react';
import type { Content, Seo } from './data';
import { Glyph, Notice } from './components';
import { Catalog } from './Catalog';
import { Detail, Materials } from './Pages';
import { contentEvent, kit, readPublished } from './runtime';
import { RequestForm } from './RequestForm';
import { Editor } from './Editor';
import logo from './assets/logo.webp';

function useRoute() {
  const [route, setRoute] = useState(() => location.hash.slice(1) || '/catalog');
  const currentRoute = useRef(route);
  const beforeLeave = useRef<(() => boolean) | null>(null);
  useEffect(() => {
    const change = () => {
      const next = location.hash.slice(1) || '/catalog';
      if (next === currentRoute.current) return;
      if (beforeLeave.current && !beforeLeave.current()) {
        window.history.replaceState(null, '', `#${currentRoute.current}`);
        return;
      }
      currentRoute.current = next;
      setRoute(next);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  return { route, beforeLeave };
}

export function App() {
  const { route, beforeLeave } = useRoute();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const main = useRef<HTMLElement>(null);
  const segments = route.split('/');
  const area = segments[1] ?? 'catalog';
  const id = segments[2];
  const editor = area === 'editor';
  useEffect(() => {
    let active = true;
    let generation = 0;
    async function load() {
      const current = ++generation;
      setLoading(true);
      setError('');
      try {
        const result = await kit.demo.request(readPublished);
        if (active && current === generation) {
          setContent(result);
          setLoading(false);
        }
      } catch {
        if (active && current === generation) {
          setError('Не удалось загрузить данные.');
          setLoading(false);
        }
      }
    }
    void load();
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === `${kit.slug}:published`) void load();
    };
    const onChange = () => void load();
    window.addEventListener('storage', onStorage);
    window.addEventListener(contentEvent, onChange);
    return () => {
      active = false;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(contentEvent, onChange);
    };
  }, [attempt]);
  useEffect(() => {
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [route]);
  const entry = content?.entries.find(
    (item) => item.id === id && item.kind === (area === 'articles' ? 'article' : 'agent'),
  );
  useEffect(() => {
    const pageId =
      area === 'agents' || area === 'articles'
        ? null
        : area === 'request'
          ? 'request'
          : area === 'materials'
            ? 'materials'
            : 'catalog';
    const seo: Seo | undefined = editor
      ? {
          seoTitle: 'Редактор | Агентная мастерская',
          seoDescription: 'Редактор контента.',
        }
      : pageId
        ? content?.pages.find((page) => page.id === pageId)
        : entry;
    document.title = seo?.seoTitle || 'Агентная мастерская';
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', seo?.seoDescription || 'Каталог AI-помощников для рабочих задач.');
  }, [content, entry, area, editor]);
  const showPublic = content !== null;
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        К содержимому
      </a>
      <header className="header">
        <a className="brand" href="#/catalog">
          <img className="brand-mark" src={logo} alt="" />
          <span>Агентная мастерская</span>
        </a>
        <nav aria-label="Основная навигация">
          <a
            aria-current={area === 'catalog' || area === 'agents' ? 'page' : undefined}
            href="#/catalog"
          >
            Каталог
          </a>
          <a
            aria-current={area === 'materials' || area === 'articles' ? 'page' : undefined}
            href="#/materials"
          >
            Материалы
          </a>
          <a className="editor-nav" aria-current={editor ? 'page' : undefined} href="#/editor">
            <Glyph name="edit" size={16} />
            Редактор
          </a>
        </nav>
      </header>
      <main id="main" ref={main} tabIndex={-1} className="main" aria-busy={loading && !content}>
        {error && (showPublic || editor) && (
          <Notice error retry={() => setAttempt((n) => n + 1)}>
            {error}
          </Notice>
        )}
        {!editor && !showPublic && error && (
          <section className="load-error" role="alert">
            <h1 className="page-title">Каталог не загрузился</h1>
            <p>Сервер не ответил.</p>
            <button className="button" onClick={() => setAttempt((n) => n + 1)}>
              Повторить
            </button>
          </section>
        )}
        {!editor && !showPublic && !error && (
          <div className="skeleton-page" role="status" aria-label="Загрузка">
            <span className="skeleton skeleton-title" />
            <div className="skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <span key={i} className="skeleton skeleton-card" />
              ))}
            </div>
          </div>
        )}
        {editor ? (
          <Editor requests={id === 'requests'} beforeLeave={beforeLeave} />
        ) : (
          showPublic &&
          (area === 'catalog' || area === '' ? (
            <Catalog content={content} />
          ) : area === 'materials' ? (
            <Materials content={content} />
          ) : (area === 'agents' || area === 'articles') && entry ? (
            <Detail entry={entry} />
          ) : area === 'request' && entry ? (
            <RequestForm key={entry.id} agent={entry} />
          ) : (
            <div className="empty-state">
              <h1 className="page-title">Страница не найдена</h1>
              <a href="#/catalog" className="button">
                В каталог
              </a>
            </div>
          ))
        )}
      </main>
    </>
  );
}
