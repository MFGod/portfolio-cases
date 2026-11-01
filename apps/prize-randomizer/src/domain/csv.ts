import { categories, ticketNumber } from '../tickets.js';
import type { Pick } from './history.js';

export const historyCsv = (history: readonly Pick[]) => {
  const rows = [
    ['Билет', 'Имя', 'Категория', 'Время'],
    ...history.map((pick) => [
      ticketNumber(pick.number),
      pick.name,
      categories[pick.category].title,
      new Date(pick.at).toLocaleString('ru-RU'),
    ]),
  ];
  return (
    '\uFEFF' +
    rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(';')).join('\r\n')
  );
};
