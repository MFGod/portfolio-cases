import { useState, type ReactNode } from 'react';

export function WorkspaceState({
  loading,
  error,
  recoverable,
  busy,
  actionError,
  onRetry,
  onRestore,
  children,
}: {
  loading: boolean;
  error: string;
  recoverable: boolean;
  busy: boolean;
  actionError: string;
  onRetry: () => void;
  onRestore: () => void;
  children: ReactNode;
}) {
  const [confirm, setConfirm] = useState(false);
  const skeleton = (
    <div className="loading-grid" role="status" aria-label="Загружаем желания">
      {[1, 2, 3, 4].map((id) => (
        <div key={id} />
      ))}
    </div>
  );
  return (
    <>
      {loading ? (
        skeleton
      ) : error ? (
        <section className="load-error" role="alert">
          <h1>Список не загрузился</h1>
          <p>{error}</p>
          <button className="button secondary" disabled={busy} onClick={onRetry}>
            Повторить загрузку
          </button>
          {recoverable && (
            <div className="recovery">
              <p>
                {confirm
                  ? 'Сохранённые изменения будут заменены исходными желаниями и бронью.'
                  : 'Можно восстановить исходные данные. Сохранённые изменения будут потеряны.'}
              </p>
              {actionError && <p className="error-message">{actionError}</p>}
              <div className="recovery-actions">
                {confirm ? (
                  <>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() => setConfirm(false)}
                    >
                      Отмена
                    </button>
                    <button className="button primary" disabled={busy} onClick={onRestore}>
                      {busy ? 'Восстанавливаем…' : 'Заменить данные'}
                    </button>
                  </>
                ) : (
                  <button className="button secondary" onClick={() => setConfirm(true)}>
                    Восстановить исходные данные
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      ) : null}
      <div hidden={loading || Boolean(error)}>{children}</div>
    </>
  );
}
