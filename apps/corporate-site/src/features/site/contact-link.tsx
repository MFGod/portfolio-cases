import type { MouseEvent } from 'react';

import { t } from '../../domain/copy';
import { href } from '../../domain/route';

export function ContactLink({
  className = 'text-link',
  label,
}: {
  className?: string;
  label?: string;
}) {
  const follow = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return;
    const contact = event.currentTarget
      .closest('.site')
      ?.querySelector<HTMLElement>('[data-contact]');
    if (!contact) return;
    event.preventDefault();
    contact.scrollIntoView({ block: 'start' });
    contact.querySelector<HTMLElement>('h1, h2')?.focus({ preventScroll: true });
  };

  return (
    <a className={className} href={href.contact()} onClick={follow}>
      {label ?? t('discuss')}
    </a>
  );
}
