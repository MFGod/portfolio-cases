import { useEffect, useRef, useState } from 'react';

import { t } from '../../domain/copy';
import { Locale, localeNames, type Locale as LocaleType } from '../../domain/locale';
import { href, pathOf, type SiteRoute } from '../../domain/route';
import { Icon } from '../../ui/icons';
import { ContactLink } from './contact-link';
import type { ThemeChoice } from './site-view';
import { ThemeMenu } from './theme-menu';

export type Section = 'solutions' | 'cases' | 'team' | 'company' | null;

type Props = {
  siteName: string;
  section: Section;
  route: SiteRoute;
  locale: LocaleType;
  theme?: ThemeChoice;
};

export function SiteHeader({ siteName, section, route, locale, theme }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const navigate = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = Array.from(
        header.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ).filter((item) => item.getClientRects().length > 0);
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', navigate);
    return () => window.removeEventListener('keydown', navigate);
  }, [menuOpen]);

  useEffect(() => {
    const content = document.querySelectorAll<HTMLElement>('.site-main, .site-footer');
    document.documentElement.classList.toggle('is-menu-open', menuOpen);
    content.forEach((element) => {
      element.inert = menuOpen;
    });
    if (!menuOpen) return () => document.documentElement.classList.remove('is-menu-open');
    const frame = requestAnimationFrame(() => {
      header.current?.querySelector<HTMLElement>('.site-nav a')?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove('is-menu-open');
      content.forEach((element) => {
        element.inert = false;
      });
    };
  }, [menuOpen]);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 960px)');
    const close = () => wide.matches && setMenuOpen(false);
    wide.addEventListener('change', close);
    return () => wide.removeEventListener('change', close);
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);

  const other = locale === Locale.Ru ? Locale.En : Locale.Ru;

  const links: { key: Exclude<Section, null>; href: string }[] = [
    { key: 'solutions', href: href.solutions() },
    { key: 'cases', href: href.cases() },
    { key: 'company', href: href.company() },
  ];

  return (
    <header ref={header} className={menuOpen ? 'site-header is-open' : 'site-header'}>
      <a className="wordmark" href={href.home()}>
        {siteName}
      </a>
      <a
        className="language-link header-language"
        href={`#${pathOf(route, other)}`}
        hrefLang={other}
        lang={other}
      >
        {localeNames[other]}
      </a>
      {theme && <ThemeMenu theme={theme} className="header-theme" />}
      <button
        type="button"
        ref={menuButton}
        className="menu-button"
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
      </button>
      <div
        className="site-menu"
        id="site-menu"
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest('a')) setMenuOpen(false);
        }}
      >
        <nav className="site-nav" aria-label={siteName}>
          {links.map((link) => (
            <a
              key={link.key}
              href={link.href}
              aria-current={section === link.key ? 'page' : undefined}
            >
              {t(link.key)}
            </a>
          ))}
          <ContactLink className="nav-contact" label={t('contacts')} />
        </nav>
        <div className="menu-settings" role="group" aria-label={t('settings')}>
          <a
            className="language-link menu-language"
            href={`#${pathOf(route, other)}`}
            hrefLang={other}
            lang={other}
          >
            {localeNames[other]}
          </a>
          {theme && <ThemeMenu theme={theme} className="menu-theme" />}
        </div>
      </div>
    </header>
  );
}
