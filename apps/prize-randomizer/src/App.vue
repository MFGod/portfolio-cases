<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

import type { createCase } from '@cases/demo-kit';

import { useDraw } from './draw';
import { remainingCount } from './domain/history';
import DrawJournal from './features/journal/DrawJournal.vue';
import DrawResult from './features/result/DrawResult.vue';
import { categories, CategoryKey, isCategory } from './tickets';

const props = defineProps<{ kit: ReturnType<typeof createCase> }>();

const categoryFromHash = (): CategoryKey => {
  const value = location.hash.replace(/^#\/?/, '');
  return isCategory(value) ? value : CategoryKey.All;
};

const category = ref<CategoryKey>(categoryFromHash());
const syncCategory = () => (category.value = categoryFromHash());
window.addEventListener('hashchange', syncCategory);
onBeforeUnmount(() => window.removeEventListener('hashchange', syncCategory));

const draw = useDraw(props.kit, category);
const { history, loading, failure } = draw;

const tabs = computed(() =>
  (Object.keys(categories) as CategoryKey[]).map((key) => ({
    key,
    title: categories[key].title,
    remaining: remainingCount(history.value, key).toLocaleString('ru-RU'),
  })),
);
const countsKnown = computed(() => !loading.value && failure.value !== 'corrupt');
</script>

<template>
  <main class="page">
    <h1 class="visually-hidden">Розыгрыш призов</h1>

    <nav class="tabs" aria-label="Категории">
      <a
        v-for="tab in tabs"
        :key="tab.key"
        :href="`#/${tab.key}`"
        class="tab"
        :aria-current="category === tab.key ? 'page' : undefined"
      >
        {{ tab.title }}
        <span v-if="countsKnown" class="tab-count">{{ tab.remaining }}</span>
      </a>
    </nav>

    <DrawResult :draw="draw" />

    <DrawJournal :draw="draw" />
  </main>
</template>
