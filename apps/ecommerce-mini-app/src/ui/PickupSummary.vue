<script setup lang="ts">
import { computed } from 'vue';
import { pickupPoints } from '../data';
import AppIcon from './AppIcon.vue';
import { useShopContext } from './shop-context';
const { shop, openPickup } = useShopContext();
const point = computed(() => pickupPoints.find((item) => item.id === shop.state.pickup));
</script>

<template>
  <button class="pickup-summary" type="button" :disabled="shop.pending.value" @click="openPickup">
    <span class="pickup-summary-icon"><AppIcon name="pin" :size="20" /></span>
    <span>
      <strong>{{ point?.name ?? 'Выберите пункт выдачи' }}</strong>
      <span>{{ point?.address }}</span>
      <small>{{ point?.hours }}</small>
    </span>
    <AppIcon name="forward" :size="18" />
  </button>
</template>
