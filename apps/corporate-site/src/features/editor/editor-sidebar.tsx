import { useEffect, useRef } from 'react';

import type { Content } from '../../domain/content';
import { Collection, sameSection, type Section } from './sections';

type Props = {
  draft: Content;
  section: Section;
  inquiries: number;
  select: (section: Section) => void;
  add: (collection: Collection) => void;
};

const groups: { collection: Collection; title: string; add: string }[] = [
  { collection: Collection.Solutions, title: 'Услуги', add: 'Добавить услугу' },
  { collection: Collection.Cases, title: 'Проекты', add: 'Добавить проект' },
  { collection: Collection.Team, title: 'Команда', add: 'Добавить человека' },
];

const titleOf = (draft: Content, collection: Collection, index: number) => {
  if (collection === Collection.Team) return draft.team[index]?.text.name ?? '';
  return draft[collection][index]?.text.title ?? '';
};

export function EditorSidebar({ draft, section, inquiries, select, add }: Props) {
  const strip = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = strip.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current]');
    if (!nav || !current || nav.scrollWidth <= nav.clientWidth) return;
    const navBox = nav.getBoundingClientRect();
    const box = current.getBoundingClientRect();
    nav.scrollLeft += box.left - navBox.left - (navBox.width - box.width) / 2;
  }, [section]);

  const item = (target: Section, label: string, meta?: string) => (
    <li key={target.kind === 'item' ? `${target.collection}-${target.index}` : target.kind}>
      <button
        type="button"
        className="sidebar-item"
        aria-current={sameSection(section, target) ? 'page' : undefined}
        onClick={() => select(target)}
      >
        <span>{label}</span>
        {meta && <span className="sidebar-meta">{meta}</span>}
      </button>
    </li>
  );

  return (
    <nav className="editor-sidebar" aria-label="Разделы админ-панели" ref={strip}>
      <h2>Страницы</h2>
      <ul>
        {item({ kind: 'home' }, 'Главная', '/')}
        {item({ kind: 'company' }, 'О компании', '/company')}
      </ul>
      {groups.map((group) => (
        <div className="sidebar-group" key={group.collection}>
          <h2>{group.title}</h2>
          <ul>
            {draft[group.collection].map((entry, index) =>
              item(
                { kind: 'item', collection: group.collection, index },
                titleOf(draft, group.collection, index),
                `/${entry.slug}`,
              ),
            )}
          </ul>
          <button
            type="button"
            className="button secondary small"
            onClick={() => add(group.collection)}
          >
            {group.add}
          </button>
        </div>
      ))}
      <h2>Сайт</h2>
      <ul>
        {item({ kind: 'settings' }, 'Настройки')}
        {item({ kind: 'inquiries' }, 'Заявки', String(inquiries))}
      </ul>
    </nav>
  );
}
