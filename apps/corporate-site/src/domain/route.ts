import { useEffect, useState } from 'react';

import { Locale, activeLocale, isLocale } from './locale';

export type CaseFilter = { industry?: string; solution?: string };

export type Route =
  | { page: 'home' }
  | { page: 'company' }
  | { page: 'solutions' }
  | { page: 'solution'; slug: string }
  | { page: 'cases'; filter: CaseFilter }
  | { page: 'case'; slug: string }
  | { page: 'team'; stack?: string }
  | { page: 'member'; slug: string }
  | { page: 'contact'; topic?: string }
  | { page: 'missing' }
  | { page: 'editor' };

export type SiteRoute = Exclude<Route, { page: 'editor' }>;

export type Address = { locale: Locale; route: Route };

export const parseAddress = (hash: string): Address => {
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?');
  const [first = '', section, slug] = path.split('/');
  if (first === 'editor') return { locale: Locale.Ru, route: { page: 'editor' } };
  if (first !== '' && !isLocale(first)) return { locale: Locale.Ru, route: { page: 'missing' } };
  return { locale: isLocale(first) ? first : Locale.Ru, route: parsePage(section, slug, query) };
};

const parsePage = (section: string | undefined, slug: string | undefined, query: string): Route => {
  const params = new URLSearchParams(query);
  const param = (name: string) => params.get(name) ?? undefined;
  switch (section) {
    case undefined:
    case '':
      return { page: 'home' };
    case 'company':
      return { page: 'company' };
    case 'solutions':
      return slug ? { page: 'solution', slug } : { page: 'solutions' };
    case 'cases':
      return slug
        ? { page: 'case', slug }
        : {
            page: 'cases',
            filter: { industry: param('industry'), solution: param('solution') },
          };
    case 'team':
      return slug ? { page: 'member', slug } : { page: 'team', stack: param('stack') };
    case 'contact':
      return { page: 'contact', topic: param('topic') };
    default:
      return { page: 'missing' };
  }
};

const query = (values: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) params.set(key, value);
  const text = params.toString();
  return text ? `?${text}` : '';
};

export const pathOf = (route: SiteRoute, locale: Locale): string => {
  const base = `/${locale}`;
  switch (route.page) {
    case 'home':
    case 'missing':
      return base;
    case 'company':
      return `${base}/company`;
    case 'solutions':
      return `${base}/solutions`;
    case 'solution':
      return `${base}/solutions/${route.slug}`;
    case 'cases':
      return `${base}/cases${query(route.filter)}`;
    case 'case':
      return `${base}/cases/${route.slug}`;
    case 'team':
      return `${base}/team${query({ stack: route.stack })}`;
    case 'member':
      return `${base}/team/${route.slug}`;
    case 'contact':
      return `${base}/contact${query({ topic: route.topic })}`;
  }
};

const link = (route: SiteRoute) => `#${pathOf(route, activeLocale())}`;

export const href = {
  home: () => link({ page: 'home' }),
  company: () => link({ page: 'company' }),
  solutions: () => link({ page: 'solutions' }),
  solution: (slug: string) => link({ page: 'solution', slug }),
  cases: (filter: CaseFilter = {}) => link({ page: 'cases', filter }),
  case: (slug: string) => link({ page: 'case', slug }),
  team: (stack?: string) => link({ page: 'team', stack }),
  member: (slug: string) => link({ page: 'member', slug }),
  contact: (topic?: string) => link({ page: 'contact', topic }),
};

export const useAddress = () => {
  const [address, setAddress] = useState(() => parseAddress(location.hash));
  useEffect(() => {
    const sync = () => setAddress(parseAddress(location.hash));
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return address;
};
