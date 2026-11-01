import { ProductArt } from '../../ProductArt';
import { money } from '../../shop';
import { QuantityControl } from '../../ui/QuantityControl';
import { useShopContext } from '../../ui/shop-context';

export const CartLines = () => {
  const { shop } = useShopContext();

  return (
    <section className="cart-lines" aria-label="Товары в корзине">
      {shop.lines.map((line) => (
        <article key={line.productId} className="cart-line">
          <a
            href={`#/product/${line.productId}`}
            className="cart-art"
            aria-label={`Открыть: ${line.product.name}`}
          >
            <ProductArt product={line.product} />
          </a>
          <div className="cart-line-content">
            <a href={`#/product/${line.productId}`}>{line.product.name}</a>
            <small>
              {line.product.weight}, {line.product.brand}
            </small>
            <div className="cart-bottom">
              <strong>{money(line.product.price * line.quantity)}</strong>
              <QuantityControl id={line.productId} name={line.product.name} small />
            </div>
            {line.quantity > shop.stock(line.productId) && (
              <small className="field-error">
                Доступно {shop.stock(line.productId)} шт. Уменьшите количество.
              </small>
            )}
          </div>
        </article>
      ))}
    </section>
  );
};
