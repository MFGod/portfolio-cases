import { Icon } from '../Art';
import type { Friend, Gift, Snapshot } from '../model';
import type { ListContext, Sort } from '../ui/use-list-context';
import { categories, type Category } from './categories';
import { GiftCard } from './gift-card';
import { wishCount } from './plural';

export function WishList({
  snapshot,
  friend,
  context,
  busy,
  onChange,
  onOpen,
}: {
  snapshot: Snapshot;
  friend?: Friend;
  context: ListContext;
  busy: boolean;
  onChange: (patch: Partial<ListContext>) => void;
  onOpen: (gift: Gift, friend?: Friend) => void;
}) {
  const all = friend?.gifts ?? snapshot.wishes;
  const gifts = all
    .filter((gift) => context.category === 'all' || gift.category === context.category)
    .slice()
    .sort((a, b) =>
      context.sort === 'price-up'
        ? a.price - b.price
        : context.sort === 'price-down'
          ? b.price - a.price
          : 0,
    );
  return (
    <section className={friend ? 'wish-list friend-wishlist' : 'wish-list'} aria-label="Желания">
      <div className="list-head">
        {friend && (
          <a className="icon-button" href="#/friends" aria-label="К списку друзей">
            <Icon name="arrow" />
          </a>
        )}
        <div className="list-title">
          <div className="title-line">
            <h1>{friend ? friend.name : 'Мои желания'}</h1>
            <span className="item-count">{all.length}</span>
          </div>
          {friend && <p>День рождения {friend.birthday}</p>}
        </div>
        {!friend && (
          <a className="button primary add-button" href="#/add" aria-label="Добавить желание">
            <Icon name="plus" size={20} />
            <span>Добавить</span>
          </a>
        )}
      </div>
      {friend && (
        <p className="friend-note">
          <Icon name="lock" size={16} />
          {friend.name.split(' ')[0]} не узнает, что вы выбрали.
        </p>
      )}
      <div className="list-controls">
        <label>
          <span className="sr-only">Категория желаний</span>
          <select
            value={context.category}
            onChange={(event) => onChange({ category: event.target.value as Category })}
          >
            {categories.map((item) => (
              <option value={item.id} key={item.id}>
                {item.id === 'all' ? 'Все категории' : item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Сортировка</span>
          <select
            value={context.sort}
            onChange={(event) => onChange({ sort: event.target.value as Sort })}
          >
            <option value="recent">Новые</option>
            <option value="price-up">Дешевле</option>
            <option value="price-down">Дороже</option>
          </select>
        </label>
      </div>
      {gifts.length ? (
        <div className="gift-grid">
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              pending={busy}
              booking={friend ? snapshot.bookings[`${friend.id}:${gift.id}`] : undefined}
              onOpen={() => onOpen(gift, friend)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{all.length ? 'В этой категории пусто' : 'Желаний пока нет'}</h2>
          {context.category !== 'all' ? (
            <button className="button secondary" onClick={() => onChange({ category: 'all' })}>
              Все категории
            </button>
          ) : (
            !friend && (
              <a className="button primary" href="#/add">
                Добавить желание
              </a>
            )
          )}
        </div>
      )}
      {gifts.length > 0 && gifts.length !== all.length && (
        <p className="filter-summary">
          {wishCount(gifts.length)} из {all.length}
        </p>
      )}
    </section>
  );
}
