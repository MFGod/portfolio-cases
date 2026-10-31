import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const denylistFile = process.env.NDA_DENYLIST ?? resolve(root, '../.portfolio-cases-nda.txt');

const denylistText =
  process.env.NDA_DENYLIST_TEXT ??
  (existsSync(denylistFile) ? readFileSync(denylistFile, 'utf8') : null);
if (denylistText === null) {
  console.error(`NDA denylist not found: set NDA_DENYLIST_TEXT or create ${denylistFile}`);
  process.exit(1);
}

const terms = denylistText
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));
const customer = new RegExp(`(?<!\\p{L})(?:${terms.join('|')})(?!\\p{L})`, 'giu');

const allowedUrlHosts = new Set([
  'www.w3.org',
  'react.dev',
  'reactjs.org',
  'vuejs.org',
  'openapi.vercel.sh',
  'maxim-zhikharev.vercel.app',
]);
const allowedEmails = new Set();

const rules = {
  url: /https?:\/\/[^\s"'<>`\\)\]}]+/g,
  email: /[\w.+-]+@[\w-]+\.[\w.-]*[a-z]{2,}/gi,
  phone: /(?:\+7|\b8)[ (-]*\d{3}[ )-]*\d{3}[ -]*\d{2}[ -]*\d{2}\b/g,
  env: /(?:VITE_|NEXT_PUBLIC_|REACT_APP_)[A-Z0-9_]+\s*[:=]\s*["'][^"']+["']/g,
};

const skip = new Set(['node_modules', '.git']);
const textFile = /\.(tsx?|jsx?|vue|mjs|cjs|json|html|css|svg|txt|md|webmanifest)$/;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (skip.has(name)) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const isAllowed = (kind, value) => {
  if (kind === 'url') {
    const hostname = value.replace(/^https?:\/\//, '').split(/[/:?#]/)[0] ?? '';
    return allowedUrlHosts.has(hostname) || hostname === 'localhost' || hostname === '127.0.0.1';
  }
  if (kind === 'email') return allowedEmails.has(value.toLowerCase());
  return false;
};

const findings = [];
let scanned = 0;

for (const file of walk(root)) {
  const rel = relative(root, file);
  if (basename(file).startsWith('.env')) findings.push(`${rel}: environment file`);
  if (!textFile.test(file) || rel === 'package-lock.json') continue;
  scanned += 1;

  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const _ of line.matchAll(customer)) findings.push(`${rel}:${index + 1}: denylisted term`);
    for (const [kind, pattern] of Object.entries(rules)) {
      for (const [value] of line.matchAll(pattern)) {
        if (!isAllowed(kind, value))
          findings.push(`${rel}:${index + 1}: ${kind} ${value.slice(0, 80)}`);
      }
    }
  });
}

if (findings.length > 0) {
  console.error(
    `NDA scan: ${findings.length} finding(s) in ${scanned} files\n${findings.join('\n')}`,
  );
  process.exit(1);
}
console.log(`NDA scan: clean, ${scanned} files, ${terms.length} denylisted terms`);
