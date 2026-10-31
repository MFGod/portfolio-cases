import '@fontsource/onest/cyrillic-400.css';
import '@fontsource/onest/latin-400.css';
import '@fontsource/onest/cyrillic-500.css';
import '@fontsource/onest/latin-500.css';
import '@fontsource/onest/cyrillic-600.css';
import '@fontsource/onest/latin-600.css';
import { createRoot } from 'react-dom/client';
import { kit } from './runtime';
import { App } from './App';
import './styles.css';

await kit.boot();
createRoot(document.getElementById('app')!).render(<App />);
