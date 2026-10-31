import type { Content, LocalizedContent } from './content';
import { locales, type Locale, type Localized } from './locale';

export const localize = (content: LocalizedContent, locale: Locale): Content => ({
  version: content.version,
  siteName: content.siteName[locale],
  studio: content.studio[locale],
  home: content.home[locale],
  company: { ...content.company.text[locale], image: content.company.image },
  solutions: content.solutions.map((item) => ({ ...item, text: item.text[locale] })),
  cases: content.cases.map((item) => ({ ...item, text: item.text[locale] })),
  team: content.team.map((item) => ({ ...item, text: item.text[locale] })),
});

const replaced = <T>(previous: Localized<T> | undefined, locale: Locale, value: T): Localized<T> =>
  previous
    ? { ...previous, [locale]: value }
    : (Object.fromEntries(locales.map((key) => [key, value])) as Localized<T>);

const mergedList = <T extends { text: unknown }>(
  previous: (Omit<T, 'text'> & { text: Localized<T['text']> })[],
  locale: Locale,
  next: T[],
) =>
  next.map((item, index) => ({
    ...item,
    text: replaced(previous[index]?.text, locale, item.text as T['text']),
  }));

export const withLocale = (
  content: LocalizedContent,
  locale: Locale,
  next: Content,
): LocalizedContent => {
  const { image, ...company } = next.company;
  return {
    version: next.version,
    siteName: replaced(content.siteName, locale, next.siteName),
    studio: replaced(content.studio, locale, next.studio),
    home: replaced(content.home, locale, next.home),
    company: { image, text: replaced(content.company.text, locale, company) },
    solutions: mergedList(content.solutions, locale, next.solutions),
    cases: mergedList(content.cases, locale, next.cases),
    team: mergedList(content.team, locale, next.team),
  };
};
