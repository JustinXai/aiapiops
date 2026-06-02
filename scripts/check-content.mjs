import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

async function checkContent() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- check:content ---');

  const htmlFiles = await getAllFiles(distDir, '');

  for (const file of htmlFiles) {
    if (!file.endsWith('.html')) continue;
    const content = await readFile(join(distDir, file), 'utf-8');

    const issues = [];

    if (/<\{\{.*?\}\}>/.test(content)) {
      issues.push('Template placeholder {{...}}');
    }
    if (/lorem\s+ipsum/gi.test(content)) {
      issues.push('Lorem ipsum');
    }
    if (/today i will/gi.test(content)) {
      issues.push('Generic filler text');
    }
    if (/in today's fast-paced/gi.test(content)) {
      issues.push('Generic AI startup copy');
    }
    if (/unlock the power of/gi.test(content)) {
      issues.push('Marketing filler copy');
    }
    if (/seamlessly leverage/gi.test(content)) {
      issues.push('Marketing filler copy');
    }
    if (/the ultimate guide/gi.test(content)) {
      issues.push('Overhyped headline');
    }
    if (/playground objective/gi.test(content)) {
      issues.push('Internal implementation copy');
    }
    if (/choose the taste/gi.test(content)) {
      issues.push('Internal implementation copy');
    }
    if (/design version/gi.test(content)) {
      issues.push('Internal implementation copy');
    }
    if (/\bversion\s+[abcd]\b/gi.test(content)) {
      issues.push('Internal implementation copy');
    }
    if (/linkai/gi.test(content)) {
      issues.push('Contamination: LinkAI');
    }
    if (/sellerfixhub/gi.test(content)) {
      issues.push('Contamination: SellerFixHub');
    }
    if (/eureadyseller/gi.test(content)) {
      issues.push('Contamination: EUReadySeller');
    }
    if (/aicostplanner/gi.test(content)) {
      issues.push('Contamination: aicostplanner');
    }
    if (/einvoiceatlas/gi.test(content)) {
      issues.push('Contamination: EInvoiceAtlas');
    }
    if (/extensionfixes/gi.test(content)) {
      issues.push('Contamination: ExtensionFixes');
    }

    if (issues.length === 0) {
      passed++;
    } else {
      console.log(`  [FAIL] ${file}`);
      issues.forEach(issue => console.log(`        - ${issue}`));
      failed++;
    }
  }

  console.log(`\nResult: ${passed} files passed, ${failed} files with issues`);
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

const result = await checkContent();
process.exit(result ? 0 : 1);
