<script setup lang="ts">
import { computed, ref } from 'vue';
import { money } from '../../shop';
import AppIcon from '../../ui/AppIcon.vue';
import { useShopContext } from '../../ui/shop-context';
const { shop, navigate } = useShopContext();
const { pending, error } = shop;
const dialog = ref<HTMLDialogElement>();
const orderId = ref<number>();
const reviewedCart = ref('');
const cartChanged = computed(() => reviewedCart.value !== shop.checkoutFingerprint.value);
const preview = computed(() => (orderId.value ? shop.previewRepeat(orderId.value) : undefined));
let trigger: HTMLElement | null = null;
async function repeat(replace: boolean) {
  if (orderId.value === undefined) return;
  if (await shop.repeat(orderId.value, replace, reviewedCart.value)) {
    dialog.value?.close();
    navigate('/cart');
  }
}
function open(id: number) {
  orderId.value = id;
  reviewedCart.value = shop.checkoutFingerprint.value;
  shop.dismissError();
  if (!shop.count.value) {
    void repeat(false);
    return;
  }
  trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialog.value?.showModal();
}
function reviewChanges() {
  reviewedCart.value = shop.checkoutFingerprint.value;
  shop.dismissError();
}
function close() {
  if (!pending.value) dialog.value?.close();
}
defineExpose({ open });
</script>

<template>
  <dialog
    ref="dialog"
    class="confirm-dialog"
    aria-labelledby="repeat-title"
    @cancel="pending && $event.preventDefault()"
    @close="trigger?.focus()"
  >
    <header class="dialog-heading">
      <h2 id="repeat-title">Заменить корзину?</h2>
      <button
        class="icon-button"
        :disabled="pending"
        aria-label="Закрыть подтверждение"
        @click="close"
      >
        <AppIcon name="close" :size="20" />
      </button>
    </header>
    <div class="dialog-content">
      <p>
        Сейчас в корзине {{ shop.count.value }} шт. на {{ money(shop.total.value) }}. Эти товары
        будут удалены.
      </p>
      <p v-if="preview">
        Из заказа КР-{{ orderId }} добавим {{ preview.available }} шт. на
        {{ money(preview.total) }}.
      </p>
      <p v-if="preview?.partial" class="help-text">Количество ограничено остатками на складе.</p>
      <p v-if="preview?.missing.length" class="help-text">
        Нет в наличии: {{ preview.missing.join(', ') }}.
      </p>
      <div v-if="cartChanged" class="cart-change" role="alert">
        <p>Текущая корзина изменилась. Проверьте количество и сумму перед заменой.</p>
        <button type="button" class="secondary" :disabled="pending" @click="reviewChanges">
          Изменения проверены
        </button>
      </div>
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    </div>
    <footer class="dialog-actions">
      <button
        class="primary"
        :disabled="pending || !preview?.available || cartChanged"
        @click="repeat(true)"
      >
        {{ pending ? 'Собираем корзину…' : 'Заменить корзину' }}</button
      ><button class="text-button" :disabled="pending" @click="close">
        Оставить текущую корзину
      </button>
    </footer>
  </dialog>
</template>
