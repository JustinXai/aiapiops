import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const INTERNAL_LINKS = [
  '/mcp-server-chatgpt/',
  '/mcp-registry/',
  '/llm-observability/',
  '/openclaw-openrouter/',
  '/claude-code-token-cost/',
  '/video-generation-api-pricing/',
];

const EXACT_CTA_URLS = [
  'https://app.rutaapi.com/register?lng=en',
  'https://app.rutaapi.com/pricing',
];

async function checkLinks() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:links ---');

  const htmlFiles = await getAllFiles(distDir, '');

  for (const file of htmlFiles) {
    if (!file.endsWith('.html')) continue;
    const content = await readFile(join(distDir, file), 'utf-8');

    const linkMatches = content.match(/href="([^"]+)"/g) || [];

    for (const match of linkMatches) {
      const url = match.match(/href="([^"]+)"/)[1];

      if (url.startsWith('https://app.rutaapi.com')) {
        const exactMatch = EXACT_CTA_URLS.includes(url);
        if (!exactMatch) {
          console.log(`  [FAIL] ${file}: RutaAPI URL not exact: ${url}`);
          failed++;
        }
      }
    }
  }

  if (failed === 0) {
    console.log('  All CTA URLs exact.');
    console.log(`\nResult: PASS`);
    return true;
  }

  console.log(`\nResult: ${failed} link issues found`);
  return false;
}

async function getAllFiles(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath, relPath));
    } else {
      files.push(relPath);
    }
  }
  return files;
}

const result = await checkLinks();
process.exit(result ? 0 : 1);
