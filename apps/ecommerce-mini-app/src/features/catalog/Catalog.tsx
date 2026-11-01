import { products } from '../../data';
import { AppIcon } from '../../ui/AppIcon';
import { useShopContext } from '../../ui/shop-context';
import { ProductCard } from './ProductCard';
import { useCatalog } from './use-catalog';

export const Catalog = () => {
  const { shop } = useShopContext();
  const {
    filters,
    filtersOpen,
    setFiltersOpen,
    rangeError,
    filtered,
    activeFilterCount,
    resetFilters,
  } = useCatalog();

  return (
    <>
      <h1 className="sr-only">Каталог</h1>
      <div className="catalog-search">
        <label className="search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10" cy="10" r="6.5" />
            <path d="M15 15L21 21" />
          </svg>
          <input
            value={filters.search}
            onChange={(event) => shop.updateFilters({ search: event.target.value })}
            type="search"
            placeholder="Найти товар"
            aria-label="Найти товар"
          />
          {filters.search && (
            <button
              className="icon-button"
              aria-label="Очистить поиск"
              onClick={() => shop.updateFilters({ search: '' })}
            >
              <AppIcon name="close" size={18} />
            </button>
          )}
        </label>
        <button
          className="filter-toggle"
          aria-label="Сортировка и фильтры"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen((current) => !current)}
        >
          <AppIcon name="filter" size={20} />
          {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
        </button>
      </div>
      <div className="category-tabs" aria-label="Категории">
        {['Все', 'Бакалея', 'Напитки', 'Для дома'].map((category) => (
          <button
            key={category}
            className={filters.category === category ? 'active' : undefined}
            aria-pressed={filters.category === category}
            onClick={() => shop.updateFilters({ category })}
          >
            {category}
          </button>
        ))}
      </div>
      <section
        id="catalog-filters"
        className="filter-panel"
        aria-label="Фильтры товаров"
        style={{ display: filtersOpen ? undefined : 'none' }}
      >
        <label>
          Сортировка
          <select
            value={filters.sort}
            onChange={(event) => shop.updateFilters({ sort: event.target.value })}
          >
            <option value="popular">По умолчанию</option>
            <option value="price-up">Сначала дешевле</option>
            <option value="price-down">Сначала дороже</option>
            <option value="name">По названию</option>
          </select>
        </label>
        <div className="field-row">
          <label>
            Цена от, ₽
            <input
              value={filters.min}
              onChange={(event) => shop.updateFilters({ min: event.target.value })}
              type="number"
              min="0"
              placeholder="0"
              aria-invalid={Boolean(rangeError)}
              aria-describedby={rangeError ? 'price-error' : undefined}
            />
          </label>
          <label>
            Цена до, ₽
            <input
              value={filters.max}
              onChange={(event) => shop.updateFilters({ max: event.target.value })}
              type="number"
              min="0"
              placeholder="Любая"
              aria-invalid={Boolean(rangeError)}
              aria-describedby={rangeError ? 'price-error' : undefined}
            />
          </label>
        </div>
        {rangeError && (
          <p id="price-error" className="field-error" role="alert">
            {rangeError}
          </p>
        )}
        <label>
          Производитель
          <select
            value={filters.brand}
            onChange={(event) => shop.updateFilters({ brand: event.target.value })}
          >
            <option>Все</option>
            <option>Урожай</option>
            <option>Чайный дом</option>
            <option>Бытпром</option>
          </select>
        </label>
        <label className="checkbox">
          <input
            checked={filters.inStock}
            onChange={(event) => shop.updateFilters({ inStock: event.target.checked })}
            type="checkbox"
          />
          Только в наличии
        </label>
        <button className="text-button" onClick={resetFilters}>
          Сбросить фильтры
        </button>
      </section>
      {filtered.length < products.length && (
        <p className="result-count" aria-live="polite">
          {filtered.length} из {products.length} товаров
        </p>
      )}
      {filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      ) : (
        !rangeError && (
          <section className="empty-state compact">
            <h2>Ничего не нашлось</h2>
            {filters.search && (
              <p>По запросу «{filters.search}» нет товаров с выбранными фильтрами.</p>
            )}
            <button className="secondary" onClick={resetFilters}>
              Сбросить поиск и фильтры
            </button>
          </section>
        )
      )}
    </>
  );
};
