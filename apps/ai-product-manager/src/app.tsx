import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { workspace } from './kit';
import { errorMessage, Icon } from './ui';
import { Analyze } from './features/analyze';
import { Export } from './features/export';
import { Review } from './features/review';
import { Sidebar } from './features/sidebar';

type Page = 'review' | 'analyze' | 'export' | 'edit';
type Route = { page: Page; id: string; draftId: string };

function readRoute(): Route {
  const [page = '', id = '', draftId = ''] = location.hash.replace(/^#\/?/, '').split('/');
  const known = page === 'queue' ? 'review' : page;
  const valid = ['review', 'analyze', 'export', 'edit'].includes(known);
  return { page: valid ? (known as Page) : 'review', id, draftId };
}

function Loading({ error, retry }: { error: string; retry: () => void }) {
  if (error)
    return (
      <section className="load-error" role="alert">
        <h1 className="page-title">Рабочая область не загрузилась</h1>
        <p>{error}</p>
        <button className="button primary" onClick={retry}>
          Повторить загрузку
        </button>
      </section>
    );
  return (
    <div className="skeleton-page" role="status" aria-label="Загрузка документов">
      <span className="skeleton skeleton-line" />
      <span className="skeleton skeleton-line short" />
      <span className="skeleton skeleton-block" />
    </div>
  );
}

export function App() {
  const state = useSyncExternalStore(workspace.subscribe, workspace.getSnapshot);
  const [route, setRoute] = useState(readRoute);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingDirty, setEditingDirty] = useState(false);
  const dirtyRef = useRef(false);
  const routeHash = useRef(location.hash);
  dirtyRef.current = editingDirty;
  const [loadingRequest, setLoadingRequest] = useState(false);
  const runtimeError = workspace.getError();

  async function load() {
    setError('');
    setLoadingRequest(true);
    try {
      await workspace.load();
      setLoaded(true);
    } catch (cause) {
      setError(errorMessage(cause, 'Рабочая область не загрузилась. Повторите загрузку.'));
    } finally {
      setLoadingRequest(false);
    }
  }

  useEffect(() => {
    const navigate = () => {
      if (dirtyRef.current && location.hash !== routeHash.current) {
        location.replace(routeHash.current);
        setNotice('Сохраните или отмените правки');
        return;
      }
      const next = readRoute();
      if (next.page === 'analyze' && !next.id) {
        location.replace('#/analyze/' + crypto.randomUUID());
        return;
      }
      if (next.page === 'edit' && next.id && !next.draftId) {
        location.replace('#/edit/' + next.id + '/' + crypto.randomUUID());
        return;
      }
      routeHash.current = location.hash;
      setRoute(next);
      window.scrollTo(0, 0);
    };
    navigate();
    window.addEventListener('hashchange', navigate);
    void load();
    return () => window.removeEventListener('hashchange', navigate);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(timeout);
  }, [notice]);

  const selected =
    state.jobs.find((job) =>
      route.id && route.page !== 'analyze' ? job.id === route.id : job.id === state.selected,
    ) ?? (!route.id ? state.jobs.find((job) => job.status === 'ready') : undefined);
  const missing = loaded && route.id && route.page !== 'analyze' && !selected;

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        К содержимому
      </a>
      <Sidebar jobs={state.jobs} selected={route.page === 'analyze' ? undefined : selected} />
      <main id="main-content" className={'main view-' + route.page} tabIndex={-1}>
        {loaded && (runtimeError || error) && (
          <div className="global-error" role="alert">
            <p>{runtimeError || error}</p>
            <button
              className="button secondary"
              disabled={loadingRequest}
              onClick={() => void load()}
            >
              {loadingRequest ? 'Загружаем…' : 'Повторить загрузку'}
            </button>
          </div>
        )}
        {!loaded ? (
          <Loading error={error} retry={() => void load()} />
        ) : missing ? (
          <section className="empty-state">
            <h1 className="page-title">Документ не найден</h1>
            <a className="button primary" href="#/review">
              Открыть документы
            </a>
          </section>
        ) : route.page === 'analyze' || route.page === 'edit' ? (
          <Analyze
            key={route.page + route.id + route.draftId}
            draftId={route.page === 'edit' ? route.draftId : route.id}
            recovery={route.page === 'edit' ? selected : undefined}
            notify={setNotice}
          />
        ) : route.page === 'export' ? (
          <Export jobs={state.jobs} selected={selected} notify={setNotice} />
        ) : (
          <Review
            key={selected?.id}
            job={selected}
            notify={setNotice}
            dirty={editingDirty}
            dirtyChanged={setEditingDirty}
          />
        )}
      </main>
      <div className={'toast ' + (notice ? 'visible' : '')} role="status" aria-live="polite">
        {notice && (
          <>
            <Icon name="check" />
            {notice}
          </>
        )}
      </div>
    </div>
  );
}
