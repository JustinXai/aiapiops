import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const EXPECTED_PAGES = [
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

async function checkPublicPages() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:public-pages ---');

  try {
    const files = await getAllFiles(distDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    console.log(`Found ${htmlFiles.length} HTML files`);

    for (const expected of EXPECTED_PAGES) {
      const found = htmlFiles.some(f => f.endsWith(expected));
      if (found) {
        console.log(`  [PASS] ${expected}`);
        passed++;
      } else {
        console.log(`  [FAIL] Missing: ${expected}`);
        failed++;
      }
    }

    const extraPages = htmlFiles.filter(f => {
      return !EXPECTED_PAGES.some(ep => f.endsWith(ep));
    });

    const plannedPageNames = [
      'chatgpt-apps-sdk', 'openai-apps-sdk-mcp-server', 'mcp-security-best-practices',
      'mcp-server-trust', 'openai-api-credits', 'openai-api-usage', 'openai-api-billing',
      'llm-monitoring', 'ai-agent-monitoring', 'claude-code-cost', 'codex-cli-cost'
    ];

    for (const extra of extraPages) {
      const isPlannedPage = plannedPageNames.some(name => extra.includes(name));
      if (isPlannedPage) {
        console.log(`  [FAIL] Public planned page found: ${extra}`);
        failed++;
      } else {
        console.log(`  [WARN] Extra page: ${extra}`);
      }
    }

  } catch (err) {
    console.log(`  [FAIL] Error: ${err.message}`);
    failed++;
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
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

const result = await checkPublicPages();
process.exit(result ? 0 : 1);
