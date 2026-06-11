import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

async function checkDuplicateNumbering() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:duplicate-numbering ---');

  const htmlFiles = await getAllFiles(distDir, '');

  // Match patterns like "1. 1", "2. 2", "3. 3" in visible text.
  // Word-boundary \b prevents matching version numbers like "version 1".
  // Uses a backreference \1 to detect the same digit appearing after ". " and space.
  // The lookahead (?![^<]*>) ensures we only match text content, not HTML tags.
  const dupPattern = /\b(\d+)\.\s+\1\b(?![^<]*>)/g;

  for (const file of htmlFiles) {
    if (!file.endsWith('.html')) continue;
    const content = await readFile(join(distDir, file), 'utf-8');

    const matches = [...content.matchAll(dupPattern)];
    if (matches.length === 0) {
      passed++;
    } else {
      console.log(`  [FAIL] ${file}: duplicate numbering found`);
      for (const m of matches) {
        console.log(`        - "${m[0]}" at position ${m.index}`);
      }
      failed++;
    }
  }

  console.log(`\nResult: ${passed} files passed, ${failed} files with duplicate numbering`);
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

const result = await checkDuplicateNumbering();
process.exit(result ? 0 : 1);
