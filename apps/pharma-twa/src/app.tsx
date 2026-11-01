import { useEffect, useRef, useState } from 'react';
import { CalculationPage } from './features/calculation/calculation-page';
import { LibraryPage } from './features/library/library-page';
import { MaterialPage } from './features/library/material-page';
import { useLibrary } from './features/library/use-library';
import { useLibraryView } from './features/library/use-library-view';
import { ProfilePage } from './features/profile/profile-page';
import { useProfile } from './features/profile/use-profile';
import { kit } from './kit';
import { AppLink } from './ui/app-link';
import { Empty, Failure } from './ui/feedback';
import { Icon } from './ui/icons';
import { SectionNav } from './ui/section-nav';

const readRoute = () => location.hash.slice(1) || '/library';

export function App() {
  const [route, setRoute] = useState(readRoute);
  const [notice, setNotice] = useState('');
  const editor = useProfile();
  const library = useLibrary(setNotice);
  const context = useLibraryView();
  const main = useRef<HTMLElement>(null);
  const previousRoute = useRef('');
  const listPosition = useRef(0);
  const [path = '/library', query = ''] = route.split('?');
  const returnTo =
    new URLSearchParams(query).get('from') === 'favorites' ? '/favorites' : '/library';

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    const returning =
      previousRoute.current.startsWith('/material/') &&
      (path === '/library' || path === '/favorites');
    window.scrollTo({ top: returning ? listPosition.current : 0, behavior: 'instant' });
    main.current?.focus({ preventScroll: true });
    previousRoute.current = path;
  }, [path]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const failedItem = library.catalog.find((item) => item.id === library.favoriteFailure);
  const page = () => {
    if (path === '/library' || path === '/favorites')
      return (
        <LibraryPage
          library={library}
          favoritesOnly={path === '/favorites'}
          context={context}
          onOpen={() => {
            listPosition.current = window.scrollY;
          }}
        />
      );
    if (path.startsWith('/material/'))
      return <MaterialPage id={path.split('/')[2] ?? ''} library={library} returnTo={returnTo} />;
    if (path === '/calculation') return <CalculationPage />;
    if (path === '/profile') return <ProfilePage editor={editor} />;
    return (
      <Empty title="Такого раздела нет">
        <AppLink to="/library" className="button primary">
          В библиотеку
        </AppLink>
      </Empty>
    );
  };

  return (
    <div className="application">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        К содержимому
      </a>
      <header className="app-header">
        <div className="header-inner">
          <AppLink to="/library" className="brand">
            практика
          </AppLink>
        </div>
        <SectionNav route={path} />
      </header>
      <main id="main-content" ref={main} tabIndex={-1}>
        {library.favoriteFailure && (
          <div className="favorite-failure">
            <Failure retry={() => void library.toggleFavorite(library.favoriteFailure!)}>
              Избранное не изменилось{failedItem ? `: ${failedItem.title}` : ''}.
            </Failure>
            <button
              className="icon-button"
              onClick={library.dismissFailure}
              aria-label="Скрыть ошибку"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        )}
        {page()}
      </main>
      <div className={notice ? 'toast toast-visible' : 'toast'} role="status" aria-live="polite">
        {notice}
      </div>
    </div>
  );
}
