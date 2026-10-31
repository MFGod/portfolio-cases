import { useEffect, useId, useState } from 'react';

import { useMissing } from './required';

type TextProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  hintWarns?: boolean;
  required?: string;
};

export function TextField({ label, value, onChange, rows, hint, hintWarns, required }: TextProps) {
  const errorId = useId();
  const missing = useMissing(required) && value.trim() === '';
  const control = {
    value,
    'aria-invalid': missing || undefined,
    'aria-describedby': missing ? errorId : undefined,
  };
  return (
    <label className="field">
      <span>{label}</span>
      {rows ? (
        <textarea rows={rows} {...control} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input {...control} onChange={(event) => onChange(event.target.value)} />
      )}
      {missing && (
        <small className="field-error" id={errorId}>
          Без этого поля страницу не опубликовать
        </small>
      )}
      {hint && <small className={hintWarns ? 'field-hint is-warning' : 'field-hint'}>{hint}</small>}
    </label>
  );
}

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

export function SeoFields({
  value,
  onChange,
  site,
  path,
}: {
  value: { title: string; description: string };
  onChange: (value: { title: string; description: string }) => void;
  site: string;
  path: string;
}) {
  const crumbs = path.split('/').filter(Boolean);
  return (
    <fieldset className="field-group">
      <legend>SEO</legend>
      <TextField
        label="Title"
        value={value.title}
        hint={`${value.title.length} из ${TITLE_LIMIT} символов`}
        hintWarns={value.title.length > TITLE_LIMIT}
        onChange={(title) => onChange({ ...value, title })}
      />
      <TextField
        label="Description"
        rows={2}
        value={value.description}
        hint={`${value.description.length} из ${DESCRIPTION_LIMIT} символов`}
        hintWarns={value.description.length > DESCRIPTION_LIMIT}
        onChange={(description) => onChange({ ...value, description })}
      />
      <figure className="search-snippet">
        <p className="snippet-site">{[site, ...crumbs].join(' › ')}</p>
        <p className="snippet-title">{value.title || site}</p>
        {value.description && <p className="snippet-text">{value.description}</p>}
      </figure>
    </fieldset>
  );
}

export function TagsField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <TextField
      label={label}
      value={value.join(', ')}
      hint="Через запятую"
      onChange={(text) =>
        onChange(
          text
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

type RepeatColumn<T> = { key: keyof T & string; label: string; rows?: number };

export function RepeatField<T extends Record<string, string>>({
  legend,
  items,
  columns,
  blank,
  addLabel,
  onChange,
}: {
  legend: string;
  items: T[];
  columns: RepeatColumn<T>[];
  blank: T;
  addLabel: string;
  onChange: (items: T[]) => void;
}) {
  const update = (index: number, patch: Partial<T>) =>
    onChange(items.map((item, position) => (position === index ? { ...item, ...patch } : item)));
  return (
    <fieldset className="field-group">
      <legend>{legend}</legend>
      {items.map((item, index) => (
        <div className="repeat-row" key={index}>
          {columns.map((column) => (
            <TextField
              key={column.key}
              label={column.label}
              rows={column.rows}
              value={item[column.key] ?? ''}
              onChange={(value) => update(index, { [column.key]: value } as Partial<T>)}
            />
          ))}
          <button
            type="button"
            className="text-link danger-link"
            onClick={() => onChange(items.filter((_, position) => position !== index))}
          >
            Убрать
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button secondary small"
        onClick={() => onChange([...items, { ...blank }])}
      >
        {addLabel}
      </button>
    </fieldset>
  );
}

const SLUG = /^[a-z0-9-]+$/;

function CheckedField({
  label,
  value,
  hint,
  parse,
  onChange,
}: {
  label: string;
  value: string;
  hint: string;
  parse: (text: string) => string | null;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const valid = parse(text) !== null;
  return (
    <label className="field">
      <span>{label}</span>
      <input
        value={text}
        aria-invalid={!valid}
        onChange={(event) => {
          setText(event.target.value);
          const next = parse(event.target.value);
          if (next !== null && next !== value) onChange(next);
        }}
        onBlur={() => setText(value)}
      />
      <small className="field-hint">{hint}</small>
    </label>
  );
}

export function SlugField({
  value,
  taken,
  onChange,
}: {
  value: string;
  taken: (slug: string) => boolean;
  onChange: (slug: string) => void;
}) {
  return (
    <CheckedField
      label="Адрес"
      value={value}
      hint="Латиница, цифры и дефис"
      parse={(text) => {
        const next = text.toLowerCase().trim();
        return SLUG.test(next) && (next === value || !taken(next)) ? next : null;
      }}
      onChange={onChange}
    />
  );
}

export function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <CheckedField
      label={label}
      value={String(value)}
      hint={`От ${min} до ${max}`}
      parse={(text) => {
        const next = Number(text);
        return text.trim() !== '' && Number.isInteger(next) && next >= min && next <= max
          ? String(next)
          : null;
      }}
      onChange={(text) => onChange(Number(text))}
    />
  );
}
