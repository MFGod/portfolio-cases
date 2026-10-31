import { activeLocale, type Localized } from './locale';

export const MediaKey = {
  Support: 'support',
  Documents: 'documents',
  Triage: 'triage',
  Clinic: 'clinic',
  Team: 'team',
  Product: 'product',
  Returns: 'returns',
  Freight: 'freight',
  Finance: 'finance',
  School: 'school',
} as const;
export type MediaKey = (typeof MediaKey)[keyof typeof MediaKey];

export const Industry = {
  Retail: 'retail',
  Health: 'health',
  Logistics: 'logistics',
  Finance: 'finance',
  Education: 'education',
} as const;
export type Industry = (typeof Industry)[keyof typeof Industry];

export const industryLabels: Localized<Record<Industry, string>> = {
  ru: {
    [Industry.Retail]: 'Ритейл',
    [Industry.Health]: 'Медицина',
    [Industry.Logistics]: 'Логистика',
    [Industry.Finance]: 'Финансы',
    [Industry.Education]: 'Образование',
  },
  en: {
    [Industry.Retail]: 'Retail',
    [Industry.Health]: 'Healthcare',
    [Industry.Logistics]: 'Logistics',
    [Industry.Finance]: 'Finance',
    [Industry.Education]: 'Education',
  },
};

export const industryName = (industry: Industry) => industryLabels[activeLocale()][industry];

export type Seo = { title: string; description: string };

export type Stage = { when: string; title: string; note: string; artifact: string };

export type HomeText = { title: string; lead: string; stages: Stage[]; seo: Seo };

export type Principle = { title: string; text: string };
export type Fact = { value: string; label: string };
export type CompanyText = {
  title: string;
  intro: string;
  facts: Fact[];
  principles: Principle[];
  seo: Seo;
};

export type SolutionStep = { title: string; text: string };
export type SolutionText = {
  title: string;
  summary: string;
  body: string;
  steps: SolutionStep[];
  seo: Seo;
};
export type Solution = {
  slug: string;
  weeks: number;
  stack: string[];
  text: SolutionText;
};

export type Metric = { label: string; before: string; after: string };
export type Milestone = { when: string; title: string; text: string };
export type CaseText = {
  title: string;
  summary: string;
  task: string;
  approach: string;
  metrics: Metric[];
  timeline: Milestone[];
  seo: Seo;
};
export type CaseStudy = {
  slug: string;
  industry: Industry;
  solution: string;
  year: number;
  weeks: number;
  cover: MediaKey;
  team: string[];
  text: CaseText;
};

export type MemberText = { name: string; role: string; bio: string };
export type Member = {
  slug: string;
  since: number;
  stack: string[];
  text: MemberText;
};

export type Studio = {
  tagline: string;
  address: string;
  hours: string;
  legal: string;
};

export type Content = {
  version: number;
  siteName: string;
  studio: Studio;
  home: HomeText;
  company: CompanyText & { image: MediaKey };
  solutions: Solution[];
  cases: CaseStudy[];
  team: Member[];
};

type WithLocalizedText<T extends { text: unknown }> = Omit<T, 'text'> & {
  text: Localized<T['text']>;
};

export type LocalizedContent = {
  version: number;
  siteName: Localized<string>;
  studio: Localized<Studio>;
  home: Localized<HomeText>;
  company: { image: MediaKey; text: Localized<CompanyText> };
  solutions: WithLocalizedText<Solution>[];
  cases: WithLocalizedText<CaseStudy>[];
  team: WithLocalizedText<Member>[];
};

export type Inquiry = {
  id: string;
  name: string;
  company: string;
  email: string;
  topic: string;
  message: string;
  at: string;
};
