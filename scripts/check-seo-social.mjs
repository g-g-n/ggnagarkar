import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const requiredMetaNames = ['description', 'robots', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
const requiredMetaProperties = ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt'];

function collectHtmlFiles(dir) {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      return collectHtmlFiles(path);
    }
    return entry.endsWith('.html') ? [path] : [];
  });
}

function hasMetaName(html, name) {
  return new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*content=["'][^"']+["'][^>]*>`, 'i').test(html);
}

function hasMetaProperty(html, property) {
  return new RegExp(`<meta\\s+[^>]*property=["']${property}["'][^>]*content=["'][^"']+["'][^>]*>`, 'i').test(html);
}

function extractTitle(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? '';
}

function extractCanonical(html) {
  return html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] ?? '';
}

if (!existsSync(distDir)) {
  console.error('dist/ does not exist. Run npm run build first.');
  process.exit(1);
}

const failures = [];
const htmlFiles = collectHtmlFiles(distDir);

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const label = relative(distDir, file);
  const title = extractTitle(html);
  const canonical = extractCanonical(html);

  if (!title || title.length > 70) {
    failures.push(`${label}: title is missing or over 70 characters`);
  }
  if (!canonical || !canonical.startsWith('https://')) {
    failures.push(`${label}: canonical must be an absolute HTTPS URL`);
  }
  if (canonical.includes('example.com') || html.includes('https://example.com')) {
    failures.push(`${label}: generated metadata still contains example.com`);
  }
  if (!html.includes('<script type="application/ld+json"')) {
    failures.push(`${label}: missing JSON-LD script`);
  }

  for (const name of requiredMetaNames) {
    if (!hasMetaName(html, name)) {
      failures.push(`${label}: missing meta name="${name}"`);
    }
  }
  for (const property of requiredMetaProperties) {
    if (!hasMetaProperty(html, property)) {
      failures.push(`${label}: missing meta property="${property}"`);
    }
  }
}

if (failures.length > 0) {
  console.error(`SEO/social audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEO/social audit passed for ${htmlFiles.length} HTML files.`);
