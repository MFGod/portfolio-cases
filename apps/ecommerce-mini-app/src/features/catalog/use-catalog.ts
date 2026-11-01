import { useState } from 'react';
import { products } from '../../data';
import { emptyFilters } from '../../domain/filters';
import { useShopContext } from '../../ui/shop-context';

export function useCatalog() {
  const { shop } = useShopContext();
  const { filters } = shop;
  const values = [filters.min, filters.max];
  const rangeError = values.some(
    (value) => value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0),
  )
    ? 'Укажите цену от 0 ₽.'
    : filters.min !== '' && filters.max !== '' && Number(filters.min) > Number(filters.max)
      ? 'Цена «до» должна быть не меньше цены «от».'
      : '';
  const [filtersOpen, setFiltersOpen] = useState(Boolean(rangeError));
  const filtered = rangeError
    ? []
    : products.filter(
        (item) =>
          (filters.category === 'Все' || item.category === filters.category) &&
          (filters.brand === 'Все' || item.brand === filters.brand) &&
          (!filters.inStock || shop.stock(item.id) > 0) &&
          `${item.name} ${item.brand}`
            .toLowerCase()
            .includes(filters.search.trim().toLowerCase()) &&
          (filters.min === '' || item.price >= Number(filters.min)) &&
          (filters.max === '' || item.price <= Number(filters.max)),
      );
  if (filters.sort === 'price-up') filtered.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price-down') filtered.sort((a, b) => b.price - a.price);
  if (filters.sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  const activeFilterCount =
    Number(Boolean(filters.min || filters.max)) +
    Number(filters.brand !== 'Все') +
    Number(filters.inStock);

  function resetFilters() {
    shop.updateFilters(emptyFilters());
  }

  return {
    filters,
    filtersOpen,
    setFiltersOpen,
    rangeError,
    filtered,
    activeFilterCount,
    resetFilters,
  };
}
