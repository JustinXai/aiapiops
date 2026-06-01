import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

async function checkJsonLd() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:jsonld ---');

  const htmlFiles = await getAllFiles(distDir, '');

  for (const file of htmlFiles) {
    if (!file.endsWith('.html')) continue;
    const content = await readFile(join(distDir, file), 'utf-8');

    const jsonLdMatches = content.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];

    let fileFailed = false;

    for (const match of jsonLdMatches) {
      const jsonContent = match.replace(/<script type="application\/ld\+json"[^>]*>/i, '').replace(/<\/script>/i, '');
      try {
        JSON.parse(jsonContent);
      } catch (e) {
        console.log(`  [FAIL] ${file}: Invalid JSON-LD`);
        console.log(`        ${e.message}`);
        failed++;
        fileFailed = true;
      }
    }

    if (!fileFailed && jsonLdMatches.length > 0) {
      console.log(`  [PASS] ${file} (${jsonLdMatches.length} valid JSON-LD block${jsonLdMatches.length > 1 ? 's' : ''})`);
      passed++;
    } else if (jsonLdMatches.length === 0) {
      console.log(`  [INFO] ${file}: No JSON-LD found`);
      passed++;
    }
  }

  console.log(`\nResult: ${passed} files passed, ${failed} JSON-LD errors`);
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

const result = await checkJsonLd();
process.exit(result ? 0 : 1);
