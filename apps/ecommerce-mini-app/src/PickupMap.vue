<script setup lang="ts">
import { computed, ref } from 'vue';
import mapImage from './assets/pickup-map.webp';
import { pickupPoints } from './data';
const props = defineProps<{
  modelValue: string;
  disabled: boolean;
}>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
const zoom = ref(1);
const place = (x: number, y: number) => ({
  left: `${(x / 350) * 100}%`,
  top: `${(y / 300) * 100}%`,
});
const origin = computed(() => {
  const point = pickupPoints.find((item) => item.id === props.modelValue);
  if (!point) return '50% 50%';
  const { left, top } = place(point.x, point.y);
  return `${left} ${top}`;
});
</script>

<template>
  <div class="map-wrap">
    <div class="map-frame" role="group" aria-label="Карта пунктов выдачи">
      <div
        class="map-canvas"
        :style="{ transform: `scale(${zoom})`, transformOrigin: origin, '--zoom': zoom }"
      >
        <img class="map-image" :src="mapImage" alt="" width="1050" height="900" />
        <button
          v-for="(point, index) in pickupPoints"
          :key="point.id"
          type="button"
          class="map-pin"
          :class="{ selected: modelValue === point.id }"
          :style="place(point.x, point.y)"
          :aria-label="`${point.name}, ${point.address}`"
          :aria-pressed="modelValue === point.id"
          :disabled="disabled"
          @click="emit('update:modelValue', point.id)"
        >
          {{ index + 1 }}
        </button>
      </div>
    </div>
    <div class="map-tools">
      <button
        type="button"
        aria-label="Уменьшить карту"
        :disabled="disabled || zoom <= 1"
        @click="zoom = Math.max(1, zoom - 0.25)"
      >
        −
      </button>
      <button
        type="button"
        aria-label="Увеличить карту"
        :disabled="disabled || zoom >= 1.5"
        @click="zoom = Math.min(1.5, zoom + 0.25)"
      >
        +
      </button>
    </div>
  </div>
  <fieldset class="pickup-list" :disabled="disabled">
    <legend class="sr-only">Пункт выдачи</legend>
    <label
      v-for="(point, index) in pickupPoints"
      :key="point.id"
      class="pickup-option"
      :class="{ selected: modelValue === point.id }"
    >
      <input
        type="radio"
        name="pickup"
        :value="point.id"
        :checked="modelValue === point.id"
        @change="emit('update:modelValue', point.id)"
      />
      <span>
        <strong>{{ index + 1 }}. {{ point.name }}</strong>
        <span>{{ point.address }}, {{ point.hours }}</span>
        <small>{{ point.walk }}</small>
      </span>
    </label>
  </fieldset>
</template>
