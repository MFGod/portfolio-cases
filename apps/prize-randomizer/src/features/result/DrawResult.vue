<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import type { DrawController } from '../../draw';
import { ticketNumber } from '../../ui/format';
import RollingDigit from '../../ui/RollingDigit.vue';

const props = defineProps<{ draw: DrawController }>();
const { current, pending, loading, operation, error, failure, notice, available } = props.draw;

const blocked = computed(() => failure.value === 'corrupt' || failure.value === 'locks');
const primary = ref<HTMLButtonElement | null>(null);
const undo = async () => {
  await props.draw.undoLast();
  await nextTick();
  if (!current.value) primary.value?.focus();
};

const digits = computed(() =>
  (current.value ? ticketNumber(current.value.number) : ticketNumber(0).replace(/0/g, ' ')).split(
    '',
  ),
);
const spinning = computed(() => loading.value || operation.value === 'draw');

const settledFlaps = ref(0);
const revealed = computed(() => settledFlaps.value >= digits.value.length);
watch(
  () => [digits.value.join(''), spinning.value],
  () => (settledFlaps.value = 0),
);

const drawLabel = computed(() => {
  if (operation.value === 'draw') return 'Выбираем…';
  if (!loading.value && available.value === 0) return 'Билеты закончились';
  return 'Выбрать билет';
});
</script>

<template>
  <section class="result" :class="{ 'is-pending': pending }" aria-labelledby="result-title">
    <h2 id="result-title" class="visually-hidden">Последний результат</h2>

    <div class="result-body" aria-live="polite">
      <p class="result-number">
        <RollingDigit
          v-for="(char, index) in digits"
          :key="index"
          :char="char"
          :spinning="spinning"
          :settle-steps="4 + index * 5"
          @settled="settledFlaps += 1"
        />
        <span v-if="current && revealed" class="visually-hidden">
          Билет {{ ticketNumber(current.number) }}
        </span>
      </p>
      <div v-if="current && revealed" class="result-person">
        <p class="result-name">{{ current.name }}</p>
        <p class="result-phone muted">{{ current.phone }}</p>
      </div>
      <p v-else-if="!current && !spinning" class="result-empty muted">Билет ещё не выбран</p>
    </div>

    <div class="result-actions">
      <button
        type="button"
        ref="primary"
        class="primary"
        :disabled="pending || available === 0 || blocked"
        @click="props.draw.draw"
      >
        {{ drawLabel }}
      </button>
      <button v-if="current" type="button" class="secondary" :disabled="pending" @click="undo">
        {{ operation === 'undo' ? 'Отменяем…' : 'Отменить выбор' }}
      </button>
    </div>

    <p v-if="error" class="error" role="alert">
      {{ error }}
      <button
        v-if="failure === 'corrupt'"
        type="button"
        class="link"
        :disabled="pending"
        @click="props.draw.recover"
      >
        Очистить историю
      </button>
      <button
        v-else-if="failure !== 'locks'"
        type="button"
        class="link"
        :disabled="pending"
        @click="props.draw.retry"
      >
        Повторить
      </button>
    </p>
    <p class="visually-hidden" role="status">{{ error ? '' : notice }}</p>
  </section>
</template>
