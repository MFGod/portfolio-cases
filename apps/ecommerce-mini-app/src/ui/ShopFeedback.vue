<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { useShopContext } from './shop-context';
defineProps<{ canRetry: boolean }>();
const emit = defineEmits<{ retry: [] }>();
const { shop } = useShopContext();
const { error, notice, pending, loading } = shop;
</script>

<template>
  <div class="feedback" aria-live="polite" aria-atomic="true">
    <div v-if="error" class="message error" role="alert">
      <span>{{ error }}</span>
      <button v-if="canRetry" :disabled="pending || loading" @click="emit('retry')">
        Повторить
      </button>
    </div>
    <div v-else-if="notice" class="message success">
      <AppIcon name="check" :size="16" /><span>{{ notice }}</span>
      <button aria-label="Скрыть сообщение" @click="notice = ''">
        <AppIcon name="close" :size="16" />
      </button>
    </div>
  </div>
</template>
