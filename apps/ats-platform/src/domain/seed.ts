import type { Candidate, Vacancy, Workspace } from './model';

const sampleVacancies: Vacancy[] = [
  {
    id: 'v1',
    title: 'Frontend-разработчик',
    team: 'Разработка',
    location: 'Москва',
    format: 'Удалённо',
    salaryFrom: 180000,
    salaryTo: 260000,
    headcount: 2,
    manager: 'Марк Соколов',
    description:
      'Развивать интерфейс продуктовой платформы. Проектировать компоненты на React и TypeScript, работать вместе с дизайнером и продуктовой командой.',
    status: 'open',
    priority: true,
  },
  {
    id: 'v2',
    title: 'Продуктовый дизайнер',
    team: 'Дизайн',
    location: 'Москва',
    format: 'Гибрид',
    salaryFrom: 150000,
    salaryTo: 210000,
    headcount: 1,
    manager: 'Ольга Лебедева',
    description:
      'Исследовать пользовательские задачи и проектировать понятные интерфейсы. Поддерживать дизайн-систему и проверять решения с командой.',
    status: 'open',
    priority: false,
  },
  {
    id: 'v3',
    title: 'Аналитик данных',
    team: 'Аналитика',
    location: 'Казань',
    format: 'Удалённо',
    salaryFrom: 160000,
    salaryTo: 230000,
    headcount: 1,
    manager: 'Марк Соколов',
    description:
      'Находить точки роста продукта, строить отчёты и проверять гипотезы. Работать с SQL, качеством данных и продуктовыми метриками.',
    status: 'open',
    priority: false,
  },
  {
    id: 'v4',
    title: 'Инженер по качеству',
    team: 'Разработка',
    location: 'Москва',
    format: 'Гибрид',
    salaryFrom: 130000,
    salaryTo: 180000,
    headcount: 1,
    manager: 'Марк Соколов',
    description:
      'Проверять пользовательские сценарии платформы и развивать автоматизацию тестирования. Помогать команде выпускать стабильные обновления.',
    status: 'paused',
    priority: false,
  },
];
const people: [string, number, string, string[]][] = [
  ['Алина Ковалёва', 0, '6 лет', ['React', 'TypeScript']],
  ['Денис Морозов', 0, '4 года', ['React', 'CSS']],
  ['Ирина Белова', 0, '5 лет', ['TypeScript', 'Next.js']],
  ['Никита Фёдоров', 1, '4 года', ['React', 'Тестирование']],
  ['София Андреева', 1, '7 лет', ['React', 'Архитектура']],
  ['Михаил Орлов', 2, '5 лет', ['TypeScript', 'React']],
  ['Вера Николаева', 2, '6 лет', ['React', 'Доступность']],
  ['Лев Гусев', 3, '8 лет', ['React', 'Team lead']],
  ['Полина Зайцева', 4, '5 лет', ['React', 'TypeScript']],
];
export const makeSeed = (): Workspace => ({
  vacancies: structuredClone(sampleVacancies),
  candidates: [
    ...people.map(([name, stage, experience, tags], index): Candidate => ({
      id: `c${index + 1}`,
      vacancyId: 'v1',
      name,
      stage,
      experience,
      tags: [...tags],
      position: 'Frontend-разработчик',
      salary: 185000 + index * 8000,
      source: index % 2 ? 'Рекомендация' : 'Прямой отклик',
      reached: Array.from({ length: stage + 1 }, (_, i) => i),
      history: Array.from({ length: stage + 1 }, (_, i) => ({
        stage: i,
        at: `2026-10-${String(12 + i).padStart(2, '0')}T10:00:00`,
      })),
    })),
    ...[
      'Ева Сергеева',
      'Арсений Павлов',
      'Дарья Ершова',
      'Матвей Комаров',
      'Яна Тимофеева',
      'Глеб Киселёв',
    ].map((name, i): Candidate => {
      const stage = i % 4;
      return {
        id: `d${i}`,
        vacancyId: i < 3 ? 'v2' : 'v3',
        name,
        stage,
        experience: '4 года',
        tags: i < 3 ? ['Figma', 'UX'] : ['SQL', 'Python'],
        position: i < 3 ? 'Продуктовый дизайнер' : 'Аналитик данных',
        salary: 170000 + i * 5000,
        source: 'Прямой отклик',
        reached: Array.from({ length: stage + 1 }, (_, j) => j),
        history: [{ stage, at: '2026-10-15T10:00:00' }],
      };
    }),
  ],
});
