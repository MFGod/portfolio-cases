import { useState } from 'react';

export function WorkspaceRecovery({
  pending,
  onRecover,
}: {
  pending: boolean;
  onRecover: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="recovery" role="group" aria-label="Восстановление данных">
      <p>
        {confirm
          ? 'Сохранённые изменения будут заменены исходными вакансиями и кандидатами.'
          : 'Можно восстановить исходные данные. Сохранённые изменения будут потеряны.'}
      </p>
      <div className="recovery-actions">
        {confirm ? (
          <>
            <button
              type="button"
              className="button secondary"
              disabled={pending}
              onClick={() => setConfirm(false)}
            >
              Отмена
            </button>
            <button type="button" className="button primary" disabled={pending} onClick={onRecover}>
              {pending ? 'Восстанавливаем…' : 'Заменить данные'}
            </button>
          </>
        ) : (
          <button type="button" className="button secondary" onClick={() => setConfirm(true)}>
            Восстановить исходные данные
          </button>
        )}
      </div>
    </div>
  );
}
