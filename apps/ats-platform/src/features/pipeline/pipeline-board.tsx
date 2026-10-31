import { stages, statusLabels, type Role, type Workspace } from '../../domain/workspace';
import { Empty } from '../../ui/feedback';
import { SearchField } from '../../ui/search-field';
import { CandidateRow } from './candidate-card';

export function PipelineBoard({
  workspace,
  role,
  selected,
  query,
  stageFilter,
  pending,
  onSelect,
  onQueryChange,
  onStageFilterChange,
  onOpenCandidate,
  onMove,
}: {
  workspace: Workspace;
  role: Role;
  selected: string;
  query: string;
  stageFilter: number | 'all';
  pending: boolean;
  onSelect: (id: string) => void;
  onQueryChange: (query: string) => void;
  onStageFilterChange: (stage: number | 'all') => void;
  onOpenCandidate: (id: string) => void;
  onMove: (id: string, stage: number) => void;
}) {
  if (!workspace.vacancies.length)
    return (
      <Empty title="Нет вакансий">
        <a className="button secondary" href="#/vacancies">
          К вакансиям
        </a>
      </Empty>
    );

  const vacancy = workspace.vacancies.find((item) => item.id === selected);
  const needle = query.trim().toLocaleLowerCase('ru');
  const candidates = workspace.candidates.filter(
    (person) =>
      person.vacancyId === selected &&
      (stageFilter === 'all' || person.stage === stageFilter) &&
      `${person.name} ${person.tags.join(' ')}`.toLocaleLowerCase('ru').includes(needle),
  );
  const open = vacancy?.status === 'open';
  const filtered = Boolean(needle) || stageFilter !== 'all';

  return (
    <>
      <div className="registry-toolbar">
        <label className="vacancy-select">
          <span className="sr-only">Вакансия</span>
          <select
            value={vacancy?.id ?? ''}
            disabled={pending}
            onChange={(event) => onSelect(event.target.value)}
          >
            {workspace.vacancies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder="Поиск"
          label="Поиск кандидатов"
        />
        <label className="stage-filter">
          <span className="sr-only">Этап кандидата</span>
          <select
            value={stageFilter}
            onChange={(event) =>
              onStageFilterChange(event.target.value === 'all' ? 'all' : Number(event.target.value))
            }
          >
            <option value="all">Все этапы</option>
            {stages.map((stage, index) => (
              <option key={stage} value={index}>
                {stage}
              </option>
            ))}
          </select>
        </label>
      </div>
      {vacancy && !open && (
        <p className="note">
          Вакансия {statusLabels[vacancy.status].toLocaleLowerCase('ru')}, этапы не меняются.
        </p>
      )}
      {candidates.length ? (
        <table className="candidate-register" aria-busy={pending}>
          <caption className="sr-only">
            Кандидаты на вакансию «{vacancy?.title}»: {candidates.length}
          </caption>
          <thead>
            <tr>
              <th scope="col">Кандидат</th>
              <th scope="col" className="candidate-experience">
                Опыт
              </th>
              <th scope="col" className="candidate-salary">
                Ожидания, ₽
              </th>
              <th scope="col" className="candidate-stage">
                Этап
              </th>
              <th scope="col" className="candidate-action">
                <span className="sr-only">Действие</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
                role={role}
                movable={open && !pending}
                pending={pending}
                onOpen={() => onOpenCandidate(candidate.id)}
                onMove={(target) => onMove(candidate.id, target)}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <Empty title={filtered ? 'Кандидаты не найдены' : 'На эту вакансию пока нет кандидатов'}>
          {filtered && (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                onQueryChange('');
                onStageFilterChange('all');
              }}
            >
              Сбросить фильтры
            </button>
          )}
        </Empty>
      )}
    </>
  );
}
