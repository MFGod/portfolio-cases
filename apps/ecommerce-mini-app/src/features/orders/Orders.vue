<script setup lang="ts">
import { computed, ref } from 'vue';
import { pickupPoints, type OrderStatus } from '../../data';
import { money, readableDate } from '../../shop';
import { useShopContext } from '../../ui/shop-context';
import OrderItems from './OrderItems.vue';
import RepeatDialog from './RepeatDialog.vue';
const { shop } = useShopContext();
const { pending } = shop;
const tab = ref('Все');
const cancelId = ref<number>();
const cancellingId = ref<number>();
const repeatingId = ref<number>();
const repeatDialog = ref<InstanceType<typeof RepeatDialog>>();
const isClosed = (status: OrderStatus) => ['Получен', 'Отменён'].includes(status);
const orders = computed(() =>
  [...shop.state.orders]
    .sort((a, b) => b.id - a.id)
    .filter(
      (order) =>
        tab.value === 'Все' ||
        (tab.value === 'Активные' ? !isClosed(order.status) : isClosed(order.status)),
    ),
);
const pointFor = (id: string) => pickupPoints.find((point) => point.id === id);
async function cancel(id: number) {
  cancellingId.value = id;
  if (await shop.cancel(id)) cancelId.value = undefined;
  cancellingId.value = undefined;
}
function repeat(id: number) {
  repeatingId.value = id;
  repeatDialog.value?.open(id);
}
</script>

<template>
  <div class="page-heading"><h1>Заказы</h1></div>
  <div class="category-tabs order-tabs" aria-label="Показать заказы">
    <button
      v-for="item in ['Все', 'Активные', 'Завершённые']"
      :key="item"
      :class="{ active: tab === item }"
      :aria-pressed="tab === item"
      @click="tab = item"
    >
      {{ item }}
    </button>
  </div>
  <section v-if="!orders.length" class="empty-state">
    <h2>{{ tab === 'Все' ? 'Заказов пока нет' : 'В этом разделе нет заказов' }}</h2>
    <a href="#/catalog" class="primary">Открыть каталог</a>
  </section>
  <article v-for="order in orders" :key="order.id" class="order-card">
    <div class="order-card-top">
      <div>
        <a :href="`#/order/${order.id}`" class="order-number">КР-{{ order.id }}</a
        ><small>{{ readableDate(order.created) }}</small>
      </div>
      <span
        class="status-pill"
        :class="{ closed: isClosed(order.status), cancelled: order.status === 'Отменён' }"
        >{{ order.status }}</span
      >
    </div>
    <OrderItems :lines="order.lines" />
    <p class="order-pickup">
      {{ pointFor(order.pickup)?.address }}, {{ readableDate(order.date) }}. Получатель
      {{ order.customer }}
    </p>
    <div class="order-total">
      <span>{{ order.lines.reduce((sum, line) => sum + line.quantity, 0) }} шт.</span
      ><strong>{{
        money(order.lines.reduce((sum, line) => sum + line.price * line.quantity, 0))
      }}</strong>
    </div>
    <div class="order-actions">
      <button class="secondary" :disabled="pending" @click="repeat(order.id)">
        {{
          pending && repeatingId === order.id && cancellingId === undefined
            ? 'Собираем…'
            : 'Повторить заказ'
        }}
      </button>
      <button
        v-if="['Принят', 'Собирается'].includes(order.status)"
        class="text-button cancel-button"
        :disabled="pending"
        @click="cancelId = cancelId === order.id ? undefined : order.id"
      >
        Отменить
      </button>
    </div>
    <div v-if="cancelId === order.id" class="cancel-confirm">
      <p>Отменить заказ КР-{{ order.id }}?</p>
      <button class="danger" :disabled="pending" @click="cancel(order.id)">
        {{ pending && cancellingId === order.id ? 'Отменяем…' : 'Отменить заказ' }}</button
      ><button class="text-button" :disabled="pending" @click="cancelId = undefined">
        Оставить заказ
      </button>
    </div>
  </article>
  <RepeatDialog ref="repeatDialog" />
</template>
