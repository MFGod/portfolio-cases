import { canMove, money, stages, type Candidate, type Role } from '../../domain/workspace';
import { Icon } from '../../ui/icons';

export function CandidateRow({
  candidate,
  role,
  movable,
  pending,
  onOpen,
  onMove,
}: {
  candidate: Candidate;
  role: Role;
  movable: boolean;
  pending: boolean;
  onOpen: () => void;
  onMove: (stage: number) => void;
}) {
  const { stage } = candidate;
  const allowed = (target: number) => movable && canMove(role, stage, target);
  const nextStage = stages[stage + 1];

  return (
    <tr
      id={`candidate-${candidate.id}`}
      className="candidate-row"
      onKeyDown={(event) => {
        if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
        event.preventDefault();
        const target = stage + (event.key === 'ArrowRight' ? 1 : -1);
        if (allowed(target)) onMove(target);
      }}
    >
      <th scope="row">
        <button
          type="button"
          className="candidate-name"
          disabled={pending}
          onClick={onOpen}
          aria-label={`Открыть профиль: ${candidate.name}`}
          aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
          title="Alt + стрелки: предыдущий или следующий этап"
        >
          {candidate.name}
        </button>
        <p className="candidate-skills">{candidate.tags.join(', ')}</p>
      </th>
      <td className="candidate-experience">
        <span className="candidate-label" aria-hidden="true">
          Опыт
        </span>
        {candidate.experience}
      </td>
      <td className="candidate-salary">
        <span className="candidate-label" aria-hidden="true">
          Ожидания
        </span>
        {money(candidate.salary)} <span className="currency">₽</span>
      </td>
      <td className={`candidate-stage candidate-stage-${stage}`}>
        <span className="candidate-label" aria-hidden="true">
          Этап
        </span>
        <span className="stage-pill">{stages[stage]}</span>
      </td>
      <td className="candidate-action">
        {nextStage ? (
          <button
            type="button"
            className="button secondary"
            disabled={!allowed(stage + 1)}
            aria-label={`${candidate.name}: на этап «${nextStage}»`}
            title={`На этап «${nextStage}»`}
            onClick={() => onMove(stage + 1)}
          >
            Дальше
            <Icon name="arrow" size={16} />
          </button>
        ) : (
          <button type="button" className="text-button" disabled={pending} onClick={onOpen}>
            Профиль
          </button>
        )}
      </td>
    </tr>
  );
}
