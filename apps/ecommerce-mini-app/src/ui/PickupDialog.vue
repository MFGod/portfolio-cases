<script setup lang="ts">
import { ref } from 'vue';
import PickupMap from '../PickupMap.vue';
import AppIcon from './AppIcon.vue';
import { useShopContext } from './shop-context';
const { shop } = useShopContext();
const { pending, error } = shop;
const dialog = ref<HTMLDialogElement>();
const selected = ref('');
let trigger: HTMLElement | null = null;
function open() {
  selected.value = shop.state.pickup;
  shop.dismissError();
  trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialog.value?.showModal();
}
function close() {
  if (!pending.value) dialog.value?.close();
}
async function confirm() {
  if (await shop.updateDetails({ pickup: selected.value })) dialog.value?.close();
}
function restoreFocus() {
  trigger?.focus();
}
defineExpose({ open });
</script>

<template>
  <dialog
    ref="dialog"
    class="pickup-dialog"
    aria-labelledby="pickup-title"
    @cancel="pending && $event.preventDefault()"
    @close="restoreFocus"
  >
    <header class="dialog-heading">
      <h2 id="pickup-title">Пункт выдачи</h2>
      <button
        class="icon-button"
        aria-label="Закрыть выбор пункта"
        :disabled="pending"
        @click="close"
      >
        <AppIcon name="close" :size="20" />
      </button>
    </header>
    <div class="dialog-content">
      <PickupMap v-model="selected" :disabled="pending" />
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    </div>
    <footer class="dialog-actions">
      <button class="primary" :disabled="pending || !selected" @click="confirm">
        {{ pending ? 'Сохраняем…' : 'Выбрать этот пункт' }}
      </button>
      <button class="text-button" :disabled="pending" @click="close">Отмена</button>
    </footer>
  </dialog>
</template>
