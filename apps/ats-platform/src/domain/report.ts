import { stages, type Candidate } from './model';

export const money = (value: number) => new Intl.NumberFormat('ru-RU').format(value);
const thousands = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value / 1000);
export const salaryRange = (from: number, to: number) =>
  `от ${thousands(from)} до ${thousands(to)} тыс. ₽`;
export const percent = (part: number, whole: number) =>
  whole ? Math.round((part / whole) * 100) : 0;
const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const momentFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});
export const formatDay = (iso: string) => dayFormat.format(new Date(iso));
export const formatMoment = (iso: string) => momentFormat.format(new Date(iso));
export const funnel = (candidates: Candidate[]) =>
  stages.map((label, index) => ({
    label,
    count: candidates.filter((person) => person.reached.includes(index)).length,
  }));

const csvCell = (value: string) => {
  const safe =
    /^[\s\u0000-\u001f]*[=+@-]/.test(value) || /^[\t\r\n]/.test(value) ? "'" + value : value;
  return `"${safe.replaceAll('"', '""')}"`;
};

export const buildReportCsv = (vacancyTitle: string, candidates: Candidate[]) => {
  const rows = funnel(candidates);
  const first = rows[0]?.count ?? 0;
  return (
    '\uFEFF' +
    [
      [
        'Вакансия',
        'Этап',
        'Дошли до этапа',
        'Конверсия от откликов, %',
        'Сейчас на этапе',
        'Конверсия из предыдущего, %',
      ],
      ...rows.map((row, index) => [
        vacancyTitle,
        row.label,
        String(row.count),
        String(percent(row.count, first)),
        String(candidates.filter((person) => person.stage === index).length),
        index === 0 ? '—' : String(percent(row.count, rows[index - 1]?.count ?? 0)),
      ]),
    ]
      .map((row) => row.map(csvCell).join(';'))
      .join('\r\n')
  );
};
