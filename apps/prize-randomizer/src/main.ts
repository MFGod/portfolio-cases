import '@fontsource/onest/cyrillic-400.css';
import '@fontsource/onest/latin-400.css';
import '@fontsource/onest/cyrillic-600.css';
import '@fontsource/onest/latin-600.css';
import { createApp } from 'vue';

import { createCase } from '@cases/demo-kit';

import App from './App.vue';
import manifest from '../case.json';
import './styles.css';

const kit = createCase(manifest);

await kit.boot();
createApp(App, { kit }).mount('#app');
