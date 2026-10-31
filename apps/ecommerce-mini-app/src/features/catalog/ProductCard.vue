<script setup lang="ts">
import ProductArt from '../../ProductArt.vue';
import type { Product } from '../../data';
import { money } from '../../shop';
import QuantityControl from '../../ui/QuantityControl.vue';
import { useShopContext } from '../../ui/shop-context';
defineProps<{ product: Product }>();
const { shop } = useShopContext();
</script>

<template>
  <article class="product-card">
    <a
      :href="`#/product/${product.id}`"
      class="product-link"
      :aria-label="`Открыть: ${product.name}`"
    >
      <span class="product-image">
        <span v-if="!shop.stock(product.id)" class="stock-badge">Нет в наличии</span>
        <span v-else-if="shop.stock(product.id) <= 2" class="stock-badge low-stock"
          >Осталось {{ shop.stock(product.id) }}</span
        >
        <ProductArt :product="product" />
      </span>
      <span class="product-copy">
        <strong class="product-price">{{ money(product.price) }}</strong>
        <span class="product-name">{{ product.name }}</span>
        <span class="product-weight">{{ product.weight }}</span>
      </span>
    </a>
    <QuantityControl :id="product.id" :name="product.name" icon-only />
  </article>
</template>
