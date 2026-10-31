import { Icon } from '../Art';

export function Header({ path, unread }: { path: string; unread: number }) {
  const active = path.startsWith('/friends')
    ? 'friends'
    : path === '/notifications'
      ? 'notifications'
      : 'wishlist';
  const links = [
    ['wishlist', 'Мои желания', 'heart'],
    ['friends', 'Друзья', 'friends'],
    ['notifications', 'Уведомления', 'bell'],
  ] as const;
  return (
    <header className="topbar">
      <div className="header-inner">
        <a className="wordmark" href="#/wishlist" aria-label="Хочу, мои желания">
          <Icon name="gift" size={28} />
          хочу
        </a>
        <nav aria-label="Основная навигация">
          {links.map(([id, label, icon]) => (
            <a key={id} href={`#/${id}`} aria-current={active === id ? 'page' : undefined}>
              <span className="nav-icon">
                <Icon name={icon} size={22} />
                {id === 'notifications' && unread > 0 && (
                  <span className="unread-count" aria-label={`Новых: ${unread}`}>
                    {unread}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
