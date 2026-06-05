import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const TITLE_RECOMMENDED_MIN = 30;
const TITLE_RECOMMENDED_MAX = 60;
const TITLE_HARD_MAX = 65;
const META_DESCRIPTION_RECOMMENDED_MIN = 90;
const META_DESCRIPTION_HARD_MAX = 160;

const MEDIA_SLUGS = new Set([
  'video-generation-api-pricing',
]);

const MEDIA_PRICING_WARNINGS = [
  'pricing may be per',
  'check the provider pricing',
  'billing depends on',
  'pricing and availability',
];

const MEDIA_OFFICIAL_VS_THIRD_PARTY_PATTERNS = [
  /official\s+(model\s+)?API/i,
  /third-party\s+provider/i,
  /aggregator\s+API/i,
  /official documentation/i,
];

async function checkSeo() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:seo ---');

  const htmlFiles = await getAllFiles(distDir, '');

  const titlesByValue = new Map();
  const descriptionsByValue = new Map();

  for (const file of htmlFiles) {
    if (!file.endsWith('.html')) continue;
    if (file === '404.html') continue;

    // Determine slug from file path
    let slug = '';
    if (file === 'index.html') slug = '';
    else {
      const parts = file.replace(/\\/g, '/').split('/');
      if (parts.length >= 2 && parts[parts.length - 1] === 'index.html') {
        slug = parts[parts.length - 2];
      }
    }

    const isMediaPage = MEDIA_SLUGS.has(slug);

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

    const descriptionMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
    const metaDescription = descriptionMatch?.[1]?.trim() ?? '';

    if (!metaDescription) {
      issues.push('Missing or empty meta description');
    } else {
      const len = [...metaDescription].length;
      if (len > META_DESCRIPTION_HARD_MAX) {
        issues.push(`Meta description too long (${len} > ${META_DESCRIPTION_HARD_MAX})`);
      } else if (len < META_DESCRIPTION_RECOMMENDED_MIN) {
        issues.push(`Meta description too short (${len} < ${META_DESCRIPTION_RECOMMENDED_MIN})`);
      }

      const prev = descriptionsByValue.get(metaDescription) || [];
      prev.push(file);
      descriptionsByValue.set(metaDescription, prev);
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

    if (isMediaPage) {
      const lower = content.toLowerCase();
      const hasPricingWarning = MEDIA_PRICING_WARNINGS.some(w => lower.includes(w));
      if (!hasPricingWarning) {
        issues.push('Media page missing pricing freshness warning');
      }

      const hasOfficialThirdParty = MEDIA_OFFICIAL_VS_THIRD_PARTY_PATTERNS.some(re => re.test(content));
      if (!hasOfficialThirdParty) {
        issues.push('Media page missing official-vs-third-party API wording');
      }
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

  for (const [description, files] of descriptionsByValue.entries()) {
    if (files.length <= 1) continue;
    console.log(`  [FAIL] Duplicate meta description: ${JSON.stringify(description)}`);
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
