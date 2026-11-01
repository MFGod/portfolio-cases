import { pickupPoints } from '../../data';
import { money, readableDate } from '../../shop';
import { AppIcon } from '../../ui/AppIcon';
import { useShopContext } from '../../ui/shop-context';
import { OrderItems } from './OrderItems';

export const OrderReceipt = ({ id }: { id: string }) => {
  const { shop } = useShopContext();
  const order = shop.state.orders.find((item) => String(item.id) === id);
  const point = pickupPoints.find((item) => item.id === order?.pickup);
  const total = order?.lines.reduce((sum, line) => sum + line.price * line.quantity, 0) ?? 0;

  return (
    <>
      <a href="#/orders" className="back-link">
        <AppIcon name="back" size={16} />
        Заказы
      </a>
      {order ? (
        <article className="pickup-receipt">
          <header className="receipt-heading">
            <span className="receipt-mark">
              <AppIcon name={order.status === 'Отменён' ? 'close' : 'check'} size={24} />
            </span>
            <h1>Заказ КР-{order.id}</h1>
            <span className={`status-pill${order.status === 'Отменён' ? ' cancelled' : ''}`}>
              {order.status}
            </span>
            <p>{readableDate(order.created)}</p>
          </header>
          <section className="receipt-pickup">
            <h2>{readableDate(order.date)}</h2>
            <strong>{point?.name}</strong>
            <p>{point?.address}</p>
            <p className="help-text">{point?.hours}</p>
            <p className="help-text">{point?.walk}</p>
            <p>Получатель {order.customer}</p>
          </section>
          <OrderItems lines={order.lines} />
          <div className="receipt-total">
            <span>
              {['Получен', 'Отменён'].includes(order.status)
                ? 'Стоимость заказа'
                : 'К оплате при получении'}
            </span>
            <strong>{money(total)}</strong>
          </div>
          {!['Получен', 'Отменён'].includes(order.status) && (
            <p className="help-text receipt-note">Заказ хранится 2 дня с даты получения.</p>
          )}
          <a href="#/catalog" className="primary">
            Вернуться в каталог
          </a>
          <a href="#/orders" className="text-button receipt-orders">
            Открыть мои заказы
          </a>
        </article>
      ) : (
        <section className="empty-state">
          <h1>Заказ не найден</h1>
          <a href="#/orders" className="primary">
            Открыть заказы
          </a>
        </section>
      )}
    </>
  );
};
