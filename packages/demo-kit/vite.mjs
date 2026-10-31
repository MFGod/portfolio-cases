import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

export const defineCase = (configUrl, plugins) => {
  const root = dirname(fileURLToPath(configUrl));
  const manifest = JSON.parse(readFileSync(resolve(root, 'case.json'), 'utf8'));
  const basePath = (process.env.CASES_BASE ?? '').replace(/\/+$/, '');

  return defineConfig({
    root,
    base: `${basePath}/${manifest.slug}/`,
    plugins,
    build: {
      outDir: resolve(root, '../../dist', manifest.slug),
      emptyOutDir: true,
      target: 'es2022',
      assetsInlineLimit: 0,
    },
  });
};
