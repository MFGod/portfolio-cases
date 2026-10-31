import '@fontsource/source-sans-3/cyrillic-400.css';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/cyrillic-600.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/pt-serif/cyrillic-400.css';
import '@fontsource/pt-serif/latin-400.css';
import '@fontsource/ibm-plex-mono/cyrillic-500.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import { createRoot } from 'react-dom/client';
import { createCase } from '@cases/demo-kit';
import manifest from '../case.json';
import './styles.css';

if (new URLSearchParams(location.search).get('play') === '1' && window.parent !== window) {
  document.body.classList.add('game-document');
  const { Game } = await import('./Game');
  createRoot(document.getElementById('app')!).render(<Game />);
} else {
  const kit = createCase(manifest);
  await kit.boot();
  const { App } = await import('./App');
  createRoot(document.getElementById('app')!).render(<App kit={kit} />);
}
