import type { MouseEventHandler, ReactNode } from 'react';

export function AppLink({
  to,
  className,
  current,
  onClick,
  children,
}: {
  to: string;
  className?: string;
  current?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}) {
  return (
    <a
      href={`#${to}`}
      className={className}
      aria-current={current ? 'page' : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
