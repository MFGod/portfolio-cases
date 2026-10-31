<script setup lang="ts">
import type { DrawController } from '../../draw';
import { categories } from '../../tickets';
import { clockTime, ticketNumber } from '../../ui/format';

const props = defineProps<{ draw: DrawController }>();
const { history, pending, loading, operation, failure } = props.draw;
</script>

<template>
  <section class="journal" aria-labelledby="journal-title">
    <div class="journal-head">
      <h2 id="journal-title" class="subtitle">Журнал</h2>
      <button
        type="button"
        class="secondary"
        :disabled="pending || history.length === 0"
        @click="props.draw.downloadCsv"
      >
        {{ operation === 'export' ? 'Готовим файл…' : 'Скачать CSV' }}
      </button>
    </div>

    <div v-if="loading" class="journal-skeleton" role="status" aria-label="Загружаем историю">
      <span v-for="n in 2" :key="n" class="skeleton" />
    </div>
    <p v-else-if="history.length === 0 && failure !== 'corrupt'" class="muted">
      Розыгрышей ещё не было
    </p>
    <table
      v-else-if="history.length"
      class="journal-table"
      role="table"
      aria-labelledby="journal-title"
    >
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col" role="columnheader">Билет</th>
          <th scope="col" role="columnheader">Участник</th>
          <th scope="col" role="columnheader">Категория</th>
          <th scope="col" role="columnheader">Время</th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        <tr
          v-for="(pick, index) in history"
          :key="pick.number"
          class="record"
          role="row"
          :class="{ 'is-latest': index === 0 }"
        >
          <td role="cell" class="record-number">{{ ticketNumber(pick.number) }}</td>
          <td role="cell" class="record-name">{{ pick.name }}</td>
          <td role="cell" class="record-category muted">{{ categories[pick.category].title }}</td>
          <td role="cell" class="record-time">
            <time :datetime="pick.at">
              {{ clockTime(pick.at) }}
            </time>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
