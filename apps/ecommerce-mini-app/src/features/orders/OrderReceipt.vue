<script setup lang="ts">
import { computed } from 'vue';
import { pickupPoints } from '../../data';
import { money, readableDate } from '../../shop';
import AppIcon from '../../ui/AppIcon.vue';
import { useShopContext } from '../../ui/shop-context';
import OrderItems from './OrderItems.vue';
const props = defineProps<{ id: string }>();
const { shop } = useShopContext();
const order = computed(() => shop.state.orders.find((item) => String(item.id) === props.id));
const point = computed(() => pickupPoints.find((item) => item.id === order.value?.pickup));
const total = computed(
  () => order.value?.lines.reduce((sum, line) => sum + line.price * line.quantity, 0) ?? 0,
);
</script>

<template>
  <a href="#/orders" class="back-link"><AppIcon name="back" :size="16" />Заказы</a>
  <article v-if="order" class="pickup-receipt">
    <header class="receipt-heading">
      <span class="receipt-mark"
        ><AppIcon :name="order.status === 'Отменён' ? 'close' : 'check'" :size="24"
      /></span>
      <h1>Заказ КР-{{ order.id }}</h1>
      <span class="status-pill" :class="{ cancelled: order.status === 'Отменён' }">{{
        order.status
      }}</span>
      <p>{{ readableDate(order.created) }}</p>
    </header>
    <section class="receipt-pickup">
      <h2>{{ readableDate(order.date) }}</h2>
      <strong>{{ point?.name }}</strong>
      <p>{{ point?.address }}</p>
      <p class="help-text">{{ point?.hours }}</p>
      <p class="help-text">{{ point?.walk }}</p>
      <p>Получатель {{ order.customer }}</p>
    </section>
    <OrderItems :lines="order.lines" />
    <div class="receipt-total">
      <span>{{
        ['Получен', 'Отменён'].includes(order.status)
          ? 'Стоимость заказа'
          : 'К оплате при получении'
      }}</span
      ><strong>{{ money(total) }}</strong>
    </div>
    <p v-if="!['Получен', 'Отменён'].includes(order.status)" class="help-text receipt-note">
      Заказ хранится 2 дня с даты получения.
    </p>
    <a href="#/catalog" class="primary">Вернуться в каталог</a>
    <a href="#/orders" class="text-button receipt-orders">Открыть мои заказы</a>
  </article>
  <section v-else class="empty-state">
    <h1>Заказ не найден</h1>
    <a href="#/orders" class="primary">Открыть заказы</a>
  </section>
</template>
