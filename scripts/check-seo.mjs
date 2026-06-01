import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const SEO_REQUIRED_FIELDS = ['title', 'meta description', 'canonical', 'og:title', 'og:description'];

async function checkSeo() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:seo ---');

  const htmlFiles = await getAllFiles(distDir, '');

  for (const file of htmlFiles) {
    if (!file.endsWith('.html')) continue;
    const content = await readFile(join(distDir, file), 'utf-8');

    const issues = [];

    if (!/<title>[^<]+<\/title>/i.test(content)) {
      issues.push('Missing <title>');
    }
    if (!/<meta name="description"/i.test(content)) {
      issues.push('Missing meta description');
    }
    if (!/<link rel="canonical"/i.test(content)) {
      issues.push('Missing canonical link');
    }
    if (!/<meta property="og:title"/i.test(content)) {
      issues.push('Missing og:title');
    }
    if (!/<meta property="og:description"/i.test(content)) {
      issues.push('Missing og:description');
    }
    if (!/<h1/i.test(content)) {
      issues.push('Missing H1');
    }

    const h1Matches = content.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    if (h1Matches.length === 0) {
      issues.push('No H1 element');
    }
    if (h1Matches.length > 1) {
      issues.push(`Multiple H1s (${h1Matches.length})`);
    }

    if (issues.length === 0) {
      passed++;
    } else {
      console.log(`  [FAIL] ${file}`);
      issues.forEach(issue => console.log(`        - ${issue}`));
      failed++;
    }
  }

  console.log(`\nResult: ${passed} files passed, ${failed} files with SEO issues`);
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

const result = await checkSeo();
process.exit(result ? 0 : 1);
