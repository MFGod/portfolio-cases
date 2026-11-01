import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon, type IconName } from '../Art';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type SelectProps<T extends string> = {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  hideLabel?: boolean;
  disabled?: boolean;
  triggerIcon?: IconName;
};

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  hideLabel = false,
  disabled = false,
  triggerIcon,
}: SelectProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const listId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const option = rootRef.current?.querySelector<HTMLElement>(
      `[data-select-index="${activeIndex}"]`,
    );
    option?.focus({ preventScroll: true });
    option?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  function show() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function close(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    close(true);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      show();
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === 'Tab') {
      triggerRef.current?.focus();
      setOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(activeIndex);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => Math.max(0, Math.min(options.length - 1, current + step)));
      return;
    }
    if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const query = event.key.toLocaleLowerCase('ru');
      const nextIndex = options.findIndex((option, index) => {
        return index > activeIndex && option.label.toLocaleLowerCase('ru').startsWith(query);
      });
      const fallbackIndex = options.findIndex((option) =>
        option.label.toLocaleLowerCase('ru').startsWith(query),
      );
      const match = nextIndex >= 0 ? nextIndex : fallbackIndex;
      if (match >= 0) {
        event.preventDefault();
        setActiveIndex(match);
      }
    }
  }

  return (
    <div className="select-field" ref={rootRef}>
      <span className={hideLabel ? 'sr-only' : 'select-label'} id={labelId}>
        {label}
      </span>
      <div className="select-control">
        <button
          ref={triggerRef}
          className={`select-trigger${triggerIcon ? ' icon-only' : ''}`}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${label}: ${selected?.label}`}
          onClick={() => (open ? close() : show())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={triggerIcon ? 'sr-only' : 'select-value'}>{selected?.label}</span>
          {triggerIcon ? (
            <Icon name={triggerIcon} size={20} />
          ) : (
            <span className="select-chevron">
              <Icon name="chevron" size={18} />
            </span>
          )}
        </button>
        {open && (
          <ul
            className="select-options"
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            onKeyDown={handleListKeyDown}
          >
            {options.map((option, index) => (
              <li
                className={`select-option ${index === activeIndex ? 'active' : ''}`}
                id={`${listId}-${index}`}
                data-select-index={index}
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                tabIndex={-1}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                {option.value === value && <Icon name="check" size={18} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
