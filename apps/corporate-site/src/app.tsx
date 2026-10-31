import { useEffect, useState } from 'react';

import { setActiveLocale } from './domain/locale';
import { localize } from './domain/localize';
import { CONTENT_CHANGED, readPublished } from './domain/repository';
import { seoOf } from './domain/seo';
import { useAddress } from './domain/route';
import { Theme, useTheme } from './domain/theme';
import { EditorPage } from './features/editor/editor-page';
import { SiteView } from './features/site/site-view';

const usePublished = () => {
  const [content, setContent] = useState(readPublished);
  useEffect(() => {
    const sync = () => setContent(readPublished());
    window.addEventListener(CONTENT_CHANGED, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONTENT_CHANGED, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return content;
};

export function App() {
  const { locale, route } = useAddress();
  const stored = usePublished();
  const content = localize(stored, locale);
  const theme = useTheme();

  const scheme = route.page === 'editor' ? Theme.Light : theme.scheme;
  useEffect(() => {
    document.documentElement.dataset.theme = scheme;
  }, [scheme]);

  useEffect(() => {
    if (route.page === 'editor') {
      document.documentElement.lang = 'ru';
      document.title = `Админ-панель: ${stored.siteName.ru}`;
      return;
    }
    document.documentElement.lang = locale;
    setActiveLocale(locale);
    const seo = seoOf(localize(stored, locale), route);
    document.title = seo?.title ?? content.siteName;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', seo?.description ?? '');
  }, [route, locale, stored]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  if (route.page === 'editor') return <EditorPage />;
  return (
    <SiteView
      content={content}
      route={route}
      locale={locale}
      theme={{ current: theme.theme, choose: theme.choose }}
    />
  );
}
