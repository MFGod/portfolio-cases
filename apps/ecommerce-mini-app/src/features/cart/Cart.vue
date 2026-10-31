<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '../../ui/AppIcon.vue';
import PickupSummary from '../../ui/PickupSummary.vue';
import OrderSummary from '../../ui/OrderSummary.vue';
import { useShopContext } from '../../ui/shop-context';
import CartLines from './CartLines.vue';
const { shop } = useShopContext();
const { lines, total } = shop;
const hasStockError = computed(() =>
  lines.value.some((line) => line.quantity > shop.stock(line.productId)),
);
</script>

<template>
  <div class="page-heading">
    <h1>Корзина</h1>
    <a v-if="lines.length" href="#/catalog" class="text-button">Добавить товары</a>
  </div>
  <template v-if="lines.length">
    <CartLines />
    <section class="checkout-section">
      <h2>Самовывоз</h2>
      <PickupSummary />
    </section>
    <OrderSummary>
      <a v-if="total >= 100 && !hasStockError" href="#/checkout" class="primary"
        >К оформлению<AppIcon name="forward" :size="16"
      /></a>
      <p v-if="hasStockError" class="field-error">
        Проверьте количество товаров перед оформлением.
      </p>
    </OrderSummary>
  </template>
  <template v-else>
    <section class="empty-state">
      <h2>Корзина пуста</h2>
      <a href="#/catalog" class="primary">Выбрать товары</a>
    </section>
    <section class="checkout-section">
      <h2>Самовывоз</h2>
      <PickupSummary />
    </section>
  </template>
</template>
