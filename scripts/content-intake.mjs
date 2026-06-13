import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SEARCH_DIRS = ['intake', 'imports', 'data-intake'];
const ALLOWED_EXT = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.json',
  '.csv',
  '.html',
  '.htm',
  '.xml',
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp'
]);
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'dist', '.astro']);
const OUTPUT_PATH = path.join(ROOT, 'src/data/profile.draft.json');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (full === OUTPUT_PATH) continue;
      if (ALLOWED_EXT.has(ext)) files.push(full);
    }
  }
  return files;
}

function normalizeText(content, ext) {
  if (ext === '.html' || ext === '.htm' || ext === '.xml') {
    return content
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return content.replace(/\s+/g, ' ').trim();
}

function tryReadFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.pdf') {
    return {
      text: '',
      note: 'PDF detected. Convert to text manually (or with pdftotext) and place alongside source for extraction.'
    };
  }
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
    return {
      text: '',
      note: 'Image/screenshot detected. OCR is not performed automatically; review manually.'
    };
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return { text: normalizeText(raw, ext), note: '' };
  } catch (error) {
    return { text: '', note: `Unable to parse safely: ${error.message}` };
  }
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function extract(textBlob) {
  const urls = unique(Array.from(textBlob.matchAll(/https?:\/\/[^\s)\]>"']+/gi), (m) => m[0]));
  const emails = unique(Array.from(textBlob.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi), (m) => m[0]));
  const patentNumbers = unique(Array.from(textBlob.matchAll(/\b(?:US|IN|WO|EP)?[- ]?\d{6,}[A-Z0-9-]*\b/g), (m) => m[0]));

  const skillKeywords = [
    'agentic ai',
    'enterprise ai',
    'aiops',
    'devops',
    'sre',
    'cloud infrastructure',
    'platform engineering',
    'reliability engineering',
    'ci/cd',
    'software delivery',
    'sales automation',
    'product engineering'
  ];

  const skills = unique(
    skillKeywords.filter((skill) => textBlob.toLowerCase().includes(skill.toLowerCase()))
  );

  const lines = textBlob
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20);

  const experience = lines
    .filter((line) => /founder|engineer|lead|manager|consulting|opsrabbit|applied ai/i.test(line))
    .slice(0, 20)
    .map((line) => ({ needs_review: true, raw: line }));

  const education = lines
    .filter((line) => /university|college|b\.?tech|m\.?tech|mba|education/i.test(line))
    .slice(0, 10)
    .map((line) => ({ needs_review: true, raw: line }));

  const projects = lines
    .filter((line) => /project|product|platform|application|startup/i.test(line))
    .slice(0, 20)
    .map((line) => ({ needs_review: true, raw: line }));

  const posts = lines
    .filter((line) => /post|blog|article|talk|video|youtube/i.test(line))
    .slice(0, 20)
    .map((line) => ({ needs_review: true, raw: line }));

  return {
    emails,
    urls,
    patentNumbers,
    skills,
    experience,
    education,
    projects,
    posts
  };
}

function main() {
  const candidateDirs = SEARCH_DIRS
    .map((dir) => path.join(ROOT, dir))
    .filter((dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory());

  const files = unique(candidateDirs.flatMap((dir) => walk(dir)));

  const sourceSummaries = [];
  const chunks = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const { text, note } = tryReadFile(file);
    sourceSummaries.push({
      path: path.relative(ROOT, file),
      type: ext.replace('.', ''),
      needs_review: true,
      note
    });
    if (text) chunks.push(text);
  }

  const blob = chunks.join(' ');
  const out = extract(blob);

  const draft = {
    needs_review: true,
    last_generated: new Date().toISOString(),
    notes: [
      'Auto-generated draft from local files. Manual review required.',
      'Do not publish this draft directly.',
      'Copy only verified fields into src/data/*.json and src/content/*.'
    ],
    sources: sourceSummaries,
    profile: {
      name: 'GG Nagarkar',
      headline: '',
      location: '',
      summary: '',
      emails: out.emails,
      links: out.urls
    },
    experience: out.experience,
    education: out.education,
    patents: out.patentNumbers.map((patentNumber) => ({
      needs_review: true,
      patentNumber,
      title: '',
      status: '',
      summary: ''
    })),
    projects: out.projects,
    skills: out.skills.map((skill) => ({ needs_review: true, name: skill })),
    posts: out.posts
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(draft, null, 2)}\n`, 'utf-8');
  console.log(`Wrote draft profile data to ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log(`Processed ${files.length} candidate files.`);
}

main();
