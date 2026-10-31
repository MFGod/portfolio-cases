<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { pickupPoints } from './data';
import { useShop, type Kit } from './shop';
import Catalog from './features/catalog/Catalog.vue';
import Product from './features/product/Product.vue';
import Cart from './features/cart/Cart.vue';
import Checkout from './features/checkout/Checkout.vue';
import { createDeliveryDraft } from './features/checkout/use-delivery-form';
import Orders from './features/orders/Orders.vue';
import OrderReceipt from './features/orders/OrderReceipt.vue';
import AppIcon from './ui/AppIcon.vue';
import BottomNav from './ui/BottomNav.vue';
import PickupDialog from './ui/PickupDialog.vue';
import ShopFeedback from './ui/ShopFeedback.vue';
import { shopKey } from './ui/shop-context';
const props = defineProps<{ kit: Kit }>();
const shop = useShop(props.kit);
const delivery = createDeliveryDraft(shop);
const { loading, ready, pending, error, notice, retryAvailable } = shop;
const route = ref(location.hash.slice(1) || '/catalog');
const main = ref<HTMLElement>();
const pickupDialog = ref<InstanceType<typeof PickupDialog>>();
const routeChanged = () => {
  route.value = location.hash.slice(1) || '/catalog';
};
const navigate = (path: string) => {
  location.hash = path;
};
const screen = computed(() => route.value.split('/')[1] || 'catalog');
const itemId = computed(() => route.value.split('/')[2] || '');
const pickup = computed(() => pickupPoints.find((point) => point.id === shop.state.pickup));
provide(shopKey, { shop, delivery, navigate, openPickup: () => pickupDialog.value?.open() });
async function retry() {
  const ids = new Set(shop.state.orders.map((order) => order.id));
  const cart = JSON.stringify(shop.state.cart);
  await shop.retry();
  if (error.value) return;
  const order = shop.state.orders.find((item) => !ids.has(item.id));
  if (order) navigate(`/order/${order.id}`);
  else if (screen.value === 'orders' && JSON.stringify(shop.state.cart) !== cart) navigate('/cart');
}
let noticeTimer: number | undefined;
watch(notice, (message) => {
  window.clearTimeout(noticeTimer);
  if (message)
    noticeTimer = window.setTimeout(() => {
      notice.value = '';
    }, 4000);
});
watch(route, () => {
  if (screen.value === 'order') notice.value = '';
  window.scrollTo({ top: 0 });
  main.value?.focus({ preventScroll: true });
});
onMounted(() => {
  window.addEventListener('hashchange', routeChanged);
  void shop.load();
});
onUnmounted(() => {
  window.clearTimeout(noticeTimer);
  window.removeEventListener('hashchange', routeChanged);
  shop.dispose();
});
</script>

<template>
  <div class="shop-shell" :class="{ 'focused-flow': ['checkout', 'order'].includes(screen) }">
    <header class="shop-header">
      <div class="brand-row">
        <a href="#/catalog" class="brand-link">Корзина Рядом</a>
        <button
          class="pickup-button"
          :disabled="!ready || pending"
          :aria-label="`Пункт выдачи: ${pickup?.address ?? 'выбрать адрес'}`"
          aria-haspopup="dialog"
          @click="pickupDialog?.open()"
        >
          <AppIcon name="pin" :size="20" />
        </button>
      </div>
      <p class="location-current">Самовывоз, {{ pickup?.address ?? 'выберите пункт' }}</p>
    </header>
    <main ref="main" tabindex="-1" :aria-busy="loading">
      <ShopFeedback v-if="ready" :can-retry="retryAvailable" @retry="retry" />
      <section v-if="loading" class="loading-state" aria-live="polite" aria-busy="true">
        <span class="sr-only">Загружаем магазин</span>
        <div class="skeleton search-skeleton" />
        <div class="skeleton-grid"><div v-for="n in 4" :key="n" class="skeleton" /></div>
      </section>
      <section v-else-if="!ready" class="empty-state">
        <h1>Магазин не загрузился</h1>
        <p v-if="error" role="alert">{{ error }}</p>
        <button class="primary" :disabled="pending" @click="shop.load">Повторить загрузку</button>
      </section>
      <Catalog v-else-if="screen === 'catalog'" />
      <Product v-else-if="screen === 'product'" :id="itemId" />
      <Cart v-else-if="screen === 'cart'" />
      <Checkout v-else-if="screen === 'checkout'" />
      <Orders v-else-if="screen === 'orders'" />
      <OrderReceipt v-else-if="screen === 'order'" :id="itemId" />
      <section v-else class="empty-state">
        <h1>Страница не найдена</h1>
        <a href="#/catalog" class="primary">Вернуться в каталог</a>
      </section>
    </main>
    <BottomNav v-if="!['checkout', 'order'].includes(screen)" :screen="screen" />
    <PickupDialog ref="pickupDialog" />
  </div>
</template>
