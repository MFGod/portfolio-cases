import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { pickupPoints } from './data';
import { useShop, type Kit } from './shop';
import { Catalog } from './features/catalog/Catalog';
import { Product } from './features/product/Product';
import { Cart } from './features/cart/Cart';
import { Checkout } from './features/checkout/Checkout';
import { useDeliveryDraft } from './features/checkout/use-delivery-form';
import { Orders } from './features/orders/Orders';
import { OrderReceipt } from './features/orders/OrderReceipt';
import { AppIcon } from './ui/AppIcon';
import { BottomNav } from './ui/BottomNav';
import { PickupDialog, type PickupDialogHandle } from './ui/PickupDialog';
import { ShopFeedback } from './ui/ShopFeedback';
import { ShopContext } from './ui/shop-context';

export const App = ({ kit }: { kit: Kit }) => {
  const shop = useShop(kit);
  const delivery = useDeliveryDraft(shop);
  const [route, setRoute] = useState(location.hash.slice(1) || '/catalog');
  const main = useRef<HTMLElement>(null);
  const pickupDialog = useRef<PickupDialogHandle>(null);
  const screen = route.split('/')[1] || 'catalog';
  const itemId = route.split('/')[2] || '';
  const pickup = pickupPoints.find((point) => point.id === shop.state.pickup);
  const navigate = (path: string) => {
    location.hash = path;
  };

  async function retry() {
    const ids = new Set(shop.state.orders.map((order) => order.id));
    const cart = JSON.stringify(shop.state.cart);
    const ok = await shop.retry();
    if (!ok) return;
    const state = shop.getState();
    const order = state.orders.find((item) => !ids.has(item.id));
    if (order) navigate(`/order/${order.id}`);
    else if (screen === 'orders' && JSON.stringify(state.cart) !== cart) navigate('/cart');
  }

  const loadEvent = useEffectEvent(shop.load);
  const dismissNoticeEvent = useEffectEvent(shop.dismissNotice);
  const routeEvent = useEffectEvent(() => {
    if (screen === 'order') shop.dismissNotice();
    window.scrollTo({ top: 0 });
    main.current?.focus({ preventScroll: true });
  });

  useEffect(() => {
    const routeChanged = () => setRoute(location.hash.slice(1) || '/catalog');
    window.addEventListener('hashchange', routeChanged);
    void loadEvent();
    return () => window.removeEventListener('hashchange', routeChanged);
  }, []);

  useEffect(() => {
    if (!shop.notice) return undefined;
    const timer = window.setTimeout(dismissNoticeEvent, 4000);
    return () => window.clearTimeout(timer);
  }, [shop.notice]);

  useEffect(() => {
    routeEvent();
  }, [route]);

  return (
    <ShopContext
      value={{
        shop,
        delivery,
        navigate,
        openPickup: () => pickupDialog.current?.open(),
      }}
    >
      <div className={`shop-shell${['checkout', 'order'].includes(screen) ? ' focused-flow' : ''}`}>
        <header className="shop-header">
          <div className="brand-row">
            <a href="#/catalog" className="brand-link">
              Корзина Рядом
            </a>
            <button
              className="pickup-button"
              disabled={!shop.ready || shop.pending}
              aria-label={`Пункт выдачи: ${pickup?.address ?? 'выбрать адрес'}`}
              aria-haspopup="dialog"
              onClick={() => pickupDialog.current?.open()}
            >
              <AppIcon name="pin" size={20} />
            </button>
          </div>
          <p className="location-current">Самовывоз, {pickup?.address ?? 'выберите пункт'}</p>
        </header>
        <main ref={main} tabIndex={-1} aria-busy={shop.loading}>
          {shop.ready && (
            <ShopFeedback canRetry={shop.retryAvailable} onRetry={() => void retry()} />
          )}
          {shop.loading ? (
            <section className="loading-state" aria-live="polite" aria-busy="true">
              <span className="sr-only">Загружаем магазин</span>
              <div className="skeleton search-skeleton" />
              <div className="skeleton-grid">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="skeleton" />
                ))}
              </div>
            </section>
          ) : !shop.ready ? (
            <section className="empty-state">
              <h1>Магазин не загрузился</h1>
              {shop.error && <p role="alert">{shop.error}</p>}
              <button className="primary" disabled={shop.pending} onClick={() => void shop.load()}>
                Повторить загрузку
              </button>
            </section>
          ) : screen === 'catalog' ? (
            <Catalog />
          ) : screen === 'product' ? (
            <Product id={itemId} />
          ) : screen === 'cart' ? (
            <Cart />
          ) : screen === 'checkout' ? (
            <Checkout />
          ) : screen === 'orders' ? (
            <Orders />
          ) : screen === 'order' ? (
            <OrderReceipt id={itemId} />
          ) : (
            <section className="empty-state">
              <h1>Страница не найдена</h1>
              <a href="#/catalog" className="primary">
                Вернуться в каталог
              </a>
            </section>
          )}
        </main>
        {!['checkout', 'order'].includes(screen) && <BottomNav screen={screen} />}
        <PickupDialog ref={pickupDialog} />
      </div>
    </ShopContext>
  );
};
