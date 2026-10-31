import { useId } from 'react';

import type { MediaKey, Member } from '../../domain/content';
import { href } from '../../domain/route';
import { Icon } from '../../ui/icons';
import { ProjectShot } from './project-shot';

export type IndexEntry = {
  key: string;
  href: string;
  kind?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  detail?: string;
  end?: string;
  cover?: MediaKey;
};

export function IndexList({ entries, label }: { entries: IndexEntry[]; label: string }) {
  return (
    <ol className="index-list" aria-label={label}>
      {entries.map((entry) => (
        <li key={entry.key}>
          <a
            className={[
              'index-row',
              !entry.kind && 'index-row-plain',
              entry.cover && 'index-row-shot',
            ]
              .filter(Boolean)
              .join(' ')}
            href={entry.href}
          >
            {entry.cover && <ProjectShot cover={entry.cover} />}
            {entry.kind && <span className="index-kind">{entry.kind}</span>}
            <span className="index-title">
              {entry.title}
              {entry.subtitle && <span className="index-subtitle">{entry.subtitle}</span>}
            </span>
            {(entry.meta || entry.detail) && (
              <span className="index-meta">
                {entry.meta}
                {entry.detail && <span className="index-detail">{entry.detail}</span>}
              </span>
            )}
            <span className="index-end">
              {entry.end}
              <Icon name="arrow" size={16} />
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export type StepEntry = {
  key: string;
  title: string;
  when?: string;
  lead?: string;
  text?: string;
};

export function StepList({ entries, label }: { entries: StepEntry[]; label: string }) {
  return (
    <ol className="steps" aria-label={label}>
      {entries.map((entry) => (
        <li key={entry.key}>
          <h3>{entry.title}</h3>
          {(entry.when || entry.lead || entry.text) && (
            <div className="step-body">
              {entry.when && <p className="step-when">{entry.when}</p>}
              {entry.lead && <p className="step-lead">{entry.lead}</p>}
              {entry.text && <p>{entry.text}</p>}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export function SectionHead({
  title,
  link,
}: {
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {link && (
        <a className="text-link" href={link.href}>
          {link.label}
        </a>
      )}
    </div>
  );
}

export function People({ members, label }: { members: Member[]; label: string }) {
  return (
    <ul className="people" aria-label={label}>
      {members.map((member) => (
        <li key={member.slug}>
          <a className="person" href={href.member(member.slug)}>
            <span>
              <span className="person-name">{member.text.name}</span>
              <span className="person-role">{member.text.role}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export type FilterOption = { value?: string; label: string; empty: boolean };

export function FilterLinks({
  label,
  options,
  current,
  link,
}: {
  label: string;
  options: FilterOption[];
  current?: string;
  link: (value?: string) => string;
}) {
  const id = useId();
  return (
    <nav className="filter" aria-label={label}>
      <label className="filter-label" htmlFor={id}>
        {label}
      </label>
      <div className="field filter-select">
        <select
          id={id}
          value={current ?? ''}
          onChange={(event) => {
            window.location.hash = link(event.target.value || undefined);
          }}
        >
          {options.map((option) => (
            <option key={option.value ?? 'all'} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <ul className="filter-pills">
        {options.map((option) => (
          <li key={option.value ?? 'all'}>
            <a
              href={link(option.value)}
              aria-current={option.value === current ? 'true' : undefined}
              className={option.empty ? 'is-empty' : undefined}
            >
              {option.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
