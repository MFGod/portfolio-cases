import { ProductArt } from '../../ProductArt';
import type { Product } from '../../data';
import { money } from '../../shop';
import { QuantityControl } from '../../ui/QuantityControl';
import { useShopContext } from '../../ui/shop-context';

export const ProductCard = ({ product }: { product: Product }) => {
  const { shop } = useShopContext();
  const stock = shop.stock(product.id);

  return (
    <article className="product-card">
      <a
        href={`#/product/${product.id}`}
        className="product-link"
        aria-label={`Открыть: ${product.name}`}
      >
        <span className="product-image">
          {!stock ? (
            <span className="stock-badge">Нет в наличии</span>
          ) : (
            stock <= 2 && <span className="stock-badge low-stock">Осталось {stock}</span>
          )}
          <ProductArt product={product} />
        </span>
        <span className="product-copy">
          <strong className="product-price">{money(product.price)}</strong>
          <span className="product-name">{product.name}</span>
          <span className="product-weight">{product.weight}</span>
        </span>
      </a>
      <QuantityControl id={product.id} name={product.name} iconOnly />
    </article>
  );
};
