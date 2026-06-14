# GG Nagarkar - Professional Website (Astro)

Static personal professional website built with Astro, TypeScript, Tailwind CSS, and GitHub Pages deployment.

## Stack

- Astro (static output)
- TypeScript
- Tailwind CSS
- GitHub Pages + GitHub Actions
- No backend

## Local setup

```bash
npm install
npm run dev
```

Build production output:

```bash
npm run build
```

## Content model

Editable profile and structured data files:

- `src/data/profile.json`
- `src/data/experience.json`
- `src/data/built.json`
- `src/data/projects.json`
- `src/data/patents.json`
- `src/data/social-links.json`
- `src/content/activity.json`
- `src/content/writing/*.mdx`

## Pages

- `/` Home
- `/about`
- `/experience`
- `/projects`
- `/built`
- `/built/{slug}` generated build detail pages
- `/patents`
- `/writing`
- `/writing/{slug}` generated first-party writing pages
- `/contact`
- `/facts`

## SEO and GEO implementation

Included:

- Unique page titles and meta descriptions
- Canonical URLs
- Open Graph + Twitter meta tags
- JSON-LD structured data (Person, Organization, WebSite, BlogPosting, CreativeWork, BreadcrumbList)
- `sitemap.xml` via `@astrojs/sitemap`
- `robots.txt`
- `llms.txt`
- RSS feed: `/activity.xml` (public activity)
- Semantic HTML and accessible headings

## GitHub Pages deployment

Workflow file:

- `.github/workflows/deploy.yml`

### Configure repository

1. Push this project to GitHub on the `main` branch.
2. In repository settings, enable **GitHub Pages** source as **GitHub Actions**.
3. Optionally set repository variable `SITE_URL` to your canonical domain.
   - Example custom domain: `https://www.ggnagarkar.com`
4. Every push to `main` triggers build + deploy.

## Custom domain later

When adding custom domain:

1. Set DNS records to GitHub Pages.
2. Add `public/CNAME` with your domain.
3. Set `SITE_URL` repo variable to the same domain.

## Content intake workflow

Use the local intake script to collect draft profile data from exports:

```bash
npm run intake:profile
```

Input guidance is documented in:

- `CONTENT_INTAKE.md`

Draft output:

- `src/data/profile.draft.json`

Generated intake data is local review material only and must be manually verified before publishing.

## Content maintenance

- Keep `SITE_URL` aligned with the production domain.
- Keep social/profile URLs current in `src/data/social-links.json`.
- Review project URLs, patent status, and source references periodically.
- Add new public writing and activity links as they are published.
- Run `npm run build`, `npm run check:links`, and `npm run check:seo` before publishing.

## Notes

- Keep names and company descriptions consistent across all data files for stronger AI/search indexing.
