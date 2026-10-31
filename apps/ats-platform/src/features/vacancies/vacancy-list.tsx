import {
  salaryRange,
  stages,
  statusLabels,
  type Role,
  type Vacancy,
  type Workspace,
} from '../../domain/workspace';
import { Empty } from '../../ui/feedback';
import { Icon } from '../../ui/icons';
import { SearchField } from '../../ui/search-field';

const statusFilters = [
  ['all', 'Все'],
  ['open', 'В работе'],
  ['paused', 'На паузе'],
  ['closed', 'Закрытые'],
] as const;
export type StatusFilter = (typeof statusFilters)[number][0];

export function VacancyList({
  workspace,
  role,
  pending,
  query,
  status,
  onQueryChange,
  onStatusChange,
  onOpen,
  onOpenBoard,
  onCreate,
}: {
  workspace: Workspace;
  role: Role;
  pending: boolean;
  query: string;
  status: StatusFilter;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  onOpen: (vacancy: Vacancy) => void;
  onOpenBoard: (id: string) => void;
  onCreate: () => void;
}) {
  const needle = query.trim().toLocaleLowerCase('ru');
  const visible = workspace.vacancies.filter(
    (item) =>
      (status === 'all' || item.status === status) &&
      `${item.title} ${item.team} ${item.manager}`.toLocaleLowerCase('ru').includes(needle),
  );
  const canCreate = role === 'recruiter';

  return (
    <>
      <div className="toolbar">
        <label className="status-filter">
          <span className="sr-only">Статус вакансии</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
          >
            {statusFilters.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="segmented" role="group" aria-label="Статус вакансии">
          {statusFilters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              data-label={label}
              onClick={() => onStatusChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder="Поиск"
          label="Поиск вакансий"
        />
        {canCreate && (
          <button className="button primary toolbar-action" disabled={pending} onClick={onCreate}>
            <Icon name="plus" size={18} />
            Новая вакансия
          </button>
        )}
      </div>
      {visible.length ? (
        <ul className="vacancy-cards">
          {visible.map((item) => {
            const assigned = workspace.candidates.filter((person) => person.vacancyId === item.id);
            const hired = assigned.filter((person) => person.stage === 4).length;
            return (
              <li key={item.id} className="vacancy-card">
                <div className="vacancy-head">
                  <div className="vacancy-info">
                    <button
                      className="vacancy-title"
                      disabled={pending}
                      aria-label={`${canCreate ? 'Редактировать' : 'Открыть'}: ${item.title}`}
                      onClick={() => onOpen(item)}
                    >
                      {item.title}
                    </button>
                    <span className="vacancy-meta">
                      {item.team}, {item.format.toLocaleLowerCase('ru')},{' '}
                      <span className="nowrap">{salaryRange(item.salaryFrom, item.salaryTo)}</span>
                    </span>
                    <span className="vacancy-meta">Руководитель: {item.manager}</span>
                  </div>
                  <div className="vacancy-tags">
                    {item.priority && <span className="badge badge-priority">Приоритет</span>}
                    <span className={`badge badge-${item.status}`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                </div>
                <button
                  className="stage-strip"
                  disabled={pending}
                  aria-label={`Кандидаты: ${item.title}, ${assigned.length}`}
                  onClick={() => onOpenBoard(item.id)}
                >
                  <span className="stage-cell">
                    <strong>{assigned.length}</strong>
                    Все
                  </span>
                  {stages.map((label, index) => (
                    <span key={label} className="stage-cell">
                      <strong>
                        {index === 4
                          ? `${hired} из ${item.headcount}`
                          : assigned.filter((person) => person.stage === index).length}
                      </strong>
                      {label}
                    </span>
                  ))}
                </button>
              </li>
            );
          })}
        </ul>
      ) : workspace.vacancies.length ? (
        <Empty title="Ничего не найдено">
          <button
            className="button secondary"
            onClick={() => {
              onQueryChange('');
              onStatusChange('all');
            }}
          >
            Сбросить фильтры
          </button>
        </Empty>
      ) : (
        <Empty title="Вакансий пока нет" />
      )}
      {visible.length > 0 && visible.length < workspace.vacancies.length && (
        <p className="list-footnote">
          Показано {visible.length} из {workspace.vacancies.length}
        </p>
      )}
    </>
  );
}
