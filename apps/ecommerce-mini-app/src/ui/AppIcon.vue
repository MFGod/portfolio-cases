<script setup lang="ts">
const props = withDefaults(defineProps<{ name: keyof typeof paths; size?: number }>(), {
  size: 18,
});
</script>

<script lang="ts">
const paths = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  filter: 'M4 7h16M4 17h16M9 4v6M15 14v6',
  send: 'M4 12 20 4l-4 16-4-7-8-1Z',
  check: 'm5 12 4 4 10-10',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  chevron: 'm7 10 5 5 5-5',
  back: 'M19 12H5m6-6-6 6 6 6',
  forward: 'M5 12h14m-6-6 6 6-6 6',
  close: 'M6 6l12 12M18 6 6 18',
};
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[props.name]" />
  </svg>
</template>
