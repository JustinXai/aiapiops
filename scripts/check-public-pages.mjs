import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const BASE_URL = process.env.SITE_URL || 'https://aiapiops.pages.dev';

const EXPECTED_HTML_PAGES = [
  'index.html',
  'mcp-server-chatgpt/index.html',
  'mcp-registry/index.html',
  'llm-observability/index.html',
];

const FORBIDDEN_PATTERNS = [
  { pattern: /\{\{.*?\}\}/g, label: 'Template placeholder {{...}}' },
  { pattern: /lorem\s+ipsum/gi, label: 'Lorem ipsum' },
  { pattern: /placeholder/gi, label: 'Placeholder text' },
];

const PLANNED_PATHS = [
  'chatgpt-apps-sdk',
  'openai-apps-sdk-mcp-server',
  'mcp-security-best-practices',
  'mcp-server-trust',
  'openai-api-credits',
  'openai-api-usage',
  'openai-api-billing',
  'llm-monitoring',
  'ai-agent-monitoring',
  'claude-code-cost',
  'codex-cli-cost',
];

async function checkDistFiles() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:public-pages (dist) ---');

  try {
    const files = await getAllFiles(distDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    console.log(`Found ${htmlFiles.length} HTML files in dist`);

    for (const expected of EXPECTED_HTML_PAGES) {
      const found = htmlFiles.some(f => f.endsWith(expected));
      if (found) {
        console.log(`  [PASS] ${expected}`);
        passed++;
      } else {
        console.log(`  [FAIL] Missing: ${expected}`);
        failed++;
      }
    }

    // Check 404.html exists
    const has404 = htmlFiles.includes('404.html');
    if (has404) {
      console.log(`  [PASS] 404.html exists`);
      passed++;
    } else {
      console.log(`  [FAIL] 404.html missing from dist`);
      failed++;
    }

    // Validate 404.html content
    if (has404) {
      const content = await readFile(join(distDir, '404.html'), 'utf-8');
      const checks = [
        { test: content.includes('Page not found | AI API Ops'), label: '404.html has correct title' },
        { test: content.includes('Page not found'), label: '404.html has H1 text' },
        { test: content.includes('This guide is not published yet'), label: '404.html has correct copy' },
        { test: content.includes('/mcp-server-chatgpt/'), label: '404.html links to /mcp-server-chatgpt/' },
        { test: content.includes('/mcp-registry/'), label: '404.html links to /mcp-registry/' },
        { test: content.includes('/llm-observability/'), label: '404.html links to /llm-observability/' },
        { test: content.includes('noindex'), label: '404.html has noindex meta' },
      ];
      for (const check of checks) {
        if (check.test) {
          console.log(`  [PASS] ${check.label}`);
          passed++;
        } else {
          console.log(`  [FAIL] ${check.label}`);
          failed++;
        }
      }
    }

    // Check no planned pages leaked into dist
    const plannedPageNames = PLANNED_PATHS;
    for (const extra of htmlFiles) {
      const isPlannedPage = plannedPageNames.some(name => extra.includes(name));
      if (isPlannedPage) {
        console.log(`  [FAIL] Public planned page found: ${extra}`);
        failed++;
      }
    }

    // Pattern checks on all HTML files
    for (const file of htmlFiles) {
      const content = await readFile(join(distDir, file), 'utf-8');
      for (const { pattern, label } of FORBIDDEN_PATTERNS) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          console.log(`  [FAIL] ${file}: ${label} found (${matches.length} occurrence(s))`);
          failed++;
        }
      }
    }

  } catch (err) {
    console.log(`  [FAIL] Error: ${err.message}`);
    failed++;
  }

  console.log(`\nDist check: ${passed} passed, ${failed} failed`);

  return { passed, failed };
}

async function checkLivePlannedUrls() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:public-pages (live planned URLs) ---');
  console.log(`Base URL: ${BASE_URL}`);

  for (const path of PLANNED_PATHS) {
    const url = `${BASE_URL}/${path}/`;
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual',
      });
      if (res.status === 404) {
        console.log(`  [PASS] ${url} → 404`);
        passed++;
      } else {
        console.log(`  [FAIL] ${url} → ${res.status} (expected 404)`);
        failed++;
      }
    } catch (err) {
      console.log(`  [FAIL] ${url} → ${err.message}`);
      failed++;
    }
  }

  console.log(`\nLive planned URL check: ${passed} passed, ${failed} failed`);
  return { passed, failed };
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

const distResult = await checkDistFiles();
const liveResult = await checkLivePlannedUrls();

const totalPassed = distResult.passed + liveResult.passed;
const totalFailed = distResult.failed + liveResult.failed;

console.log(`\n=== TOTAL: ${totalPassed} passed, ${totalFailed} failed ===`);
process.exit(totalFailed === 0 ? 0 : 1);
