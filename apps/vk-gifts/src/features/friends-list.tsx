import { Icon } from '../Art';
import type { Friend } from '../model';
import { wishCount } from './plural';

type Props = { friends: Friend[]; search: string; onReset: () => void };

export function FriendsList({ friends, search, onReset }: Props) {
  if (!friends.length)
    return (
      <div className="empty-state">
        <h2>Никого не нашли</h2>
        {search && (
          <button className="button secondary" onClick={onReset}>
            Сбросить поиск
          </button>
        )}
      </div>
    );
  return (
    <ul className="friends-list">
      {friends.map((entry) => (
        <li key={entry.id}>
          <a href={`#/friends/${entry.id}`} className="friend-row">
            <span className="friend-row-copy">
              <strong>{entry.name}</strong>
              <small>
                День рождения {entry.birthday}, {wishCount(entry.gifts.length)}
              </small>
            </span>
            <Icon name="chevron" size={20} />
          </a>
        </li>
      ))}
    </ul>
  );
}
