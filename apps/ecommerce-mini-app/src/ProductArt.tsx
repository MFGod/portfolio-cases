import type { Product } from './data';

const photos = import.meta.glob<string>('./assets/products/*.webp', {
  eager: true,
  import: 'default',
});

export const ProductArt = ({ product }: { product: Product }) => (
  <img
    className="product-art"
    src={photos[`./assets/products/${product.id}.webp`]}
    alt={product.name}
    draggable="false"
  />
);
