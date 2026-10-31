import {
  categories,
  isCategory,
  isTicket,
  ticketOf,
  CategoryKey,
  type Ticket,
} from '../tickets.js';

export type Pick = Ticket & { category: CategoryKey; at: string };
export type HistoryFailure = 'read' | 'write' | 'corrupt' | 'empty' | 'conflict' | 'locks';

const messages: Record<HistoryFailure, string> = {
  read: 'Не удалось прочитать историю. Проверьте доступ к хранилищу и повторите.',
  write: 'Не удалось сохранить изменение. Предыдущие результаты сохранены.',
  corrupt: 'Сохранённая история повреждена. Выбор билета недоступен до восстановления.',
  empty: 'В этом наборе больше нет билетов.',
  conflict: 'В другой вкладке изменился последний результат. Проверьте историю.',
  locks: 'Браузер не поддерживает блокировку вкладок. Выбор и отмена недоступны.',
};

export class HistoryError extends Error {
  constructor(readonly code: HistoryFailure) {
    super(messages[code]);
    this.name = 'HistoryError';
  }
}

const sizeOf = (category: CategoryKey) => categories[category].to - categories[category].from + 1;

export const validateHistory = (value: unknown): Pick[] => {
  if (!Array.isArray(value) || value.length > sizeOf(CategoryKey.All))
    throw new HistoryError('corrupt');
  const seen = new Set<number>();
  return value.map((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null) throw new HistoryError('corrupt');
    const item = entry as Record<string, unknown>;
    const number = item.number;
    if (!isTicket(number) || seen.has(number) || !isCategory(item.category)) {
      throw new HistoryError('corrupt');
    }
    const ticket = ticketOf(number);
    const range = categories[item.category];
    if (
      number < range.from ||
      number > range.to ||
      item.name !== ticket.name ||
      item.phone !== ticket.phone ||
      typeof item.at !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T/.test(item.at) ||
      !Number.isFinite(Date.parse(item.at))
    )
      throw new HistoryError('corrupt');
    seen.add(number);
    return { ...ticket, category: item.category, at: item.at };
  });
};

const takenIn = (history: readonly Pick[], category: CategoryKey) => {
  const { from, to } = categories[category];
  return history
    .map((pick) => pick.number)
    .filter((number) => number >= from && number <= to)
    .sort((left, right) => left - right);
};

export const remainingCount = (history: readonly Pick[], category: CategoryKey) =>
  sizeOf(category) - takenIn(history, category).length;

export const remainingAt = (history: readonly Pick[], category: CategoryKey, index: number) => {
  let number = categories[category].from + index;
  for (const taken of takenIn(history, category)) {
    if (taken > number) break;
    number += 1;
  }
  return number <= categories[category].to ? ticketOf(number) : undefined;
};

export const samePick = (left: Pick | undefined, right: Pick) =>
  left?.number === right.number && left.at === right.at && left.category === right.category;
