import '@fontsource/golos-text/cyrillic-400.css';
import '@fontsource/golos-text/latin-400.css';
import '@fontsource/golos-text/cyrillic-500.css';
import '@fontsource/golos-text/latin-500.css';
import '@fontsource/golos-text/cyrillic-600.css';
import '@fontsource/golos-text/latin-600.css';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { kit } from './kit';
import './styles.css';

await kit.boot();
createRoot(document.getElementById('app')!).render(<App />);
