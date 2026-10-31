<script setup lang="ts">
import { money } from '../shop';
import { useShopContext } from './shop-context';
const { shop } = useShopContext();
const { count, total } = shop;
</script>

<template>
  <section class="order-summary" aria-label="Стоимость заказа">
    <div>
      <span>Товары: {{ count }} шт.</span><span>{{ money(total) }}</span>
    </div>
    <div><span>Самовывоз</span><span class="green">Бесплатно</span></div>
    <div class="summary-total">
      <strong>Итого</strong><strong>{{ money(total) }}</strong>
    </div>
    <p v-if="total < 100" class="field-error">
      Добавьте товаров ещё на {{ money(100 - total) }}. Минимум 100 ₽.
    </p>
    <slot />
  </section>
</template>
