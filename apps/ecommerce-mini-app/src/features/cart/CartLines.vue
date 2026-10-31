<script setup lang="ts">
import ProductArt from '../../ProductArt.vue';
import { money } from '../../shop';
import QuantityControl from '../../ui/QuantityControl.vue';
import { useShopContext } from '../../ui/shop-context';
const { shop } = useShopContext();
const { lines } = shop;
</script>

<template>
  <section class="cart-lines" aria-label="Товары в корзине">
    <article v-for="line in lines" :key="line.productId" class="cart-line">
      <a
        :href="`#/product/${line.productId}`"
        class="cart-art"
        :aria-label="`Открыть: ${line.product.name}`"
        ><ProductArt :product="line.product"
      /></a>
      <div class="cart-line-content">
        <a :href="`#/product/${line.productId}`">{{ line.product.name }}</a>
        <small>{{ line.product.weight }}, {{ line.product.brand }}</small>
        <div class="cart-bottom">
          <strong>{{ money(line.product.price * line.quantity) }}</strong
          ><QuantityControl :id="line.productId" :name="line.product.name" small />
        </div>
        <small v-if="line.quantity > shop.stock(line.productId)" class="field-error"
          >Доступно {{ shop.stock(line.productId) }} шт. Уменьшите количество.</small
        >
      </div>
    </article>
  </section>
</template>
