import { createContext, useContext } from 'react';

import type { Content } from '../../domain/content';
import { Collection, type Section } from './sections';

export type Missing = { section: Section; field: string; place: string; label: string };

const blank = (value: string) => value.trim() === '';

export const missingFields = (draft: Content): Missing[] => {
  const missing: Missing[] = [];
  const check = (section: Section, place: string, fields: [string, string, string][]) => {
    for (const [field, label, value] of fields)
      if (blank(value)) missing.push({ section, field, place, label });
  };

  check({ kind: 'home' }, 'Главная', [
    ['title', 'Заголовок', draft.home.title],
    ['lead', 'Вводный текст', draft.home.lead],
  ]);
  check({ kind: 'company' }, 'О компании', [['title', 'Заголовок', draft.company.title]]);
  draft.solutions.forEach((item, index) =>
    check(
      { kind: 'item', collection: Collection.Solutions, index },
      item.text.title || 'Услуга без названия',
      [
        ['title', 'Название', item.text.title],
        ['summary', 'Кратко', item.text.summary],
      ],
    ),
  );
  draft.cases.forEach((item, index) =>
    check(
      { kind: 'item', collection: Collection.Cases, index },
      item.text.title || 'Проект без названия',
      [
        ['title', 'Заголовок', item.text.title],
        ['summary', 'Краткое описание', item.text.summary],
      ],
    ),
  );
  draft.team.forEach((item, index) =>
    check({ kind: 'item', collection: Collection.Team, index }, item.text.name || 'Без имени', [
      ['name', 'Имя', item.text.name],
      ['role', 'Роль', item.text.role],
    ]),
  );
  return missing;
};

export const MissingContext = createContext<ReadonlySet<string>>(new Set());

export const useMissing = (field?: string) => {
  const missing = useContext(MissingContext);
  return field !== undefined && missing.has(field);
};
