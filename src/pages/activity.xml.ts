import rss from '@astrojs/rss';
import activity from '../content/activity.json';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const site = context.site ?? 'https://www.ggnagarkar.com';
  const sortedActivity = [...activity].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return rss({
    title: 'GG Nagarkar Writing & Activity',
    description: 'Public activity from GG Nagarkar, including external blogs, talks, videos, product updates, case studies, and publications.',
    site,
    customData: `<link>${new URL('/writing', site).toString()}</link><language>en</language>`,
    items: sortedActivity.map((item) => ({
      title: `${item.type.toUpperCase()}: ${item.title}`,
      pubDate: new Date(item.date),
      description: item.summary,
      link: new URL(item.url, site).toString(),
      categories: item.tags
    }))
  });
}
