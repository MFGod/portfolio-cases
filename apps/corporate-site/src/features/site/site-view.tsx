import { t } from '../../domain/copy';

import type { Content } from '../../domain/content';
import { setActiveLocale, type Locale } from '../../domain/locale';
import type { SiteRoute } from '../../domain/route';
import type { Theme } from '../../domain/theme';
import { CasePage, CasesPage } from './case-pages';
import { CompanyPage } from './company-page';
import { ContactPage } from './contact-page';
import { HomePage } from './home-page';
import { MissingPage } from './missing-page';
import { SiteFooter } from './site-footer';
import { SiteHeader, type Section } from './site-header';
import { SolutionPage, SolutionsPage } from './solution-pages';
import { MemberPage, TeamPage } from './team-pages';

export type { SiteRoute };

export type ThemeChoice = { current: Theme; choose: (theme: Theme) => void };

const sectionOf = (route: SiteRoute): Section => {
  switch (route.page) {
    case 'solutions':
    case 'solution':
      return 'solutions';
    case 'cases':
    case 'case':
      return 'cases';
    case 'team':
    case 'member':
      return 'team';
    case 'company':
      return 'company';
    default:
      return null;
  }
};

function Page({ content, route }: { content: Content; route: SiteRoute }) {
  const props = { content };
  switch (route.page) {
    case 'home':
      return <HomePage {...props} />;
    case 'company':
      return <CompanyPage {...props} />;
    case 'solutions':
      return <SolutionsPage {...props} />;
    case 'solution':
      return <SolutionPage {...props} slug={route.slug} />;
    case 'cases':
      return <CasesPage {...props} filter={route.filter} />;
    case 'case':
      return <CasePage {...props} slug={route.slug} />;
    case 'team':
      return <TeamPage {...props} stack={route.stack} />;
    case 'member':
      return <MemberPage {...props} slug={route.slug} />;
    case 'contact':
      return <ContactPage {...props} key={route.topic ?? 'other'} topic={route.topic} />;
    case 'missing':
      return <MissingPage />;
  }
}

export function SiteView({
  content,
  route,
  locale,
  theme,
}: {
  content: Content;
  route: SiteRoute;
  locale: Locale;
  theme?: ThemeChoice;
}) {
  setActiveLocale(locale);
  return (
    <div className={route.page === 'home' ? 'site site-home' : 'site'} lang={locale}>
      <a
        className="skip-link"
        href="#content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('content')?.focus();
        }}
      >
        {t('skip')}
      </a>
      <SiteHeader
        siteName={content.siteName}
        section={sectionOf(route)}
        route={route}
        locale={locale}
        theme={theme}
      />
      <main className="site-main" id="content" tabIndex={-1}>
        <Page content={content} route={route} />
      </main>
      <SiteFooter content={content} />
    </div>
  );
}
