import { useState } from 'react';
import { deliveryDates, money, readableDate } from '../../shop';
import { AppIcon } from '../../ui/AppIcon';
import { PickupSummary } from '../../ui/PickupSummary';
import { OrderSummary } from '../../ui/OrderSummary';
import { useShopContext } from '../../ui/shop-context';
import { useDeliveryForm } from './use-delivery-form';

export const Checkout = () => {
  const { shop, navigate } = useShopContext();
  const { form, setForm, changed, saving, hasChanges, stopSave, finishCheckout } =
    useDeliveryForm();
  const [reviewedCart, setReviewedCart] = useState(shop.checkoutFingerprint);
  const changedCart = reviewedCart !== shop.checkoutFingerprint;
  const hasStockError = shop.lines.some((line) => line.quantity > shop.stock(line.productId));
  const dates = deliveryDates();

  async function submit() {
    stopSave();
    const oldIds = new Set(shop.state.orders.map((order) => order.id));
    const ok = await shop.checkout(reviewedCart, { ...form, pickup: shop.state.pickup });
    finishCheckout(ok);
    if (!ok) return;
    const order = shop.getState().orders.find((item) => !oldIds.has(item.id));
    navigate(order ? `/order/${order.id}` : '/orders');
  }

  function reviewCart() {
    setReviewedCart(shop.checkoutFingerprint);
    shop.dismissError();
  }

  return (
    <>
      <a href="#/cart" className="back-link">
        <AppIcon name="back" size={16} />
        Корзина
      </a>
      <div className="page-heading">
        <h1>Оформление</h1>
      </div>
      {shop.lines.length === 0 ? (
        <section className="empty-state">
          <h2>Корзина пуста</h2>
          <a href="#/catalog" className="primary">
            Выбрать товары
          </a>
        </section>
      ) : (
        <form
          className="checkout-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <section className="checkout-section first-section">
            <h2>Пункт выдачи</h2>
            <PickupSummary />
          </section>
          <section className="checkout-section">
            <h2>Получение</h2>
            <div className="checkout-fields">
              <label>
                Дата получения
                <select
                  value={form.date}
                  disabled={shop.pending && !saving}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, date: event.target.value }));
                    changed('date');
                  }}
                >
                  {dates.map((date) => (
                    <option key={date} value={date}>
                      {readableDate(date)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Имя получателя
                <input
                  value={form.customer}
                  maxLength={40}
                  disabled={shop.pending && !saving}
                  autoComplete="given-name"
                  required
                  onChange={(event) => {
                    setForm((current) => ({ ...current, customer: event.target.value }));
                    changed('customer');
                  }}
                />
              </label>
            </div>
            {saving ? (
              <p className="help-text" role="status">
                Сохраняем данные получателя…
              </p>
            ) : (
              hasChanges && <p className="help-text">Изменения ещё не сохранены.</p>
            )}
          </section>
          <section className="checkout-section order-composition">
            <div className="section-heading">
              <h2>Состав заказа</h2>
              <a href="#/cart" className="text-button">
                Изменить
              </a>
            </div>
            <ul className="order-items">
              {shop.lines.map((line) => (
                <li key={line.productId}>
                  <span>
                    {line.product.name}
                    <small>{line.quantity} шт.</small>
                  </span>
                  <span>{money(line.product.price * line.quantity)}</span>
                </li>
              ))}
            </ul>
            {changedCart && (
              <div className="cart-change" role="alert">
                <p>Корзина изменилась в другой вкладке. Проверьте состав и сумму.</p>
                <button type="button" className="secondary" onClick={reviewCart}>
                  Состав проверен
                </button>
              </div>
            )}
            {hasStockError && (
              <p className="field-error">Остатки изменились. Уменьшите количество в корзине.</p>
            )}
          </section>
          <OrderSummary>
            <p className="help-text payment-note">Оплата при получении. Заказ хранится 2 дня.</p>
            <button
              type="submit"
              className="primary"
              disabled={
                shop.pending ||
                changedCart ||
                shop.total < 100 ||
                !form.customer.trim() ||
                hasStockError
              }
            >
              {shop.pending && !saving
                ? 'Оформляем…'
                : saving
                  ? 'Сохраняем…'
                  : `Подтвердить: ${money(shop.total)}`}
            </button>
          </OrderSummary>
        </form>
      )}
    </>
  );
};
