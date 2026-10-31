<script setup lang="ts">
import { money } from '../shop';
import { useShopContext } from './shop-context';
defineProps<{ screen: string }>();
const { shop } = useShopContext();
const { count, total, ready } = shop;
</script>

<template>
  <nav class="bottom-nav" aria-label="Главное меню">
    <a
      href="#/catalog"
      :class="{ active: ['catalog', 'product'].includes(screen) }"
      :aria-current="['catalog', 'product'].includes(screen) ? 'page' : undefined"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" /></svg
      ><span>Каталог</span>
    </a>
    <a
      href="#/orders"
      :class="{ active: ['orders', 'order'].includes(screen) }"
      :aria-current="['orders', 'order'].includes(screen) ? 'page' : undefined"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3H18L20 7V20H4V7Z M4 7H20M9 11H15" />
      </svg>
      <span>Заказы</span>
    </a>
    <a
      href="#/cart"
      class="cart-shortcut"
      :class="{ active: ['cart', 'checkout'].includes(screen) }"
      :aria-current="['cart', 'checkout'].includes(screen) ? 'page' : undefined"
    >
      <span class="nav-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 8H19L21 21H3L5 8Z M8 9V6a4 4 0 0 1 8 0v3" />
        </svg>
        <span v-if="count && ready" class="cart-badge">{{ count }}</span>
      </span>
      <span
        >Корзина<strong v-if="count && ready">{{ money(total) }}</strong></span
      >
    </a>
  </nav>
</template>
