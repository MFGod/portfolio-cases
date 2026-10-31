import vue from '@vitejs/plugin-vue';

import { defineCase } from '@cases/demo-kit/vite';

export default defineCase(import.meta.url, [vue()]);
