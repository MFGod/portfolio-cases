import { ProductArt } from '../../ProductArt';
import { products } from '../../data';
import { money } from '../../shop';
import { AppIcon } from '../../ui/AppIcon';
import { QuantityControl } from '../../ui/QuantityControl';
import { useShopContext } from '../../ui/shop-context';

export const Product = ({ id }: { id: string }) => {
  const { shop } = useShopContext();
  const product = products.find((item) => item.id === id);

  return (
    <>
      <a href="#/catalog" className="back-link">
        <AppIcon name="back" size={16} />
        Каталог
      </a>
      {product ? (
        <>
          <div className="product-detail-art">
            <ProductArt product={product} />
          </div>
          <div className="detail-heading">
            <h1>{product.name}</h1>
            <p>
              {product.weight}, {product.brand}.
            </p>
            <p className={!shop.stock(product.id) ? 'field-error' : undefined}>
              {shop.stock(product.id) ? `В наличии ${shop.stock(product.id)} шт.` : 'Нет в наличии'}
            </p>
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="purchase-bar">
            <strong>{money(product.price)}</strong>
            <QuantityControl id={product.id} name={product.name} />
          </div>
          {shop.quantity(product.id) > 0 && (
            <a href="#/cart" className="text-button cart-link">
              Перейти в корзину
              <AppIcon name="forward" size={16} />
            </a>
          )}
        </>
      ) : (
        <section className="empty-state">
          <h1>Товар не найден</h1>
          <a href="#/catalog" className="primary">
            Открыть каталог
          </a>
        </section>
      )}
    </>
  );
};
