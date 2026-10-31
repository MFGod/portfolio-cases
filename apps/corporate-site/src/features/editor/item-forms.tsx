import {
  industryLabels,
  type CaseStudy,
  type Content,
  type Industry,
  type Member,
  type Solution,
} from '../../domain/content';
import { NumberField, RepeatField, SeoFields, SlugField, TagsField, TextField } from './fields';
import { MediaPicker } from './media-picker';

type Props<T> = { draft: Content; item: T; replace: (item: T) => void };

const slugTaken =
  <T extends { slug: string }>(list: T[], self: T) =>
  (slug: string) =>
    list.some((entry) => entry.slug === slug && entry !== self);

export function SolutionForm({ draft, item, replace }: Props<Solution>) {
  const text = item.text;
  const update = (patch: Partial<typeof text>) => replace({ ...item, text: { ...text, ...patch } });
  return (
    <>
      <TextField
        label="Название"
        required="title"
        value={text.title}
        onChange={(title) => update({ title })}
      />
      <TextField
        label="Кратко"
        required="summary"
        rows={2}
        value={text.summary}
        onChange={(summary) => update({ summary })}
      />
      <TextField
        label="Описание"
        rows={5}
        value={text.body}
        onChange={(body) => update({ body })}
      />
      <RepeatField
        legend="Рабочий процесс"
        items={text.steps}
        blank={{ title: '', text: '' }}
        addLabel="Добавить шаг"
        columns={[
          { key: 'title', label: 'Шаг' },
          { key: 'text', label: 'Что делаем', rows: 2 },
        ]}
        onChange={(steps) => update({ steps })}
      />
      <div className="field-row">
        <SlugField
          value={item.slug}
          taken={slugTaken(draft.solutions, item)}
          onChange={(slug) => replace({ ...item, slug })}
        />
      </div>
      <TagsField
        label="Стек"
        value={item.stack}
        onChange={(stack) => replace({ ...item, stack })}
      />
      <SeoFields
        value={text.seo}
        onChange={(seo) => update({ seo })}
        site={draft.siteName}
        path={`/solutions/${item.slug}`}
      />
    </>
  );
}

export function CaseForm({ draft, item, replace }: Props<CaseStudy>) {
  const text = item.text;
  const update = (patch: Partial<typeof text>) => replace({ ...item, text: { ...text, ...patch } });
  const toggleMember = (slug: string) =>
    replace({
      ...item,
      team: item.team.includes(slug)
        ? item.team.filter((entry) => entry !== slug)
        : [...item.team, slug],
    });
  return (
    <>
      <TextField
        label="Заголовок"
        required="title"
        value={text.title}
        onChange={(title) => update({ title })}
      />
      <TextField
        label="Краткое описание"
        required="summary"
        value={text.summary}
        onChange={(summary) => update({ summary })}
      />
      <TextField label="Задача" rows={3} value={text.task} onChange={(task) => update({ task })} />
      <TextField
        label="Решение"
        rows={4}
        value={text.approach}
        onChange={(approach) => update({ approach })}
      />
      <RepeatField
        legend="Результат"
        items={text.metrics}
        blank={{ label: '', before: '', after: '' }}
        addLabel="Добавить метрику"
        columns={[
          { key: 'label', label: 'Метрика' },
          { key: 'before', label: 'Было' },
          { key: 'after', label: 'Стало' },
        ]}
        onChange={(metrics) => update({ metrics })}
      />
      <RepeatField
        legend="Ход проекта"
        items={text.timeline}
        blank={{ when: '', title: '', text: '' }}
        addLabel="Добавить этап"
        columns={[
          { key: 'when', label: 'Когда' },
          { key: 'title', label: 'Этап' },
          { key: 'text', label: 'Что было' },
        ]}
        onChange={(timeline) => update({ timeline })}
      />
      <div className="field-row">
        <label className="field">
          <span>Отрасль</span>
          <select
            value={item.industry}
            onChange={(event) => replace({ ...item, industry: event.target.value as Industry })}
          >
            {(Object.keys(industryLabels.ru) as Industry[]).map((key) => (
              <option key={key} value={key}>
                {industryLabels.ru[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Услуга</span>
          <select
            value={item.solution}
            onChange={(event) => replace({ ...item, solution: event.target.value })}
          >
            {draft.solutions.map((solution) => (
              <option key={solution.slug} value={solution.slug}>
                {solution.text.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="field-group">
        <legend>Команда проекта</legend>
        <div className="check-grid">
          {draft.team.map((member) => (
            <label className="check" key={member.slug}>
              <input
                type="checkbox"
                checked={item.team.includes(member.slug)}
                onChange={() => toggleMember(member.slug)}
              />
              {member.text.name}
            </label>
          ))}
        </div>
      </fieldset>
      <SlugField
        value={item.slug}
        taken={slugTaken(draft.cases, item)}
        onChange={(slug) => replace({ ...item, slug })}
      />
      <MediaPicker value={item.cover} onChange={(cover) => replace({ ...item, cover })} />
      <SeoFields
        value={text.seo}
        onChange={(seo) => update({ seo })}
        site={draft.siteName}
        path={`/cases/${item.slug}`}
      />
    </>
  );
}

export function MemberForm({ draft, item, replace }: Props<Member>) {
  const text = item.text;
  const update = (patch: Partial<typeof text>) => replace({ ...item, text: { ...text, ...patch } });
  return (
    <>
      <TextField
        label="Имя"
        required="name"
        value={text.name}
        onChange={(name) => update({ name })}
      />
      <TextField
        label="Роль"
        required="role"
        value={text.role}
        onChange={(role) => update({ role })}
      />
      <TextField label="О человеке" rows={3} value={text.bio} onChange={(bio) => update({ bio })} />
      <TagsField
        label="Стек"
        value={item.stack}
        onChange={(stack) => replace({ ...item, stack })}
      />
      <div className="field-row">
        <SlugField
          value={item.slug}
          taken={slugTaken(draft.team, item)}
          onChange={(slug) => replace({ ...item, slug })}
        />
        <NumberField
          label="В команде с"
          value={item.since}
          min={2015}
          max={2030}
          onChange={(since) => replace({ ...item, since })}
        />
      </div>
    </>
  );
}
