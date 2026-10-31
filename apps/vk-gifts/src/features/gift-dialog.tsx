import type { Friend, Gift, Snapshot } from '../model';
import { Modal } from '../ui/modal';
import type { ActionKind } from '../ui/use-wishlist';
import { GiftForm } from './gift-form';
import { GiftSheet } from './gift-sheet';

export type GiftDialogState = { kind: 'gift' | 'edit' | 'delete'; gift: Gift; friend?: Friend };
export function GiftDialog({
  state,
  snapshot,
  busy,
  action,
  error,
  onClose,
  onChange,
  onSave,
  onDelete,
  onBook,
  onCopy,
}: {
  state: GiftDialogState;
  snapshot?: Snapshot;
  busy: boolean;
  action?: ActionKind;
  error: string;
  onClose: () => void;
  onChange: (next: GiftDialogState) => void;
  onSave: (gift: Gift, editing: boolean, original?: Gift) => Promise<void>;
  onDelete: () => void;
  onBook: (cancel: boolean) => void;
  onCopy: () => void;
}) {
  const { gift, friend } = state;
  if (state.kind === 'edit')
    return (
      <Modal title="Изменить желание" onClose={onClose} busy={busy}>
        <GiftForm initial={gift} editing onSave={onSave} onCancel={onClose} />
      </Modal>
    );
  if (state.kind === 'delete')
    return (
      <Modal title="Удалить желание?" onClose={onClose} busy={busy}>
        <p className="dialog-description">«{gift.title}» исчезнет из списка.</p>
        {error && action === 'delete' && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <button className="button danger full" disabled={busy} onClick={onDelete}>
          {busy ? 'Удаляем…' : error && action === 'delete' ? 'Повторить удаление' : 'Удалить'}
        </button>
        <button className="button quiet full" disabled={busy} onClick={onClose}>
          Оставить
        </button>
      </Modal>
    );
  const booking = friend ? snapshot?.bookings[`${friend.id}:${gift.id}`] : undefined;
  const giftAction = action === 'book' || action === 'copy' ? action : undefined;
  return (
    <Modal title={gift.title} onClose={onClose} busy={busy}>
      <GiftSheet
        gift={gift}
        friend={friend}
        booking={booking}
        busy={busy}
        error={giftAction ? error : ''}
        errorAction={giftAction}
        pendingAction={giftAction}
        onBook={() => onBook(booking === 'me')}
        onCopy={onCopy}
        onEdit={() => {
          if (!busy) onChange({ ...state, kind: 'edit' });
        }}
        onDelete={() => {
          if (!busy) onChange({ ...state, kind: 'delete' });
        }}
      />
    </Modal>
  );
}
