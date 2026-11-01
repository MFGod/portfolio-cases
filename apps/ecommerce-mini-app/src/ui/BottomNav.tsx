import { money } from '../shop';
import { useShopContext } from './shop-context';

export const BottomNav = ({ screen }: { screen: string }) => {
  const { shop } = useShopContext();
  const catalogActive = ['catalog', 'product'].includes(screen);
  const ordersActive = ['orders', 'order'].includes(screen);
  const cartActive = ['cart', 'checkout'].includes(screen);

  return (
    <nav className="bottom-nav" aria-label="Главное меню">
      <a
        href="#/catalog"
        className={catalogActive ? 'active' : undefined}
        aria-current={catalogActive ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
        </svg>
        <span>Каталог</span>
      </a>
      <a
        href="#/orders"
        className={ordersActive ? 'active' : undefined}
        aria-current={ordersActive ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 3H18L20 7V20H4V7Z M4 7H20M9 11H15" />
        </svg>
        <span>Заказы</span>
      </a>
      <a
        href="#/cart"
        className={`cart-shortcut${cartActive ? ' active' : ''}`}
        aria-current={cartActive ? 'page' : undefined}
      >
        <span className="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 8H19L21 21H3L5 8Z M8 9V6a4 4 0 0 1 8 0v3" />
          </svg>
          {shop.count > 0 && shop.ready && <span className="cart-badge">{shop.count}</span>}
        </span>
        <span>
          Корзина
          {shop.count > 0 && shop.ready && <strong>{money(shop.total)}</strong>}
        </span>
      </a>
    </nav>
  );
};
