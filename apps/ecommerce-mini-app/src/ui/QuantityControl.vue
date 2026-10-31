<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { useShopContext } from './shop-context';
const props = defineProps<{ id: string; name: string; small?: boolean; iconOnly?: boolean }>();
const { shop } = useShopContext();
const { pending } = shop;
</script>

<template>
  <div v-if="shop.quantity(id)" class="stepper" :class="{ small }">
    <button
      type="button"
      :disabled="pending"
      :aria-label="`Уменьшить количество: ${name}`"
      @click="shop.change(props.id, -1)"
    >
      <AppIcon name="minus" :size="18" />
    </button>
    <span :aria-label="`${shop.quantity(id)} в корзине`">{{ shop.quantity(id) }}</span>
    <button
      type="button"
      :disabled="pending || shop.quantity(id) >= shop.stock(id)"
      :aria-label="`Добавить: ${name}`"
      @click="shop.change(props.id, 1)"
    >
      <AppIcon name="plus" :size="18" />
    </button>
  </div>
  <button
    v-else
    type="button"
    class="add-button"
    :disabled="pending || !shop.stock(id)"
    :aria-label="shop.stock(id) ? `В корзину: ${name}` : `Нет в наличии: ${name}`"
    @click="shop.change(props.id, 1)"
  >
    <AppIcon v-if="shop.stock(id)" name="plus" :size="20" />
    <span v-if="!shop.stock(id)">Нет в наличии</span>
    <span v-else-if="!iconOnly">В корзину</span>
  </button>
</template>
