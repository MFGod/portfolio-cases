import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { t } from '../../domain/copy';
import { themes, type Theme } from '../../domain/theme';
import { Icon, type IconName } from '../../ui/icons';
import type { ThemeChoice } from './site-view';

const label = {
  system: 'themeSystem',
  light: 'themeLight',
  dark: 'themeDark',
} as const satisfies Record<Theme, string>;
const icon = { system: 'system', light: 'sun', dark: 'moon' } as const satisfies Record<
  Theme,
  IconName
>;

export function ThemeMenu({ theme }: { theme: ThemeChoice }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  const navigate = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const items = [
      ...(list.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []),
    ];
    const at = items.indexOf(document.activeElement as HTMLElement);
    items.at((at + step) % items.length)?.focus();
  };

  return (
    <div className="theme-menu" ref={root}>
      <button
        type="button"
        ref={button}
        className="theme-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="theme-list"
        aria-label={`${t('theme')}: ${t(label[theme.current])}`}
        onClick={() => setOpen(!open)}
      >
        <Icon name={icon[theme.current]} size={20} />
      </button>
      {open && (
        <div
          className="theme-list"
          id="theme-list"
          role="menu"
          aria-label={t('theme')}
          ref={list}
          onKeyDown={navigate}
        >
          {themes.map((key) => (
            <button
              key={key}
              type="button"
              role="menuitemradio"
              aria-checked={theme.current === key}
              tabIndex={-1}
              onClick={() => {
                theme.choose(key);
                close(true);
              }}
            >
              <Icon name={icon[key]} />
              <span>{t(label[key])}</span>
              {theme.current === key && <Icon name="check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
