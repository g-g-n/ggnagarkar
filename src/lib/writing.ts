export interface WritingPost {
  title: string;
  metaTitle: string;
  description: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
  image: string;
  imageAlt: string;
  canonicalPath: string;
  body: string;
  html: string;
}

const postModules = import.meta.glob('../content/writing/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true
});

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Writing post is missing frontmatter.');
  }

  const frontmatter = Object.fromEntries(
    match[1]
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(':');
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        return [key, parseValue(value)];
      })
  );

  return { frontmatter, body: match[2].trim() };
}

function parseValue(value: string) {
  if (value.startsWith('[')) {
    return JSON.parse(value);
  }
  return value.replace(/^["']|["']$/g, '');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderMarkdownLinks(value: string) {
  return value.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_match, label: string, href: string) => {
    const safeLabel = escapeHtml(label);
    const safeHref = escapeHtml(href);
    return `<a href="${safeHref}" target="_blank" rel="noreferrer">${safeLabel}</a>`;
  });
}

function renderInline(value: string) {
  const codeSegments: string[] = [];
  const withoutCode = value.replace(/`([^`]+)`/g, (_match, code: string) => {
    const index = codeSegments.push(`<code>${escapeHtml(code)}</code>`) - 1;
    return `@@CODE${index}@@`;
  });
  const linkSegments: string[] = [];
  const withoutLinks = renderMarkdownLinks(withoutCode).replace(
    /<a href="[^"]+" target="_blank" rel="noreferrer">[^<]+<\/a>/g,
    (link: string) => {
      const index = linkSegments.push(link) - 1;
      return `@@LINK${index}@@`;
    }
  );

  return escapeHtml(withoutLinks)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/@@LINK(\d+)@@/g, (_match, index: string) => linkSegments[Number(index)] ?? '')
    .replace(/@@CODE(\d+)@@/g, (_match, index: string) => codeSegments[Number(index)] ?? '')
}

function renderImageBlock(value: string) {
  const image = value.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/);
  if (!image) {
    return null;
  }

  const [, alt, src, caption] = image;
  const safeAlt = escapeHtml(alt);
  const safeSrc = escapeHtml(src);
  const figcaption = caption ? `<figcaption>${renderInline(caption)}</figcaption>` : '';

  return `<figure><img src="${safeSrc}" alt="${safeAlt}" loading="lazy" />${figcaption}</figure>`;
}

function renderMarkdown(markdown: string) {
  const blocks = markdown.split(/\n{2,}/);

  return blocks
    .map((block) => {
      const trimmed = block.trim();
      const imageBlock = renderImageBlock(trimmed);
      if (imageBlock) {
        return imageBlock;
      }
      if (trimmed.startsWith('## ')) {
        return `<h2>${renderInline(trimmed.slice(3))}</h2>`;
      }
      if (trimmed.startsWith('### ')) {
        return `<h3>${renderInline(trimmed.slice(4))}</h3>`;
      }
      if (trimmed.startsWith('- ')) {
        const items = trimmed
          .split('\n')
          .filter((line) => line.startsWith('- '))
          .map((line) => `<li>${renderInline(line.slice(2))}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${renderInline(trimmed.replace(/\n/g, ' '))}</p>`;
    })
    .join('\n');
}

export function getWritingPosts(): WritingPost[] {
  return Object.entries(postModules)
    .map(([path, raw]) => {
      const slug = path.match(/\/([^/]+)\.mdx$/)?.[1] ?? '';
      const { frontmatter, body } = parseFrontmatter(String(raw));

      return {
        title: String(frontmatter.title),
        metaTitle: String(frontmatter.metaTitle),
        description: String(frontmatter.description),
        slug,
        date: String(frontmatter.date),
        author: String(frontmatter.author),
        tags: frontmatter.tags as string[],
        image: String(frontmatter.image),
        imageAlt: String(frontmatter.imageAlt),
        canonicalPath: `/writing/${slug}`,
        body,
        html: renderMarkdown(body)
      };
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getWritingPost(slug: string) {
  return getWritingPosts().find((post) => post.slug === slug);
}
