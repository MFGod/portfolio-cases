import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './icons';

export function Modal({
  children,
  title,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
      else document.getElementById('main-content')?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? 'sheet sheet-wide' : 'sheet'}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        closeRef.current();
      }}
      onClick={(event) => {
        if (event.target === ref.current) closeRef.current();
      }}
    >
      <header className="sheet-head">
        <h2 id="dialog-title">{title}</h2>
        <button type="button" className="icon-button" aria-label="Закрыть" onClick={onClose}>
          <Icon name="close" />
        </button>
      </header>
      {children}
    </dialog>
  );
}
