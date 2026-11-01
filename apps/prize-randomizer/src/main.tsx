import '@fontsource/onest/cyrillic-400.css';
import '@fontsource/onest/latin-400.css';
import '@fontsource/onest/cyrillic-600.css';
import '@fontsource/onest/latin-600.css';
import { createRoot } from 'react-dom/client';
import { createCase } from '@cases/demo-kit';
import { App } from './App';
import manifest from '../case.json';
import './styles.css';

const kit = createCase(manifest);

await kit.boot();
createRoot(document.getElementById('app')!).render(<App kit={kit} />);
