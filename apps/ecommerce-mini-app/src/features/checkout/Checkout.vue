<script setup lang="ts">
import { computed, ref } from 'vue';
import { deliveryDates, money, readableDate } from '../../shop';
import AppIcon from '../../ui/AppIcon.vue';
import PickupSummary from '../../ui/PickupSummary.vue';
import OrderSummary from '../../ui/OrderSummary.vue';
import { useShopContext } from '../../ui/shop-context';
import { useDeliveryForm } from './use-delivery-form';
const { shop, navigate } = useShopContext();
const { lines, total, pending, checkoutFingerprint } = shop;
const { form, changed, saving, hasChanges, stopSave, finishCheckout } = useDeliveryForm();
const reviewedCart = ref(checkoutFingerprint.value);
const changedCart = computed(() => reviewedCart.value !== checkoutFingerprint.value);
const hasStockError = computed(() =>
  lines.value.some((line) => line.quantity > shop.stock(line.productId)),
);
const dates = computed(() => deliveryDates());
async function submit() {
  stopSave();
  const oldIds = new Set(shop.state.orders.map((order) => order.id));
  const ok = await shop.checkout(reviewedCart.value, { ...form, pickup: shop.state.pickup });
  finishCheckout(ok);
  if (!ok) return;
  const order = shop.state.orders.find((item) => !oldIds.has(item.id));
  navigate(order ? `/order/${order.id}` : '/orders');
}
function reviewCart() {
  reviewedCart.value = checkoutFingerprint.value;
  shop.dismissError();
}
</script>

<template>
  <a href="#/cart" class="back-link"><AppIcon name="back" :size="16" />Корзина</a>
  <div class="page-heading"><h1>Оформление</h1></div>
  <section v-if="!lines.length" class="empty-state">
    <h2>Корзина пуста</h2>
    <a href="#/catalog" class="primary">Выбрать товары</a>
  </section>
  <form v-else class="checkout-form" @submit.prevent="submit">
    <section class="checkout-section first-section">
      <h2>Пункт выдачи</h2>
      <PickupSummary />
    </section>
    <section class="checkout-section">
      <h2>Получение</h2>
      <div class="checkout-fields">
        <label
          >Дата получения
          <select v-model="form.date" :disabled="pending && !saving" @change="changed('date')">
            <option v-for="date in dates" :key="date" :value="date">
              {{ readableDate(date) }}
            </option>
          </select>
        </label>
        <label
          >Имя получателя
          <input
            v-model="form.customer"
            maxlength="40"
            :disabled="pending && !saving"
            autocomplete="given-name"
            required
            @input="changed('customer')"
          />
        </label>
      </div>
      <p v-if="saving" class="help-text" role="status">Сохраняем данные получателя…</p>
      <p v-else-if="hasChanges" class="help-text">Изменения ещё не сохранены.</p>
    </section>
    <section class="checkout-section order-composition">
      <div class="section-heading">
        <h2>Состав заказа</h2>
        <a href="#/cart" class="text-button">Изменить</a>
      </div>
      <ul class="order-items">
        <li v-for="line in lines" :key="line.productId">
          <span
            >{{ line.product.name }}<small>{{ line.quantity }} шт.</small></span
          ><span>{{ money(line.product.price * line.quantity) }}</span>
        </li>
      </ul>
      <div v-if="changedCart" class="cart-change" role="alert">
        <p>Корзина изменилась в другой вкладке. Проверьте состав и сумму.</p>
        <button type="button" class="secondary" @click="reviewCart">Состав проверен</button>
      </div>
      <p v-if="hasStockError" class="field-error">
        Остатки изменились. Уменьшите количество в корзине.
      </p>
    </section>
    <OrderSummary>
      <p class="help-text payment-note">Оплата при получении. Заказ хранится 2 дня.</p>
      <button
        type="submit"
        class="primary"
        :disabled="pending || changedCart || total < 100 || !form.customer.trim() || hasStockError"
      >
        {{
          pending && !saving ? 'Оформляем…' : saving ? 'Сохраняем…' : `Подтвердить: ${money(total)}`
        }}
      </button>
    </OrderSummary>
  </form>
</template>
