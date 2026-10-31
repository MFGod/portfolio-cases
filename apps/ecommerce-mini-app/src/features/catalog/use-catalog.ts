import { computed, ref, watch } from 'vue';
import { products } from '../../data';
import { useShopContext } from '../../ui/shop-context';

export function useCatalog() {
  const { shop } = useShopContext();
  const { filters } = shop;
  const filtersOpen = ref(false);
  const rangeError = computed(() => {
    const values = [filters.min, filters.max];
    if (
      values.some((value) => value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0))
    )
      return 'Укажите цену от 0 ₽.';
    if (filters.min !== '' && filters.max !== '' && Number(filters.min) > Number(filters.max))
      return 'Цена «до» должна быть не меньше цены «от».';
    return '';
  });
  watch(
    rangeError,
    (message) => {
      if (message) filtersOpen.value = true;
    },
    { immediate: true },
  );
  const filtered = computed(() => {
    if (rangeError.value) return [];
    const result = products.filter(
      (item) =>
        (filters.category === 'Все' || item.category === filters.category) &&
        (filters.brand === 'Все' || item.brand === filters.brand) &&
        (!filters.inStock || shop.stock(item.id) > 0) &&
        `${item.name} ${item.brand}`.toLowerCase().includes(filters.search.trim().toLowerCase()) &&
        (filters.min === '' || item.price >= Number(filters.min)) &&
        (filters.max === '' || item.price <= Number(filters.max)),
    );
    if (filters.sort === 'price-up') result.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-down') result.sort((a, b) => b.price - a.price);
    if (filters.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return result;
  });
  const activeFilterCount = computed(
    () =>
      Number(Boolean(filters.min || filters.max)) +
      Number(filters.brand !== 'Все') +
      Number(filters.inStock),
  );
  function resetFilters() {
    Object.assign(filters, {
      search: '',
      category: 'Все',
      sort: 'popular',
      min: '',
      max: '',
      brand: 'Все',
      inStock: false,
    });
  }
  return { filters, filtersOpen, rangeError, filtered, activeFilterCount, resetFilters };
}
