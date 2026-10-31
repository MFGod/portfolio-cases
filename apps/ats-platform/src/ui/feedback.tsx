import type { ReactNode } from 'react';

export function ActionError({
  message,
  retry,
  pending,
}: {
  message: string;
  retry: () => void;
  pending: boolean;
}) {
  if (!message) return null;
  return (
    <div className="action-error" role="alert">
      <span>{message}</span>
      <button className="text-button" disabled={pending} onClick={retry} type="button">
        Повторить
      </button>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <p>{title}</p>
      {children}
    </div>
  );
}

export function SkeletonRows() {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Загрузка">
      {[1, 2, 3, 4].map((row) => (
        <div key={row} className="skeleton-row">
          <span className="skeleton" />
          <span className="skeleton skeleton-short" />
        </div>
      ))}
    </div>
  );
}
