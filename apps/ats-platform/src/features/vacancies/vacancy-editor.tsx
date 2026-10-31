import { useRef, useState, type FormEvent } from 'react';
import {
  statusLabels,
  validateVacancy,
  type EditorDraft,
  type FieldErrors,
  type Vacancy,
  type VacancyStatus,
} from '../../domain/workspace';
import { ActionError } from '../../ui/feedback';
import { Modal } from '../../ui/modal';

const teams = ['Разработка', 'Дизайн', 'Аналитика', 'Продукт'];
const managers = ['Марк Соколов', 'Ольга Лебедева'];
const formats = ['Удалённо', 'Гибрид', 'Офис'];
const blankDraft: EditorDraft = {
  title: '',
  team: '',
  location: 'Москва',
  format: 'Удалённо',
  salaryFrom: 150000,
  salaryTo: 220000,
  headcount: 1,
  manager: '',
  description: '',
  status: 'open',
  priority: false,
};

export function VacancyEditor({
  vacancy,
  readOnly,
  pending,
  error,
  onClose,
  onSave,
}: {
  vacancy: Vacancy | null;
  readOnly: boolean;
  pending: boolean;
  error: string;
  onClose: () => void;
  onSave: (vacancy: Vacancy) => void;
}) {
  const [draft, setDraft] = useState<EditorDraft>(vacancy ?? blankDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const change = <K extends keyof EditorDraft>(key: K, value: EditorDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (readOnly || pending) return;
    const next = validateVacancy(draft);
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    onSave({
      ...draft,
      title: draft.title.trim(),
      location: draft.location.trim(),
      description: draft.description.trim(),
      id: vacancy?.id ?? crypto.randomUUID(),
    });
  };
  const fieldError = (key: keyof EditorDraft) =>
    errors[key] ? (
      <span className="field-error" id={`error-${key}`}>
        {errors[key]}
      </span>
    ) : null;
  const invalid = (key: keyof EditorDraft) => ({
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `error-${key}` : undefined,
  });
  return (
    <Modal title={vacancy?.title ?? 'Новая вакансия'} onClose={onClose} wide>
      <form ref={formRef} noValidate onSubmit={submit} aria-busy={pending}>
        <div className="sheet-body">
          <fieldset className="form-grid" disabled={pending || readOnly}>
            <label className="span-2">
              Название
              <input
                autoFocus={!readOnly}
                value={draft.title}
                maxLength={100}
                onChange={(e) => change('title', e.target.value)}
                {...invalid('title')}
              />
              {fieldError('title')}
            </label>
            <label>
              Команда
              <select
                value={draft.team}
                onChange={(e) => change('team', e.target.value)}
                {...invalid('team')}
              >
                <option value="">Не выбрана</option>
                {teams.map((team) => (
                  <option key={team}>{team}</option>
                ))}
              </select>
              {fieldError('team')}
            </label>
            <label>
              Руководитель
              <select
                value={draft.manager}
                onChange={(e) => change('manager', e.target.value)}
                {...invalid('manager')}
              >
                <option value="">Не выбран</option>
                {managers.map((manager) => (
                  <option key={manager}>{manager}</option>
                ))}
              </select>
              {fieldError('manager')}
            </label>
            <label>
              Город
              <input
                value={draft.location}
                maxLength={80}
                onChange={(e) => change('location', e.target.value)}
                {...invalid('location')}
              />
              {fieldError('location')}
            </label>
            <label>
              Формат
              <select value={draft.format} onChange={(e) => change('format', e.target.value)}>
                {formats.map((format) => (
                  <option key={format}>{format}</option>
                ))}
              </select>
            </label>
            <label>
              Зарплата от, ₽
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="10000000"
                value={draft.salaryFrom}
                onChange={(e) => change('salaryFrom', Number(e.target.value))}
                {...invalid('salaryFrom')}
              />
              {fieldError('salaryFrom')}
            </label>
            <label>
              Зарплата до, ₽
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="10000000"
                value={draft.salaryTo}
                onChange={(e) => change('salaryTo', Number(e.target.value))}
                {...invalid('salaryTo')}
              />
              {fieldError('salaryTo')}
            </label>
            <label className="span-2">
              Задачи
              <textarea
                rows={4}
                value={draft.description}
                maxLength={2000}
                onChange={(e) => change('description', e.target.value)}
                {...invalid('description')}
              />
              {fieldError('description')}
            </label>
            <label>
              Нанять, человек
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="20"
                step="1"
                value={draft.headcount}
                onChange={(e) => change('headcount', Number(e.target.value))}
                {...invalid('headcount')}
              />
              {fieldError('headcount')}
            </label>
            <label>
              Статус
              <select
                value={draft.status}
                onChange={(e) => change('status', e.target.value as VacancyStatus)}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox span-2">
              <input
                type="checkbox"
                checked={draft.priority}
                onChange={(e) => change('priority', e.target.checked)}
              />
              Приоритетная
            </label>
          </fieldset>
          <ActionError
            message={error}
            retry={() => formRef.current?.requestSubmit()}
            pending={pending}
          />
        </div>
        <footer className="sheet-foot">
          <button className="button secondary" type="button" onClick={onClose} disabled={pending}>
            {readOnly ? 'Закрыть' : 'Отмена'}
          </button>
          {!readOnly && (
            <button className="button primary" type="submit" disabled={pending}>
              {pending ? 'Сохраняем…' : vacancy ? 'Сохранить' : 'Создать'}
            </button>
          )}
        </footer>
      </form>
    </Modal>
  );
}
