<script setup lang="ts">
import type { OrderLine } from '../../data';
import { money } from '../../shop';
defineProps<{ lines: readonly Readonly<OrderLine>[] }>();
</script>

<template>
  <ul class="order-items">
    <li v-for="line in lines" :key="line.productId">
      <span
        >{{ line.name }}<small>{{ line.quantity }} шт., {{ line.weight }}</small></span
      ><span>{{ money(line.price * line.quantity) }}</span>
    </li>
  </ul>
</template>
