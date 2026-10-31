import { Icon } from './icons';

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className={message ? 'toast toast-visible' : 'toast'} role="status" aria-live="polite">
      {message && (
        <>
          <span>{message}</span>
          <button className="icon-button" aria-label="Скрыть" onClick={onDismiss}>
            <Icon name="close" size={16} />
          </button>
        </>
      )}
    </div>
  );
}
