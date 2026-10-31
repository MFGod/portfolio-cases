<script setup lang="ts">
import { computed } from 'vue';
import ProductArt from '../../ProductArt.vue';
import { products } from '../../data';
import { money } from '../../shop';
import AppIcon from '../../ui/AppIcon.vue';
import QuantityControl from '../../ui/QuantityControl.vue';
import { useShopContext } from '../../ui/shop-context';
const props = defineProps<{ id: string }>();
const { shop } = useShopContext();
const product = computed(() => products.find((item) => item.id === props.id));
</script>

<template>
  <a href="#/catalog" class="back-link"><AppIcon name="back" :size="16" />Каталог</a>
  <template v-if="product">
    <div class="product-detail-art"><ProductArt :product="product" /></div>
    <div class="detail-heading">
      <h1>{{ product.name }}</h1>
      <p>{{ product.weight }}, {{ product.brand }}.</p>
      <p :class="{ 'field-error': !shop.stock(product.id) }">
        {{ shop.stock(product.id) ? `В наличии ${shop.stock(product.id)} шт.` : 'Нет в наличии' }}
      </p>
    </div>
    <p class="detail-description">{{ product.description }}</p>
    <div class="purchase-bar">
      <strong>{{ money(product.price) }}</strong
      ><QuantityControl :id="product.id" :name="product.name" />
    </div>
    <a v-if="shop.quantity(product.id)" href="#/cart" class="text-button cart-link"
      >Перейти в корзину<AppIcon name="forward" :size="16"
    /></a>
  </template>
  <section v-else class="empty-state">
    <h1>Товар не найден</h1>
    <a href="#/catalog" class="primary">Открыть каталог</a>
  </section>
</template>
