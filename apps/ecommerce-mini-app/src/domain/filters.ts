import { products } from '../data';

export interface ShopFilters {
  search: string;
  category: string;
  sort: string;
  min: string | number;
  max: string | number;
  brand: string;
  inStock: boolean;
}

export const emptyFilters = (): ShopFilters => ({
  search: '',
  category: 'Все',
  sort: 'popular',
  min: '',
  max: '',
  brand: 'Все',
  inStock: false,
});

export function restoreFilters(raw: unknown): ShopFilters {
  const clean = emptyFilters();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
  const value = raw as Record<string, unknown>;
  if (typeof value.search === 'string') clean.search = value.search.slice(0, 200);
  if (
    typeof value.category === 'string' &&
    ['Все', ...products.map((item) => item.category)].includes(value.category)
  )
    clean.category = value.category;
  if (
    typeof value.brand === 'string' &&
    ['Все', ...products.map((item) => item.brand)].includes(value.brand)
  )
    clean.brand = value.brand;
  if (
    typeof value.sort === 'string' &&
    ['popular', 'price-up', 'price-down', 'name'].includes(value.sort)
  )
    clean.sort = value.sort;
  for (const key of ['min', 'max'] as const) {
    const amount = value[key];
    if (
      (typeof amount === 'string' || typeof amount === 'number') &&
      Number.isFinite(Number(amount)) &&
      Number(amount) >= 0
    )
      clean[key] = amount;
  }
  if (typeof value.inStock === 'boolean') clean.inStock = value.inStock;
  return clean;
}
