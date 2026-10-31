import '@fontsource/montserrat/cyrillic-400.css';
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/cyrillic-500.css';
import '@fontsource/montserrat/latin-500.css';
import '@fontsource/montserrat/cyrillic-600.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/comfortaa/cyrillic-700.css';
import '@fontsource/comfortaa/latin-700.css';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { kit } from './model';
import './styles.css';

await kit.boot();
createRoot(document.getElementById('app')!).render(createElement(App));
