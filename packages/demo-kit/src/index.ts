import { mountDemoBar } from './demo-bar';
import { connectHost } from './host-bridge';
import { createSimulator } from './simulate';
import { createStore } from './storage';

export type { CaseStore } from './storage';

export type CaseDevice = 'phone' | 'desktop';

export type CaseManifest = {
  slug: string;
  device: CaseDevice;
  title: { ru: string; en: string };
  scenarios: { id: string; path: string; title: { ru: string; en: string } }[];
  budgetKb?: number;
};

const EMBED_PARAM = 'embed';
const RESET_PARAM = 'reset';

const isEmbedded = (params: URLSearchParams) =>
  params.get(EMBED_PARAM) === '1' || window.self !== window.top;

export const createCase = (manifest: Pick<CaseManifest, 'slug'>) => {
  const store = createStore(manifest.slug);
  const demo = createSimulator();
  const params = new URLSearchParams(location.search);
  const embedded = isEmbedded(params);

  const reset = async () => {
    await store.clear();
    location.hash = '';
    location.reload();
  };

  const boot = async () => {
    if (params.get(RESET_PARAM) === '1') {
      await store.clear();
      params.delete(RESET_PARAM);
      const query = params.toString();
      history.replaceState(
        null,
        '',
        `${location.pathname}${query ? `?${query}` : ''}${location.hash}`,
      );
    }
    if (embedded) connectHost();
    else mountDemoBar({ reset: () => void reset() });
  };

  return { slug: manifest.slug, store, demo, embedded, boot, reset };
};
