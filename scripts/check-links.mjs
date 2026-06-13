import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function normalizeLocalPath(href) {
  const noHash = href.split('#')[0];
  const noQuery = noHash.split('?')[0];
  if (noQuery.endsWith('/')) return `${noQuery}index.html`;
  if (path.extname(noQuery)) return noQuery.replace(/^\//, '');
  return `${noQuery.replace(/^\//, '')}/index.html`;
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('dist directory not found. Run npm run build first.');
    process.exit(1);
  }

  const htmlFiles = walk(DIST);
  const issues = [];
  const hrefRe = /href="([^"]*)"/g;

  for (const file of htmlFiles) {
    const relFile = path.relative(DIST, file);
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.matchAll(hrefRe);

    for (const match of matches) {
      const href = (match[1] || '').trim();
      if (!href) {
        issues.push(`${relFile}: empty href`);
        continue;
      }

      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }

      if (href.startsWith('#')) continue;

      if (href.startsWith('/')) {
        const localPath = normalizeLocalPath(href);
        const target = path.join(DIST, localPath);
        if (!fs.existsSync(target)) {
          issues.push(`${relFile}: broken internal link ${href} -> ${localPath}`);
        }
      }
    }
  }

  if (issues.length > 0) {
    console.error('Link check failed:');
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log(`Link check passed for ${htmlFiles.length} HTML files.`);
}

main();
