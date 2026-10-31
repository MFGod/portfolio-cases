export type CalculationDraft = {
  startDate: string;
  startValue: string;
  endDate: string;
  endValue: string;
};
export type CalculationField = keyof CalculationDraft;
export type CalculationErrors = Partial<Record<CalculationField, string>>;
export type CalculationResult = {
  startDate: string;
  endDate: string;
  startValue: number;
  endValue: number;
  intervalDays: number;
  absoluteChange: number;
  percentageChange: number;
};
export type CalculationState = {
  version: 1;
  draft: CalculationDraft;
  revision: number;
  confirmed: { draft: CalculationDraft; revision: number } | null;
};
const fields: CalculationField[] = ['startDate', 'startValue', 'endDate', 'endValue'];

export function defaultCalculationState(): CalculationState {
  return {
    version: 1,
    draft: {
      startDate: '2026-10-01',
      startValue: '100',
      endDate: '2026-10-15',
      endValue: '125',
    },
    revision: 0,
    confirmed: null,
  };
}

function calendarStamp(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  if (year < 1) return null;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return date.getTime();
}

function numericValue(value: string): number | null {
  const text = value.trim();
  if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)) return null;
  const parsed = Number(text.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateCalculation(draft: CalculationDraft): CalculationErrors {
  const errors: CalculationErrors = {};
  const start = calendarStamp(draft.startDate);
  const end = calendarStamp(draft.endDate);
  const initial = numericValue(draft.startValue);
  const final = numericValue(draft.endValue);
  if (start === null) errors.startDate = 'Укажите существующую дату.';
  if (end === null) errors.endDate = 'Укажите существующую дату.';
  if (start !== null && end !== null && end <= start) {
    errors.endDate = 'Конечная дата должна быть позже начальной.';
  }
  if (initial === null || initial <= 0) {
    errors.startValue = 'Введите число больше нуля.';
  }
  if (final === null || final < 0) {
    errors.endValue = 'Введите число не меньше нуля.';
  }
  if (initial !== null && initial > 0 && final !== null) {
    if (!Number.isFinite(((final - initial) / initial) * 100)) {
      errors.endValue = 'Разница слишком велика. Уменьшите диапазон значений.';
    }
  }
  return errors;
}

export function calculate(draft: CalculationDraft): CalculationResult {
  if (Object.keys(validateCalculation(draft)).length) {
    throw new Error('Исправьте поля расчёта.');
  }
  const startValue = numericValue(draft.startValue)!;
  const endValue = numericValue(draft.endValue)!;
  const absoluteChange = endValue - startValue;
  return {
    startDate: draft.startDate,
    endDate: draft.endDate,
    startValue,
    endValue,
    intervalDays: (calendarStamp(draft.endDate)! - calendarStamp(draft.startDate)!) / 86400000,
    absoluteChange,
    percentageChange: (absoluteChange / startValue) * 100,
  };
}

export function changeCalculationField(
  state: CalculationState,
  field: CalculationField,
  value: string,
): CalculationState {
  return {
    ...state,
    draft: { ...state.draft, [field]: value },
    revision: state.revision + 1,
  };
}

export function confirmCalculation(state: CalculationState): CalculationState {
  calculate(state.draft);
  return { ...state, confirmed: { draft: { ...state.draft }, revision: state.revision } };
}

export function isCurrentCalculation(state: CalculationState): boolean {
  return state.confirmed !== null && state.revision === state.confirmed.revision;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function draftShape(value: unknown): value is CalculationDraft {
  return (
    record(value) &&
    fields.every((field) => typeof value[field] === 'string' && value[field].length <= 128)
  );
}
function revisionShape(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value < Number.MAX_SAFE_INTEGER
  );
}

export function restoreCalculation(value: unknown): CalculationState {
  const invalid = () => new Error('Сохранённый расчёт повреждён. Данные не изменены.');
  if (
    !record(value) ||
    value.version !== 1 ||
    !draftShape(value.draft) ||
    !revisionShape(value.revision)
  )
    throw invalid();
  let confirmed: CalculationState['confirmed'] = null;
  if (value.confirmed !== null) {
    const saved = value.confirmed;
    if (
      !record(saved) ||
      !draftShape(saved.draft) ||
      !revisionShape(saved.revision) ||
      saved.revision > value.revision ||
      Object.keys(validateCalculation(saved.draft)).length
    ) {
      throw invalid();
    }
    const confirmedDraft = saved.draft;
    const currentDraft = value.draft;
    if (
      saved.revision === value.revision &&
      fields.some((field) => confirmedDraft[field] !== currentDraft[field])
    )
      throw invalid();
    confirmed = { draft: { ...confirmedDraft }, revision: saved.revision };
  }
  return { version: 1, draft: { ...value.draft }, revision: value.revision, confirmed };
}

export function formatCalculationDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

export function formatCalculationValue(value: number, signed = false): string {
  const magnitude = Math.abs(value);
  const scientific = magnitude >= 1e9 || (magnitude > 0 && magnitude < 0.01);
  const text = new Intl.NumberFormat('ru-RU', {
    notation: scientific ? 'scientific' : 'standard',
    maximumFractionDigits: scientific ? 3 : 6,
  }).format(value === 0 ? 0 : value);
  return `${signed && value > 0 ? '+' : ''}${text}`;
}

export function formatCalculationDays(value: number): string {
  const unit = new Intl.PluralRules('ru').select(value);
  const label = unit === 'one' ? 'день' : unit === 'few' ? 'дня' : 'дней';
  return `${value} ${label}`;
}
