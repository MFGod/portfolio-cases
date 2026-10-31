import { useEffect, useState } from 'react';

import {
  Industry,
  MediaKey,
  type CaseStudy,
  type Content,
  type LocalizedContent,
  type Member,
  type Solution,
} from '../../domain/content';
import { Locale, localeNames, locales } from '../../domain/locale';
import { localize, withLocale } from '../../domain/localize';
import {
  CONTENT_CHANGED,
  publishDraft,
  readDraft,
  readInquiries,
  readPublished,
  saveDraft,
} from '../../domain/repository';
import { StableLabel } from '../../ui/stable-label';
import { EditorSidebar } from './editor-sidebar';
import { InquiriesView } from './inquiries-view';
import { CaseForm, MemberForm, SolutionForm } from './item-forms';
import { CompanyForm, HomeForm, SettingsForm } from './page-forms';
import { PreviewPane } from './preview-pane';
import { MissingContext, missingFields, type Missing } from './required';
import { Collection, previewRoute, sameSection, type Section } from './sections';

type Busy = 'saving' | 'publishing' | null;

const freeSlug = (prefix: string, taken: string[]) => {
  let number = taken.length + 1;
  while (taken.includes(`${prefix}-${number}`)) number += 1;
  return `${prefix}-${number}`;
};

const blankTitles = {
  ru: { solutions: 'Новая услуга', cases: 'Новый проект', team: 'Новый человек' },
  en: { solutions: 'New service', cases: 'New project', team: 'New person' },
} satisfies Record<Locale, Record<Collection, string>>;

const blankSolution = (draft: Content, title: string): Solution => {
  const text = (title: string) => ({
    title,
    summary: '',
    body: '',
    steps: [],
    seo: { title, description: '' },
  });
  return {
    slug: freeSlug(
      'solution',
      draft.solutions.map((item) => item.slug),
    ),
    weeks: 4,
    stack: [],
    text: text(title),
  };
};

const blankCase = (draft: Content, title: string): CaseStudy => {
  const text = (title: string) => ({
    title,
    summary: '',
    task: '',
    approach: '',
    metrics: [],
    timeline: [],
    seo: { title, description: '' },
  });
  return {
    slug: freeSlug(
      'case',
      draft.cases.map((item) => item.slug),
    ),
    industry: Industry.Retail,
    solution: draft.solutions[0]?.slug ?? '',
    year: new Date().getFullYear(),
    weeks: 8,
    cover: MediaKey.Support,
    team: [],
    text: text(title),
  };
};

const blankMember = (draft: Content, name: string): Member => ({
  slug: freeSlug(
    'member',
    draft.team.map((item) => item.slug),
  ),
  since: new Date().getFullYear(),
  stack: [],
  text: { name, role: '', bio: '' },
});

const appended = (draft: Content, collection: Collection, locale: Locale): Content => {
  const title = blankTitles[locale][collection];
  switch (collection) {
    case Collection.Solutions:
      return { ...draft, solutions: [...draft.solutions, blankSolution(draft, title)] };
    case Collection.Cases:
      return { ...draft, cases: [...draft.cases, blankCase(draft, title)] };
    case Collection.Team:
      return { ...draft, team: [...draft.team, blankMember(draft, title)] };
  }
};

type Removal = { blocked: string } | { title: string; next: Content };

type MissingText = Missing & { locale: Locale };

const missingTexts = (stored: LocalizedContent): MissingText[] =>
  locales.flatMap((locale) =>
    missingFields(localize(stored, locale)).map((entry) => ({ ...entry, locale })),
  );

const withoutEntry = (
  stored: LocalizedContent,
  collection: Collection,
  index: number,
): LocalizedContent => {
  const without = <T,>(list: T[]) => list.filter((_, at) => at !== index);
  switch (collection) {
    case Collection.Solutions:
      return { ...stored, solutions: without(stored.solutions) };
    case Collection.Cases:
      return { ...stored, cases: without(stored.cases) };
    case Collection.Team:
      return { ...stored, team: without(stored.team) };
  }
};

