import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = resolve(import.meta.dirname, '..');
const appsDir = join(root, 'apps');
const distDir = join(root, 'dist');
const basePath = (process.env.CASES_BASE ?? '').replace(/\/+$/, '');
const DEFAULT_BUDGET_KB = 150;
const only = process.argv.slice(2);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const gzipKb = (files) =>
  files.reduce((sum, file) => sum + gzipSync(readFileSync(file)).length, 0) / 1024;

const apps = readdirSync(appsDir)
  .filter((name) => existsSync(join(appsDir, name, 'case.json')))
  .filter((name) => only.length === 0 || only.includes(name));

mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, '.nojekyll'), '');

const manifests = [];
const overBudget = [];

for (const app of apps) {
  const dir = join(appsDir, app);
  const manifest = JSON.parse(readFileSync(join(dir, 'case.json'), 'utf8'));
  if (manifest.slug !== app)
    throw new Error(`apps/${app}: slug in case.json must equal folder name`);

  console.log(`\n▸ ${app}`);
  execFileSync('npx', ['vite', 'build', '--logLevel', 'warn'], { cwd: dir, stdio: 'inherit' });

  const scripts = walk(join(distDir, app)).filter((file) => file.endsWith('.js'));
  const size = gzipKb(scripts);
  const budget = manifest.budgetKb ?? DEFAULT_BUDGET_KB;
  console.log(`  JS ${size.toFixed(1)} KB gzip / budget ${budget} KB`);
  if (size > budget) overBudget.push(`${app}: ${size.toFixed(1)} KB > ${budget} KB`);

  manifests.push({
    ...manifest,
    url: `${basePath}/${app}/`,
    jsKb: Math.round(size * 10) / 10,
  });
}

const indexFile = join(distDir, 'cases.json');
const previous =
  only.length > 0 && existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, 'utf8')) : [];
const merged = [...previous.filter((entry) => !apps.includes(entry.slug)), ...manifests].sort(
  (a, b) => a.slug.localeCompare(b.slug),
);
writeFileSync(indexFile, `${JSON.stringify(merged, null, 2)}\n`);

const links = merged
  .map((entry) => `<li><a href="${entry.url}">${entry.title.ru}</a></li>`)
  .join('');
writeFileSync(
  join(distDir, 'index.html'),
  `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Кейсы</title><body style="font:16px system-ui;padding:16px"><ul>${links}</ul></body></html>\n`,
);

if (overBudget.length > 0) {
  console.error(`\nJS budget exceeded:\n${overBudget.join('\n')}`);
  process.exit(1);
}
console.log(`\nBuilt ${apps.length} case(s).`);
