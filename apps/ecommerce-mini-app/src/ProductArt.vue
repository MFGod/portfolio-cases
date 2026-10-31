<script setup lang="ts">
import type { Product } from './data';
defineProps<{
  product: Product;
}>();
const photos = import.meta.glob<string>('./assets/products/*.webp', {
  eager: true,
  import: 'default',
});
</script>

<template>
  <img
    class="product-art"
    :src="photos[`./assets/products/${product.id}.webp`]"
    :alt="product.name"
    draggable="false"
  />
</template>
