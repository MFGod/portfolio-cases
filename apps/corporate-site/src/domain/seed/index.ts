import type { LocalizedContent } from '../content';
import { cases } from './cases';
import * as en from './en';
import { company, home } from './pages';
import { solutions } from './solutions';
import { team } from './team';

const translation = <T>(texts: Record<string, T>, slug: string): T => {
  const text = texts[slug];
  if (!text) throw new Error(`No English text for «${slug}»`);
  return text;
};

const { image, ...companyText } = company;

export const initialContent: LocalizedContent = {
  version: 1,
  siteName: { ru: 'Пунктир', en: 'Punktir' },
  studio: {
    ru: {
      tagline: '',
      address: 'Москва, Сущёвский Вал, 18, офис 504',
      hours: 'Пн–Пт, 10:00–19:00',
      legal: 'ООО «Пунктир»',
    },
    en: en.studio,
  },
  home: { ru: home, en: en.home },
  company: { image, text: { ru: companyText, en: en.company } },
  solutions: solutions.map((item) => ({
    ...item,
    text: { ru: item.text, en: translation(en.solutions, item.slug) },
  })),
  cases: cases.map((item) => ({
    ...item,
    text: { ru: item.text, en: translation(en.cases, item.slug) },
  })),
  team: team.map((item) => ({
    ...item,
    text: { ru: item.text, en: translation(en.team, item.slug) },
  })),
};
