import react from '@vitejs/plugin-react';
import { defineCase } from '@cases/demo-kit/vite';

export default defineCase(import.meta.url, [react()]);
