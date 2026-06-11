import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const PUBLIC_CANONICAL_URLS = [
  'https://aiapiops.com/',
  'https://aiapiops.com/mcp-server-chatgpt/',
  'https://aiapiops.com/mcp-registry/',
  'https://aiapiops.com/llm-observability/',
  'https://aiapiops.com/openclaw-openrouter/',
  'https://aiapiops.com/openclaw-api-key/',
  'https://aiapiops.com/claude-code-token-cost/',
  'https://aiapiops.com/video-generation-api-pricing/',
  'https://aiapiops.com/image-generation-api-pricing/',
];

async function checkStaticFiles() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:static-files ---');

  // 1. Check files exist
  const requiredFiles = ['sitemap.xml', 'robots.txt', 'llms.txt'];
  for (const file of requiredFiles) {
    try {
      await readFile(join(distDir, file), 'utf-8');
      console.log(`  [PASS] ${file} exists`);
      passed++;
    } catch {
      console.log(`  [FAIL] ${file} missing from dist`);
      failed++;
    }
  }

  // 2. Check sitemap.xml
  const sitemapContent = await readFile(join(distDir, 'sitemap.xml'), 'utf-8').catch(() => '');
  if (sitemapContent) {
    const sitemapUrls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

    // Must contain exactly 9 public URLs
    if (sitemapUrls.length === PUBLIC_CANONICAL_URLS.length) {
      console.log(`  [PASS] sitemap.xml has ${sitemapUrls.length} URLs (expected ${PUBLIC_CANONICAL_URLS.length})`);
      passed++;
    } else {
      console.log(`  [FAIL] sitemap.xml has ${sitemapUrls.length} URLs (expected ${PUBLIC_CANONICAL_URLS.length})`);
      failed++;
    }

    // Each public URL must be present
    for (const url of PUBLIC_CANONICAL_URLS) {
      if (sitemapUrls.includes(url)) {
        console.log(`  [PASS] sitemap contains: ${url}`);
        passed++;
      } else {
        console.log(`  [FAIL] sitemap missing: ${url}`);
        failed++;
      }
    }

    // Must not contain /404
    if (!sitemapContent.includes('/404')) {
      console.log(`  [PASS] sitemap.xml does not contain /404`);
      passed++;
    } else {
      console.log(`  [FAIL] sitemap.xml contains /404`);
      failed++;
    }

    // Must not reference pages.dev
    if (!sitemapContent.includes('aiapiops.pages.dev')) {
      console.log(`  [PASS] sitemap.xml does not reference aiapiops.pages.dev`);
      passed++;
    } else {
      console.log(`  [FAIL] sitemap.xml references aiapiops.pages.dev`);
      failed++;
    }
  }

  // 3. Check llms.txt
  const llmsContent = await readFile(join(distDir, 'llms.txt'), 'utf-8').catch(() => '');
  if (llmsContent) {
    const llmsUrls = [...llmsContent.matchAll(/^(https:\/\/aiapiops\.com\/(?:[^\s]*)?)/gm)].map(m => m[1]);

    // Must contain exactly 9 public URLs
    if (llmsUrls.length === PUBLIC_CANONICAL_URLS.length) {
      console.log(`  [PASS] llms.txt has ${llmsUrls.length} URLs (expected ${PUBLIC_CANONICAL_URLS.length})`);
      passed++;
    } else {
      console.log(`  [FAIL] llms.txt has ${llmsUrls.length} URLs (expected ${PUBLIC_CANONICAL_URLS.length})`);
      failed++;
    }

    // Each public URL must be present
    for (const url of PUBLIC_CANONICAL_URLS) {
      if (llmsUrls.includes(url)) {
        console.log(`  [PASS] llms contains: ${url}`);
        passed++;
      } else {
        console.log(`  [FAIL] llms missing: ${url}`);
        failed++;
      }
    }

    // Must not contain /404
    if (!llmsContent.includes('/404')) {
      console.log(`  [PASS] llms.txt does not contain /404`);
      passed++;
    } else {
      console.log(`  [FAIL] llms.txt contains /404`);
      failed++;
    }
  }

  // 4. Check robots.txt
  const robotsContent = await readFile(join(distDir, 'robots.txt'), 'utf-8').catch(() => '');
  if (robotsContent) {
    const sitemapRef = sitemapContent
      ? 'https://aiapiops.com/sitemap.xml'
      : 'https://aiapiops.pages.dev/sitemap.xml';

    if (robotsContent.includes(sitemapRef)) {
      console.log(`  [PASS] robots.txt references https://aiapiops.com/sitemap.xml`);
      passed++;
    } else {
      console.log(`  [FAIL] robots.txt does not reference https://aiapiops.com/sitemap.xml`);
      failed++;
    }
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

const result = await checkStaticFiles();
process.exit(result ? 0 : 1);
