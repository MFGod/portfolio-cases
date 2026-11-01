import { Icon, ProductArt } from '../Art';
import { money, type Friend, type Gift } from '../model';

type Props = {
  gift: Gift;
  friend?: Friend;
  booking?: 'me' | 'other';
  busy: boolean;
  error: string;
  errorAction?: 'book' | 'copy';
  pendingAction?: 'book' | 'copy';
  onBook: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function GiftSheet(props: Props) {
  const { gift, friend, booking, busy, error } = props;
  const failedAction = error ? (props.errorAction ?? 'book') : undefined;
  const pendingAction = busy ? (props.pendingAction ?? 'book') : undefined;
  return (
    <>
      <div className={`detail-visual ${gift.color}`}>
        <ProductArt art={gift.art} photo={gift.photo} title={gift.title} />
      </div>
      <p className="detail-price">{money(gift.price)}</p>
      {gift.note && <p className="detail-note">{gift.note}</p>}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {friend ? (
        <>
          <p className="booking-explanation" aria-live="polite">
            <Icon name="lock" size={16} />
            {booking === 'me'
              ? 'Вы забронировали этот подарок.'
              : booking === 'other'
                ? 'Этот подарок уже выбрал другой друг.'
                : `${friend.name.split(' ')[0]} не увидит бронь, а друзья увидят, что подарок уже выбрали.`}
          </p>
          {booking !== 'other' && (
            <button className="button primary full" disabled={busy} onClick={props.onBook}>
              {pendingAction === 'book'
                ? booking === 'me'
                  ? 'Снимаем бронь…'
                  : 'Бронируем…'
                : failedAction === 'book'
                  ? 'Повторить'
                  : booking === 'me'
                    ? 'Снять бронь'
                    : 'Я подарю это'}
            </button>
          )}
          <button className="button secondary full" disabled={busy} onClick={props.onCopy}>
            <Icon name="plus" size={20} />
            {pendingAction === 'copy'
              ? 'Добавляем…'
              : failedAction === 'copy'
                ? 'Повторить добавление'
                : 'Хочу себе тоже'}
          </button>
        </>
      ) : (
        <div className="detail-actions">
          <button className="button primary" onClick={props.onEdit} disabled={busy}>
            <Icon name="edit" size={19} />
            Изменить
          </button>
          <button className="button secondary" onClick={props.onDelete} disabled={busy}>
            <Icon name="trash" size={19} />
            Удалить
          </button>
        </div>
      )}
    </>
  );
}
