<script setup lang="ts">
import { products } from '../../data';
import AppIcon from '../../ui/AppIcon.vue';
import ProductCard from './ProductCard.vue';
import { useCatalog } from './use-catalog';
const { filters, filtersOpen, rangeError, filtered, activeFilterCount, resetFilters } =
  useCatalog();
</script>

<template>
  <h1 class="sr-only">Каталог</h1>
  <div class="catalog-search">
    <label class="search-field">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" />
        <path d="M15 15L21 21" />
      </svg>
      <input
        v-model="filters.search"
        type="search"
        placeholder="Найти товар"
        aria-label="Найти товар"
      />
      <button
        v-if="filters.search"
        class="icon-button"
        aria-label="Очистить поиск"
        @click="filters.search = ''"
      >
        <AppIcon name="close" :size="18" />
      </button>
    </label>
    <button
      class="filter-toggle"
      aria-label="Сортировка и фильтры"
      :aria-expanded="filtersOpen"
      aria-controls="catalog-filters"
      @click="filtersOpen = !filtersOpen"
    >
      <AppIcon name="filter" :size="20" /><span v-if="activeFilterCount">{{
        activeFilterCount
      }}</span>
    </button>
  </div>
  <div class="category-tabs" aria-label="Категории">
    <button
      v-for="category in ['Все', 'Бакалея', 'Напитки', 'Для дома']"
      :key="category"
      :class="{ active: filters.category === category }"
      :aria-pressed="filters.category === category"
      @click="filters.category = category"
    >
      {{ category }}
    </button>
  </div>
  <section
    v-show="filtersOpen"
    id="catalog-filters"
    class="filter-panel"
    aria-label="Фильтры товаров"
  >
    <label
      >Сортировка<select v-model="filters.sort">
        <option value="popular">По умолчанию</option>
        <option value="price-up">Сначала дешевле</option>
        <option value="price-down">Сначала дороже</option>
        <option value="name">По названию</option>
      </select></label
    >
    <div class="field-row">
      <label
        >Цена от, ₽<input
          v-model="filters.min"
          type="number"
          min="0"
          placeholder="0"
          :aria-invalid="Boolean(rangeError)"
          :aria-describedby="rangeError ? 'price-error' : undefined"
      /></label>
      <label
        >Цена до, ₽<input
          v-model="filters.max"
          type="number"
          min="0"
          placeholder="Любая"
          :aria-invalid="Boolean(rangeError)"
          :aria-describedby="rangeError ? 'price-error' : undefined"
      /></label>
    </div>
    <p v-if="rangeError" id="price-error" class="field-error" role="alert">{{ rangeError }}</p>
    <label
      >Производитель<select v-model="filters.brand">
        <option>Все</option>
        <option>Урожай</option>
        <option>Чайный дом</option>
        <option>Бытпром</option>
      </select></label
    >
    <label class="checkbox"
      ><input v-model="filters.inStock" type="checkbox" />Только в наличии</label
    >
    <button class="text-button" @click="resetFilters">Сбросить фильтры</button>
  </section>
  <p v-if="filtered.length < products.length" class="result-count" aria-live="polite">
    {{ filtered.length }} из {{ products.length }} товаров
  </p>
  <div v-if="filtered.length" class="product-grid">
    <ProductCard v-for="item in filtered" :key="item.id" :product="item" />
  </div>
  <section v-else-if="!rangeError" class="empty-state compact">
    <h2>Ничего не нашлось</h2>
    <p v-if="filters.search">
      По запросу «{{ filters.search }}» нет товаров с выбранными фильтрами.
    </p>
    <button class="secondary" @click="resetFilters">Сбросить поиск и фильтры</button>
  </section>
</template>
