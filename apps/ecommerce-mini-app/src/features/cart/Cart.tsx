import { AppIcon } from '../../ui/AppIcon';
import { PickupSummary } from '../../ui/PickupSummary';
import { OrderSummary } from '../../ui/OrderSummary';
import { useShopContext } from '../../ui/shop-context';
import { CartLines } from './CartLines';

export const Cart = () => {
  const { shop } = useShopContext();
  const hasStockError = shop.lines.some((line) => line.quantity > shop.stock(line.productId));

  return (
    <>
      <div className="page-heading">
        <h1>Корзина</h1>
        {shop.lines.length > 0 && (
          <a href="#/catalog" className="text-button">
            Добавить товары
          </a>
        )}
      </div>
      {shop.lines.length > 0 ? (
        <>
          <CartLines />
          <section className="checkout-section">
            <h2>Самовывоз</h2>
            <PickupSummary />
          </section>
          <OrderSummary>
            {shop.total >= 100 && !hasStockError && (
              <a href="#/checkout" className="primary">
                К оформлению
                <AppIcon name="forward" size={16} />
              </a>
            )}
            {hasStockError && (
              <p className="field-error">Проверьте количество товаров перед оформлением.</p>
            )}
          </OrderSummary>
        </>
      ) : (
        <>
          <section className="empty-state">
            <h2>Корзина пуста</h2>
            <a href="#/catalog" className="primary">
              Выбрать товары
            </a>
          </section>
          <section className="checkout-section">
            <h2>Самовывоз</h2>
            <PickupSummary />
          </section>
        </>
      )}
    </>
  );
};
