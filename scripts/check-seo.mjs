import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const TITLE_RECOMMENDED_MIN = 30;
const TITLE_RECOMMENDED_MAX = 60;
const TITLE_HARD_MAX = 65;

async function checkSeo() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:seo ---');

  const htmlFiles = await getAllFiles(distDir, '');

  const titlesByValue = new Map();

  for (const file of htmlFiles) {
    if (!file.endsWith('.html')) continue;
    if (file === '404.html') continue;
    const content = await readFile(join(distDir, file), 'utf-8');

    const issues = [];

    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? '';

    if (!title) {
      issues.push('Missing <title>');
    } else {
      const len = [...title].length;
      if (len > TITLE_HARD_MAX) {
        issues.push(`Title too long (${len} > ${TITLE_HARD_MAX})`);
      } else if (len < TITLE_RECOMMENDED_MIN || len > TITLE_RECOMMENDED_MAX) {
        issues.push(`Title length outside recommended range (${len}, recommended ${TITLE_RECOMMENDED_MIN}-${TITLE_RECOMMENDED_MAX})`);
      }

      const prev = titlesByValue.get(title) || [];
      prev.push(file);
      titlesByValue.set(title, prev);
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

  // Enforce unique, non-empty titles across public pages.
  for (const [title, files] of titlesByValue.entries()) {
    if (files.length <= 1) continue;
    console.log(`  [FAIL] Duplicate <title>: ${JSON.stringify(title)}`);
    files.forEach(f => console.log(`        - ${f}`));
    failed++;
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
