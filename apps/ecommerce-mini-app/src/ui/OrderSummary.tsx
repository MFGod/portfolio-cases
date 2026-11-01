import type { ReactNode } from 'react';
import { money } from '../shop';
import { useShopContext } from './shop-context';

export const OrderSummary = ({ children }: { children?: ReactNode }) => {
  const { shop } = useShopContext();

  return (
    <section className="order-summary" aria-label="Стоимость заказа">
      <div>
        <span>Товары: {shop.count} шт.</span>
        <span>{money(shop.total)}</span>
      </div>
      <div>
        <span>Самовывоз</span>
        <span className="green">Бесплатно</span>
      </div>
      <div className="summary-total">
        <strong>Итого</strong>
        <strong>{money(shop.total)}</strong>
      </div>
      {shop.total < 100 && (
        <p className="field-error">
          Добавьте товаров ещё на {money(100 - shop.total)}. Минимум 100 ₽.
        </p>
      )}
      {children}
    </section>
  );
};
