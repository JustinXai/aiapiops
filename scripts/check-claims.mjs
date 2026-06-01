import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const BANNED_CLAIMS = [
  'cheapest',
  'lowest price',
  'guaranteed compatible',
  'official partner',
  'always works',
  'all models available',
  'unlimited',
  'free forever',
  'no billing risk',
  'mcp is always safe',
  'tool calls are always cheap',
  'rutaapi prevents all cost surprises',
];

async function checkClaims() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:claims ---');

  const htmlFiles = await getAllFiles(distDir, '');

  for (const file of htmlFiles) {
    if (!file.endsWith('.html')) continue;
    const content = await readFile(join(distDir, file), 'utf-8');
    const lower = content.toLowerCase();

    const issues = [];
    for (const claim of BANNED_CLAIMS) {
      if (lower.includes(claim)) {
        issues.push(claim);
      }
    }

    if (issues.length === 0) {
      passed++;
    } else {
      console.log(`  [FAIL] ${file}: ${issues.join(', ')}`);
      failed++;
    }
  }

  console.log(`\nResult: ${passed} files passed, ${failed} files with banned claims`);
  return failed === 0;
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

const result = await checkClaims();
process.exit(result ? 0 : 1);
