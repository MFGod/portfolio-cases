import { Icon, ProductArt } from '../Art';
import { money, type Gift } from '../model';

type Props = { gift: Gift; onOpen: () => void; booking?: 'me' | 'other'; pending?: boolean };

export function GiftCard({ gift, onOpen, booking, pending }: Props) {
  const status = booking === 'me' ? 'Вы подарите' : booking === 'other' ? 'Уже дарят' : '';
  return (
    <button
      className="gift-card"
      disabled={pending}
      onClick={onOpen}
      aria-label={`${gift.title}, ${money(gift.price)}${status ? `, ${status.toLowerCase()}` : ''}`}
    >
      <div className={`gift-visual ${gift.color}`}>
        <ProductArt art={gift.art} photo={gift.photo} title={gift.title} />
      </div>
      <div className="gift-caption">
        <span>{gift.title}</span>
        <span className="gift-price">{money(gift.price)}</span>
        {booking && (
          <span className={`booking-tag ${booking === 'me' ? 'mine' : ''}`}>
            <Icon name="lock" size={14} />
            {status}
          </span>
        )}
        {gift.note && <span className="gift-note">{gift.note}</span>}
      </div>
    </button>
  );
}
