import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const distDir = join(root, 'dist');
const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const port = Number(option('--port') ?? process.env.PORT ?? 4400);
const host = option('--host') ?? '127.0.0.1';
const basePath = (process.env.CASES_BASE ?? '').replace(/\/+$/, '');

const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const headers = Object.fromEntries(config.headers[0].headers.map(({ key, value }) => [key, value]));

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const resolveFile = (pathname) => {
  const file = normalize(join(distDir, decodeURIComponent(pathname)));
  if (!file.startsWith(distDir)) return null;
  if (existsSync(file) && statSync(file).isDirectory()) return join(file, 'index.html');
  return file;
};

createServer((request, response) => {
  let { pathname } = new URL(request.url ?? '/', 'http://localhost');
  if (basePath) {
    if (pathname === basePath) {
      response.writeHead(308, { Location: `${basePath}/` }).end();
      return;
    }
    if (!pathname.startsWith(`${basePath}/`)) {
      response.writeHead(404, headers).end('Not found');
      return;
    }
    pathname = pathname.slice(basePath.length);
  }
  if (/^\/[\w-]+$/.test(pathname) && existsSync(join(distDir, pathname))) {
    response.writeHead(308, { Location: `${basePath}${pathname}/` }).end();
    return;
  }
  const file = resolveFile(pathname);
  if (!file || !existsSync(file)) {
    response.writeHead(404, headers).end('Not found');
    return;
  }
  response.writeHead(200, {
    ...headers,
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(port, host, () => console.log(`Cases: http://${host}:${port}${basePath}/`));
