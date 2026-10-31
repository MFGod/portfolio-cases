import type { Content } from '../../domain/content';
import { MediaPicker } from './media-picker';
import { RepeatField, SeoFields, TextField } from './fields';

type Props = { draft: Content; change: (draft: Content) => void };

export function HomeForm({ draft, change }: Props) {
  const home = draft.home;
  const update = (patch: Partial<typeof home>) => change({ ...draft, home: { ...home, ...patch } });
  return (
    <>
      <TextField
        label="Заголовок"
        required="title"
        rows={2}
        value={home.title}
        onChange={(title) => update({ title })}
      />
      <TextField
        label="Вводный текст"
        required="lead"
        rows={3}
        value={home.lead}
        onChange={(lead) => update({ lead })}
      />
      <RepeatField
        legend="Этапы проекта"
        items={home.stages}
        blank={{ when: '', title: '', note: '', artifact: '' }}
        addLabel="Добавить этап"
        columns={[
          { key: 'when', label: 'Срок или условие' },
          { key: 'title', label: 'Этап' },
          { key: 'note', label: 'Пояснение' },
          { key: 'artifact', label: 'Содержание этапа', rows: 2 },
        ]}
        onChange={(stages) => update({ stages })}
      />
      <SeoFields
        value={home.seo}
        onChange={(seo) => update({ seo })}
        site={draft.siteName}
        path="/"
      />
    </>
  );
}

export function CompanyForm({ draft, change }: Props) {
  const company = draft.company;
  const update = (patch: Partial<typeof company>) =>
    change({ ...draft, company: { ...company, ...patch } });
  return (
    <>
      <TextField
        label="Заголовок"
        required="title"
        value={company.title}
        onChange={(title) => update({ title })}
      />
      <TextField
        label="О компании"
        rows={5}
        value={company.intro}
        onChange={(intro) => update({ intro })}
      />
      <RepeatField
        legend="Сведения о компании"
        items={company.facts}
        blank={{ value: '', label: '' }}
        addLabel="Добавить сведение"
        columns={[
          { key: 'value', label: 'Значение' },
          { key: 'label', label: 'Подпись' },
        ]}
        onChange={(facts) => update({ facts })}
      />
      <RepeatField
        legend="Принципы"
        items={company.principles}
        blank={{ title: '', text: '' }}
        addLabel="Добавить принцип"
        columns={[
          { key: 'title', label: 'Принцип' },
          { key: 'text', label: 'Пояснение', rows: 2 },
        ]}
        onChange={(principles) => update({ principles })}
      />
      <MediaPicker
        value={draft.company.image}
        onChange={(image) => change({ ...draft, company: { ...draft.company, image } })}
      />
      <SeoFields
        value={company.seo}
        onChange={(seo) => update({ seo })}
        site={draft.siteName}
        path="/company"
      />
    </>
  );
}

export function SettingsForm({ draft, change }: Props) {
  const studio = draft.studio;
  const update = (patch: Partial<typeof studio>) =>
    change({ ...draft, studio: { ...studio, ...patch } });
  return (
    <>
      <TextField
        label="Название сайта"
        value={draft.siteName}
        onChange={(siteName) => change({ ...draft, siteName })}
      />
      <TextField
        label="О студии"
        rows={2}
        value={studio.tagline}
        onChange={(tagline) => update({ tagline })}
      />
      <TextField label="Адрес" value={studio.address} onChange={(address) => update({ address })} />
      <TextField label="Часы работы" value={studio.hours} onChange={(hours) => update({ hours })} />
      <TextField label="Реквизиты" value={studio.legal} onChange={(legal) => update({ legal })} />
    </>
  );
}
