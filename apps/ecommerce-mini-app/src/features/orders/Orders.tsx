import { useRef, useState } from 'react';
import { pickupPoints, type OrderStatus } from '../../data';
import { money, readableDate } from '../../shop';
import { useShopContext } from '../../ui/shop-context';
import { OrderItems } from './OrderItems';
import { RepeatDialog, type RepeatDialogHandle } from './RepeatDialog';

const isClosed = (status: OrderStatus) => ['Получен', 'Отменён'].includes(status);

export const Orders = () => {
  const { shop } = useShopContext();
  const [tab, setTab] = useState('Все');
  const [cancelId, setCancelId] = useState<number>();
  const [cancellingId, setCancellingId] = useState<number>();
  const [repeatingId, setRepeatingId] = useState<number>();
  const repeatDialog = useRef<RepeatDialogHandle>(null);
  const orders = [...shop.state.orders]
    .sort((a, b) => b.id - a.id)
    .filter(
      (order) =>
        tab === 'Все' || (tab === 'Активные' ? !isClosed(order.status) : isClosed(order.status)),
    );
  const pointFor = (id: string) => pickupPoints.find((point) => point.id === id);

  async function cancel(id: number) {
    setCancellingId(id);
    if (await shop.cancel(id)) setCancelId(undefined);
    setCancellingId(undefined);
  }

  function repeat(id: number) {
    setRepeatingId(id);
    repeatDialog.current?.open(id);
  }

  return (
    <>
      <div className="page-heading">
        <h1>Заказы</h1>
      </div>
      <div className="category-tabs order-tabs" aria-label="Показать заказы">
        {['Все', 'Активные', 'Завершённые'].map((item) => (
          <button
            key={item}
            className={tab === item ? 'active' : undefined}
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {orders.length === 0 && (
        <section className="empty-state">
          <h2>{tab === 'Все' ? 'Заказов пока нет' : 'В этом разделе нет заказов'}</h2>
          <a href="#/catalog" className="primary">
            Открыть каталог
          </a>
        </section>
      )}
      {orders.map((order) => (
        <article key={order.id} className="order-card">
          <div className="order-card-top">
            <div>
              <a href={`#/order/${order.id}`} className="order-number">
                КР-{order.id}
              </a>
              <small>{readableDate(order.created)}</small>
            </div>
            <span
              className={`status-pill${isClosed(order.status) ? ' closed' : ''}${order.status === 'Отменён' ? ' cancelled' : ''}`}
            >
              {order.status}
            </span>
          </div>
          <OrderItems lines={order.lines} />
          <p className="order-pickup">
            {pointFor(order.pickup)?.address}, {readableDate(order.date)}. Получатель{' '}
            {order.customer}
          </p>
          <div className="order-total">
            <span>{order.lines.reduce((sum, line) => sum + line.quantity, 0)} шт.</span>
            <strong>
              {money(order.lines.reduce((sum, line) => sum + line.price * line.quantity, 0))}
            </strong>
          </div>
          <div className="order-actions">
            <button className="secondary" disabled={shop.pending} onClick={() => repeat(order.id)}>
              {shop.pending && repeatingId === order.id && cancellingId === undefined
                ? 'Собираем…'
                : 'Повторить заказ'}
            </button>
            {['Принят', 'Собирается'].includes(order.status) && (
              <button
                className="text-button cancel-button"
                disabled={shop.pending}
                onClick={() =>
                  setCancelId((current) => (current === order.id ? undefined : order.id))
                }
              >
                Отменить
              </button>
            )}
          </div>
          {cancelId === order.id && (
            <div className="cancel-confirm">
              <p>Отменить заказ КР-{order.id}?</p>
              <button
                className="danger"
                disabled={shop.pending}
                onClick={() => void cancel(order.id)}
              >
                {shop.pending && cancellingId === order.id ? 'Отменяем…' : 'Отменить заказ'}
              </button>
              <button
                className="text-button"
                disabled={shop.pending}
                onClick={() => setCancelId(undefined)}
              >
                Оставить заказ
              </button>
            </div>
          )}
        </article>
      ))}
      <RepeatDialog ref={repeatDialog} />
    </>
  );
};
