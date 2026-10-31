<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{ char: string; spinning: boolean; settleSteps: number }>();
const emit = defineEmits<{ settled: [] }>();

const drum = ' 0123456789';
const after = (char: string) => drum[(drum.indexOf(char) + 1) % drum.length]!;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const stepMs = () =>
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--digit-step'));

const shown = ref(' ');
const previous = ref(' ');
const flips = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

const flipTo = (char: string) => {
  previous.value = shown.value;
  shown.value = char;
  flips.value += 1;
};

const run = () => {
  clearInterval(timer);
  if (reducedMotion.matches) {
    previous.value = shown.value = props.char;
    if (!props.spinning) emit('settled');
    return;
  }
  let steps = 0;
  timer = setInterval(() => {
    if (!props.spinning && steps >= props.settleSteps && shown.value === props.char) {
      clearInterval(timer);
      emit('settled');
      return;
    }
    flipTo(after(shown.value));
    steps += 1;
  }, stepMs());
};

watch(() => [props.char, props.spinning], run, { immediate: true });
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <span class="digit" aria-hidden="true">
    <span v-if="flips" :key="`out-${flips}`" class="digit-card digit-out">{{ previous }}</span>
    <span :key="`in-${flips}`" class="digit-card" :class="{ 'digit-in': flips }">{{ shown }}</span>
  </span>
</template>
