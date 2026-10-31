import type { Content } from '../../domain/content';
import { t } from '../../domain/copy';
import { href } from '../../domain/route';
import { ContactLink } from './contact-link';

const YEAR = 2026;

export function SiteFooter({ content }: { content: Content }) {
  const studio = content.studio;
  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <span className="wordmark">{content.siteName}</span>
        {studio.tagline && <p>{studio.tagline}</p>}
      </div>
      <div className="footer-columns">
        <div className="footer-contacts">
          <h2>{t('contacts')}</h2>
          <ContactLink className="footer-reach" />
          {studio.address && <span>{studio.address}</span>}
          {studio.hours && <span>{studio.hours}</span>}
        </div>
        <nav className="footer-nav" aria-label={t('solutions')}>
          <h2>{t('solutions')}</h2>
          {content.solutions.map((item) => (
            <a key={item.slug} href={href.solution(item.slug)}>
              {item.text.title}
            </a>
          ))}
        </nav>
        <nav className="footer-nav" aria-label={t('studio')}>
          <h2>{t('studio')}</h2>
          <a href={href.cases()}>{t('cases')}</a>
          <a href={href.team()}>{t('team')}</a>
          <a href={href.company()}>{t('company')}</a>
        </nav>
      </div>
      <div className="footer-legal">
        <span>
          © {YEAR} {studio.legal}
        </span>
        <a className="footer-editor" href="#/editor">
          {t('editor')}
        </a>
      </div>
    </footer>
  );
}
