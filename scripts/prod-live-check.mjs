import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Use BASE env var if set, otherwise default to https://aiapiops.com
const BASE = process.env.BASE || 'https://aiapiops.com';
const BUST = Date.now();

const PUBLIC_PAGES = [
  '/',
  '/mcp-server-chatgpt/',
  '/mcp-registry/',
  '/llm-observability/',
  '/openclaw-openrouter/',
  '/openclaw-api-key/',
  '/claude-code-token-cost/',
  '/video-generation-api-pricing/',
  '/image-generation-api-pricing/',
];

const STATIC_FILES = [
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
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
  'openclaw-security',
  'openclaw-whatsapp-telegram',
  'claude-code-openrouter',
  'kilo-code-openrouter',
  'kilo-code-vs-cline',
  'coding-agent-cost',
  'agent-token-usage',
  'gpt-image-api',
  'sora-api-pricing',
  'kling-api-pricing',
  'runway-api-pricing',
  'seedance-api',
  'image-to-video-api',
  'flux-api',
  'stable-diffusion-api',
];

async function fetchWithBust(path) {
  const url = `${BASE}${path}?v=${BUST}`;
  const res = await fetch(url, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  return { url, status: res.status, ok: res.ok };
}

async function fetchTextWithBust(path) {
  const url = `${BASE}${path}?v=${BUST}`;
  const res = await fetch(url, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  const text = await res.text();
  return { url, status: res.status, text };
}

async function prodLiveCheck() {
  let passed = 0;
  let failed = 0;

  console.log(`\n--- check:prod (BASE=${BASE}) ---`);

  // 1. Public pages must return 200
  console.log('\nPublic pages:');
  for (const path of PUBLIC_PAGES) {
    const { url, status, ok } = await fetchWithBust(path);
    if (ok) {
      console.log(`  [PASS] ${url} → ${status}`);
      passed++;
    } else {
      console.log(`  [FAIL] ${url} → ${status} (expected 200)`);
      failed++;
    }
  }

  // 2. Static files must return 200
  console.log('\nStatic files:');
  for (const path of STATIC_FILES) {
    const { url, status, ok } = await fetchWithBust(path);
    if (ok) {
      console.log(`  [PASS] ${url} → ${status}`);
      passed++;
    } else {
      console.log(`  [FAIL] ${url} → ${status} (expected 200)`);
      failed++;
    }
  }

  // 3. Planned paths must return 404
  console.log('\nPlanned paths (must be 404):');
  for (const path of PLANNED_PATHS) {
    const { url, status } = await fetchWithBust(`/${path}/`);
    if (status === 404) {
      console.log(`  [PASS] ${url} → 404`);
      passed++;
    } else {
      console.log(`  [FAIL] ${url} → ${status} (expected 404)`);
      failed++;
    }
  }

  // 4. Check sitemap.xml content (if sitemap returned 200)
  const sitemapRes = await fetchTextWithBust('/sitemap.xml');
  if (sitemapRes.status === 200) {
    console.log('\nSitemap content:');
    const sitemapUrls = [...sitemapRes.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

    if (sitemapUrls.length === PUBLIC_PAGES.length) {
      console.log(`  [PASS] sitemap has ${sitemapUrls.length} URLs`);
      passed++;
    } else {
      console.log(`  [FAIL] sitemap has ${sitemapUrls.length} URLs (expected ${PUBLIC_PAGES.length})`);
      failed++;
    }

    if (!sitemapRes.text.includes('/404')) {
      console.log(`  [PASS] sitemap does not contain /404`);
      passed++;
    } else {
      console.log(`  [FAIL] sitemap contains /404`);
      failed++;
    }

    if (!sitemapRes.text.includes('aiapiops.pages.dev')) {
      console.log(`  [PASS] sitemap does not reference aiapiops.pages.dev`);
      passed++;
    } else {
      console.log(`  [FAIL] sitemap references aiapiops.pages.dev`);
      failed++;
    }
  }

  // 5. Check llms.txt content (if llms returned 200)
  const llmsRes = await fetchTextWithBust('/llms.txt');
  if (llmsRes.status === 200) {
    console.log('\nLLMS content:');
    const llmsUrls = [...llmsRes.text.matchAll(/^(https:\/\/aiapiops\.com\/(?:[^\s]*)?)/gm)].map(m => m[1]);

    if (llmsUrls.length === PUBLIC_PAGES.length) {
      console.log(`  [PASS] llms.txt has ${llmsUrls.length} URLs`);
      passed++;
    } else {
      console.log(`  [FAIL] llms.txt has ${llmsUrls.length} URLs (expected ${PUBLIC_PAGES.length})`);
      failed++;
    }

    if (!llmsRes.text.includes('/404')) {
      console.log(`  [PASS] llms.txt does not contain /404`);
      passed++;
    } else {
      console.log(`  [FAIL] llms.txt contains /404`);
      failed++;
    }
  }

  // 6. Check robots.txt content (if robots returned 200)
  const robotsRes = await fetchTextWithBust('/robots.txt');
  if (robotsRes.status === 200) {
    console.log('\nRobots.txt:');
    if (robotsRes.text.includes('https://aiapiops.com/sitemap.xml')) {
      console.log(`  [PASS] robots.txt references https://aiapiops.com/sitemap.xml`);
      passed++;
    } else {
      console.log(`  [FAIL] robots.txt does not reference https://aiapiops.com/sitemap.xml`);
      failed++;
    }
  }

  console.log(`\n=== TOTAL: ${passed} passed, ${failed} failed ===`);
  return failed === 0;
}

const result = await prodLiveCheck();
process.exit(result ? 0 : 1);