const removal = (draft: Content, collection: Collection, index: number): Removal => {
  const without = <T,>(list: T[]) => list.filter((_, at) => at !== index);
  switch (collection) {
    case Collection.Solutions: {
      const solution = draft.solutions[index];
      const title = solution?.text.title ?? '';
      const used = draft.cases.filter((item) => item.solution === solution?.slug).length;
      if (used > 0)
        return {
          blocked: `На «${title}» ссылаются проекты: ${used}. Сначала переведите их на другую услугу.`,
        };
      return { title, next: { ...draft, solutions: without(draft.solutions) } };
    }
    case Collection.Cases:
      return {
        title: draft.cases[index]?.text.title ?? '',
        next: { ...draft, cases: without(draft.cases) },
      };
    case Collection.Team: {
      const member = draft.team[index];
      return {
        title: member?.text.name ?? '',
        next: {
          ...draft,
          team: without(draft.team),
          cases: draft.cases.map((item) => ({
            ...item,
            team: item.team.filter((slug) => slug !== member?.slug),
          })),
        },
      };
    }
  }
};

export function EditorPage() {
  const [stored, setStored] = useState(readDraft);
  const [published, setPublished] = useState(readPublished);
  const [locale, setLocale] = useState<Locale>(Locale.Ru);
  const draft = localize(stored, locale);
  const [inquiries, setInquiries] = useState(readInquiries);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>({ kind: 'home' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkRequired, setCheckRequired] = useState(false);
  const missing = checkRequired ? missingTexts(stored) : [];

  useEffect(() => {
    const sync = () => setInquiries(readInquiries());
    window.addEventListener(CONTENT_CHANGED, sync);
    return () => window.removeEventListener(CONTENT_CHANGED, sync);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);

  const change = (next: Content) => {
    setStored(withLocale(stored, locale, next));
    setDirty(true);
  };

  const run = async (kind: Exclude<Busy, null>) => {
    if (kind === 'publishing') {
      const found = missingTexts(stored);
      setCheckRequired(found.length > 0);
      const first = found[0];
      if (first) {
        const here = found.some(
          (entry) => entry.locale === locale && sameSection(entry.section, section),
        );
        if (!here) select(first.section, first.locale);
        return;
      }
    }
    setBusy(kind);
    setError(null);
    try {
      if (kind === 'saving') await saveDraft(stored);
      else setPublished(await publishDraft(stored));
      if (kind === 'publishing') setStored(readDraft());
      setDirty(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось сохранить');
    } finally {
      setBusy(null);
    }
  };

  const select = (next: Section, nextLocale: Locale = locale) => {
    setNotice(null);
    setSection(next);
    setLocale(nextLocale);
  };

  const addItem = (collection: Collection) => {
    change(appended(draft, collection, locale));
    setSection({ kind: 'item', collection, index: draft[collection].length });
  };

  const removeItem = (collection: Collection, index: number) => {
    const result = removal(draft, collection, index);
    if ('blocked' in result) {
      setNotice(result.blocked);
      return;
    }
    if (!window.confirm(`Удалить «${result.title}»?`)) return;
    setStored(withLocale(withoutEntry(stored, collection, index), locale, result.next));
    setDirty(true);
    setSection({ kind: 'home' });
  };

  const unpublished = dirty || JSON.stringify(stored) !== JSON.stringify(published);

  const itemForm = (collection: Collection, index: number) => {
    switch (collection) {
      case Collection.Solutions: {
        const item = draft.solutions[index];
        if (!item) return null;
        const replace = (next: Solution) =>
          change({
            ...draft,
            solutions: draft.solutions.map((entry, at) => (at === index ? next : entry)),
            cases: draft.cases.map((entry) =>
              entry.solution === item.slug ? { ...entry, solution: next.slug } : entry,
            ),
          });
        return <SolutionForm draft={draft} item={item} replace={replace} />;
      }
      case Collection.Cases: {
        const item = draft.cases[index];
        if (!item) return null;
        const replace = (next: CaseStudy) =>
          change({
            ...draft,
            cases: draft.cases.map((entry, at) => (at === index ? next : entry)),
          });
        return <CaseForm draft={draft} item={item} replace={replace} />;
      }
      case Collection.Team: {
        const item = draft.team[index];
        if (!item) return null;
        const replace = (next: Member) =>
          change({
            ...draft,
            team: draft.team.map((entry, at) => (at === index ? next : entry)),
            cases: draft.cases.map((entry) => ({
              ...entry,
              team: entry.team.map((slug) => (slug === item.slug ? next.slug : slug)),
            })),
          });
        return <MemberForm draft={draft} item={item} replace={replace} />;
      }
    }
  };

  const form = () => {
    const props = { draft, change };
    switch (section.kind) {
      case 'home':
        return <HomeForm {...props} />;
      case 'company':
        return <CompanyForm {...props} />;
      case 'settings':
        return <SettingsForm draft={draft} change={change} />;
      case 'inquiries':
        return <InquiriesView draft={draft} inquiries={inquiries} />;
      case 'item':
        return (
          <>
            {itemForm(section.collection, section.index)}
            <button
              type="button"
              className="text-link danger-link remove-item"
              onClick={() => removeItem(section.collection, section.index)}
            >
              Удалить
            </button>
            {notice && (
              <p className="form-error" role="alert">
                {notice}
              </p>
            )}
          </>
        );
    }
  };

  return (
    <div className="editor">
      <header className="editor-top">
        <div className="editor-heading">
          <h1>Админ-панель</h1>
          <span
            className="status-pill"
            data-state={unpublished ? 'changed' : 'published'}
            role="status"
          >
            {unpublished ? 'Есть изменения' : 'Опубликовано'}
          </span>
        </div>
        <div className="editor-actions">
          <a
            className="text-link"
            href={`#/${locale}`}
            onClick={(event) => {
              if (dirty && !window.confirm('Уйти без сохранения?')) event.preventDefault();
            }}
          >
            Открыть сайт
          </a>
          <button
            type="button"
            className="button secondary"
            disabled={!dirty || busy !== null}
            onClick={() => void run('saving')}
          >
            <StableLabel
              labels={['Сохранить', 'Сохраняем…']}
              current={busy === 'saving' ? 'Сохраняем…' : 'Сохранить'}
            />
          </button>
          <button
            type="button"
            className="button primary"
            disabled={!unpublished || busy !== null}
            onClick={() => void run('publishing')}
          >
            <StableLabel
              labels={['Опубликовать', 'Публикуем…']}
              current={busy === 'publishing' ? 'Публикуем…' : 'Опубликовать'}
            />
          </button>
        </div>
      </header>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {missing.length > 0 && (
        <div className="publish-blocked" role="alert">
          <p>Заполните поля:</p>
          <ul>
            {missing.map((entry, at) => (
              <li key={at}>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => select(entry.section, entry.locale)}
                >
                  {entry.place} ({localeNames[entry.locale]}): {entry.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={previewOpen ? 'editor-body is-previewing' : 'editor-body'}>
        <EditorSidebar
          draft={draft}
          section={section}
          inquiries={inquiries.length}
          select={select}
          add={addItem}
        />
        <div className="editor-form">
          {section.kind !== 'inquiries' && (
            <div className="locale-switch" role="group" aria-label="Язык текстов">
              {locales.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={key === locale}
                  onClick={() => setLocale(key)}
                >
                  {localeNames[key]}
                </button>
              ))}
            </div>
          )}
          <MissingContext.Provider
            value={
              new Set(
                missing
                  .filter((entry) => entry.locale === locale && sameSection(entry.section, section))
                  .map((entry) => entry.field),
              )
            }
          >
            {form()}
          </MissingContext.Provider>
          {section.kind !== 'inquiries' && (
            <button
              type="button"
              className="button secondary preview-toggle"
              aria-expanded={previewOpen}
              onClick={() => setPreviewOpen(!previewOpen)}
            >
              <StableLabel
                labels={['Предпросмотр', 'Скрыть предпросмотр']}
                current={previewOpen ? 'Скрыть предпросмотр' : 'Предпросмотр'}
              />
            </button>
          )}
        </div>
        {section.kind !== 'inquiries' && (
          <PreviewPane draft={draft} route={previewRoute(section, draft)} locale={locale} />
        )}
      </div>
    </div>
  );
}
