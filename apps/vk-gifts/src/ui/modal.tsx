import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from '../Art';

type Props = { title: string; children: ReactNode; onClose: () => void; busy?: boolean };

export function Modal({ title, children, onClose, busy = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const latest = useRef({ busy, onClose });
  const titleId = useId();
  latest.current = { busy, onClose };
  useEffect(() => {
    const dialog = ref.current;
    const active = document.activeElement;
    if (!dialog?.contains(active)) {
      openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
    }
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      dialog?.close();
      queueMicrotask(() => {
        if (document.querySelector('dialog[open]')) return;
        const opener = openerRef.current;
        const canRestore =
          opener?.isConnected && !opener.closest('[hidden]') && !opener.matches(':disabled');
        const target = canRestore ? opener : document.querySelector<HTMLElement>('#main');
        target?.focus({ preventScroll: true });
      });
    };
  }, []);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog?.open && !dialog.contains(document.activeElement)) {
      closeRef.current?.focus({ preventScroll: true });
    }
  }, [title]);
  function requestClose() {
    if (!latest.current.busy) latest.current.onClose();
  }
  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          requestClose();
      }}
    >
      <div className="sheet-head">
        <h2 id={titleId}>{title}</h2>
        <button
          ref={closeRef}
          className="icon-button"
          aria-label="Закрыть"
          onClick={requestClose}
          disabled={busy}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
