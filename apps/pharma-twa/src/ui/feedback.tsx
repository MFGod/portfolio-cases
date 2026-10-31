import type { ReactNode } from 'react';

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <p>{title}</p>
      {children}
    </div>
  );
}

export function Failure({ retry, children }: { retry: () => void; children: ReactNode }) {
  return (
    <div className="failure" role="alert">
      <p>{children}</p>
      <button className="text-button" onClick={retry}>
        Повторить
      </button>
    </div>
  );
}
