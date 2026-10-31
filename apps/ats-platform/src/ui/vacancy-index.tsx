import { statusLabels, type Workspace } from '../domain/workspace';

export function VacancyIndex({
  workspace,
  selected,
  pending,
  onSelect,
}: {
  workspace: Workspace;
  selected: string;
  pending: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="vacancy-index" aria-label="Выбор вакансии">
      <h2>
        Вакансии <span>{workspace.vacancies.length}</span>
      </h2>
      <ul>
        {workspace.vacancies.map((vacancy) => {
          const people = workspace.candidates.filter((person) => person.vacancyId === vacancy.id);
          const hired = people.filter((person) => person.stage === 4).length;
          return (
            <li key={vacancy.id}>
              <button
                type="button"
                disabled={pending}
                aria-pressed={selected === vacancy.id}
                onClick={() => onSelect(vacancy.id)}
              >
                <span className="index-title">{vacancy.title}</span>
                <span className="index-count">{people.length}</span>
                <span className="index-detail">
                  {vacancy.status === 'open'
                    ? `Нанято ${hired} из ${vacancy.headcount}`
                    : statusLabels[vacancy.status]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
