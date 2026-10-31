import type { Content, Seo } from './content';
import { t, type CopyKey } from './copy';
import type { SiteRoute } from './route';

const plain = (content: Content, route: SiteRoute, key: CopyKey): Seo => ({
  title: `${t(key)}: ${content.siteName}`,
  description: content.home.seo.description,
});

export const seoOf = (content: Content, route: SiteRoute): Seo => {
  const {} = route;
  switch (route.page) {
    case 'solution':
      return (
        content.solutions.find((item) => item.slug === route.slug)?.text.seo ??
        plain(content, route, 'missing')
      );
    case 'case':
      return (
        content.cases.find((item) => item.slug === route.slug)?.text.seo ??
        plain(content, route, 'missing')
      );
    case 'member': {
      const member = content.team.find((item) => item.slug === route.slug)?.text;
      return member
        ? { title: `${member.name}: ${content.siteName}`, description: member.bio }
        : plain(content, route, 'missing');
    }
    case 'company':
      return content.company.seo;
    case 'solutions':
      return plain(content, route, 'solutions');
    case 'cases':
      return plain(content, route, 'cases');
    case 'team':
      return plain(content, route, 'team');
    case 'contact':
      return plain(content, route, 'contactTitle');
    case 'missing':
      return plain(content, route, 'missing');
    case 'home':
      return content.home.seo;
  }
};
