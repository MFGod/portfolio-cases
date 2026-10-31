import { useEffect, useState } from 'react';
import {
  canMove,
  formatMoment,
  money,
  stages,
  type Candidate,
  type Role,
  type Vacancy,
} from '../../domain/workspace';
import { ActionError } from '../../ui/feedback';
import { Modal } from '../../ui/modal';

export function CandidateSheet({
  candidate,
  vacancy,
  role,
  pending,
  error,
  onClose,
  onMove,
}: {
  candidate: Candidate;
  vacancy: Vacancy | undefined;
  role: Role;
  pending: boolean;
  error: string;
  onClose: () => void;
  onMove: (id: string, stage: number) => void;
}) {
  const [target, setTarget] = useState(candidate.stage);
  useEffect(() => setTarget(candidate.stage), [candidate.stage]);
  const open = vacancy?.status === 'open';

  return (
    <Modal title={candidate.name} onClose={onClose}>
      <div className="sheet-body">
        <div className="profile">
          <div>
            <p className="profile-position">{candidate.position}</p>
            <p className="muted">
              {candidate.experience} опыта, ожидания {money(candidate.salary)} ₽
            </p>
          </div>
        </div>
        <dl className="details">
          <dt>Этап</dt>
          <dd aria-live="polite">{stages[candidate.stage]}</dd>
          <dt>Источник</dt>
          <dd>{candidate.source}</dd>
          <dt>Навыки</dt>
          <dd>{candidate.tags.join(', ')}</dd>
        </dl>
        <form
          className="move-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!pending && open && canMove(role, candidate.stage, target))
              onMove(candidate.id, target);
          }}
        >
          <label>
            Перевести на этап
            <select
              value={target}
              disabled={pending || !open}
              onChange={(e) => setTarget(Number(e.target.value))}
            >
              {stages.map((stage, index) => (
                <option
                  key={stage}
                  value={index}
                  disabled={index !== candidate.stage && !canMove(role, candidate.stage, index)}
                >
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button primary"
            disabled={pending || !open || !canMove(role, candidate.stage, target)}
          >
            {pending ? 'Переводим…' : 'Перевести'}
          </button>
        </form>
        {!open && <p className="note">Подбор по вакансии остановлен.</p>}
        <ActionError message={error} retry={() => onMove(candidate.id, target)} pending={pending} />
        <h3 className="history-title">История</h3>
        <ol className="timeline">
          {[...candidate.history].reverse().map((event, index) => (
            <li key={`${event.at}-${index}`}>
              <span>{stages[event.stage]}</span>
              <time dateTime={event.at}>{formatMoment(event.at)}</time>
            </li>
          ))}
        </ol>
      </div>
    </Modal>
  );
}
