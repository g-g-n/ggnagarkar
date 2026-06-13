# Agent Guide

This repo is the pre-production Astro website for GG Nagarkar. Treat changes as production-bound: keep content factual, source-backed where possible, and consistent across pages, feeds, metadata, and `llms.txt`.

## Project Shape

- Static Astro site with Tailwind CSS and GitHub Pages deployment.
- No backend, no client-side framework, and no MDX/content collection currently in use.
- Primary pages: `/`, `/about`, `/experience`, `/projects`, `/built`, `/patents`, `/writing`, `/contact`, `/facts`.
- Built detail pages are generated at `/built/{slug}` from `src/data/built.json`.
- Feed endpoint: `/activity.xml`.

## URL And Sitemap Rules

- Never change the URL path of an existing page or feed after it exists. Existing paths are permanent unless the user explicitly approves a migration plan.
- Do not rename, move, or delete existing routes such as `/about`, `/experience`, `/projects`, `/built`, `/built/{slug}`, `/patents`, `/writing`, `/contact`, `/facts`, or `/activity.xml`.
- If a new page or feed is added, make sure it is included in the generated sitemap by the Astro route structure.
- If a page or feed is intentionally removed with explicit approval, update all internal links, navigation, footer links, JSON-LD, `public/llms.txt`, and sitemap expectations in this file.
- Always run `npm run build` after route changes and inspect the generated `dist/sitemap-index.xml` and `dist/sitemap-0.xml`.
- Always keep `public/robots.txt` pointing to the correct sitemap index URL for the active production domain.

## Important Files

- `src/pages/*.astro`: page routes and page-specific JSON-LD.
- `src/pages/writing/index.astro`: combined Writing & Activity archive.
- `src/pages/activity.xml.ts`: public activity RSS feed.
- `src/components/SEOHead.astro`: shared SEO, Open Graph, Twitter, and JSON-LD output.
- `src/data/*.json`: profile, experience, built items, projects, patents, and social links.
- `src/content/activity.json`: public blogs, talks, videos, case studies, and updates.
- `public/llms.txt`: canonical facts and AI/search guidance.
- `public/robots.txt`: crawler policy and sitemap location.
- `scripts/check-links.mjs`: generated HTML link audit.
- `scripts/check-seo-social.mjs`: generated HTML SEO/social metadata audit.

## Content Rules

- Do not publish placeholder articles, placeholder links, or `needs_review` / `needs_confirmation` style labels.
- Keep DocuLens out of current-focus surfaces unless explicitly requested; it may remain in the full Projects archive.
- Keep `/writing` as the canonical public archive for writing and activity.
- Do not recreate `/activity` as a page unless explicitly requested. `/activity.xml` is the feed.
- Do not recreate `/rss.xml` until there are real first-party writing posts.
- If adding first-party writing later, add the content model deliberately and update README, `llms.txt`, footer links, sitemap expectations, and feed behavior together.
- Keep names, dates, roles, company descriptions, and source URLs consistent across `about`, `experience`, `projects`, `built`, `facts`, `llms.txt`, and JSON-LD.
- Preserve existing page URLs. If the user asks for cleanup, clean content and presentation without changing established URL paths.

## SEO, GEO, And Sharing

- Every page must use `Layout` so `SEOHead` emits title, description, canonical, Open Graph, Twitter card, robots, and JSON-LD.
- Page descriptions should be specific, factual, and non-marketing-heavy.
- Canonical paths should be stable and absolute once rendered.
- Keep canonical paths aligned with existing page URLs; do not change canonical paths for existing pages.
- Update `public/llms.txt` whenever the canonical page set, entities, feeds, or current focus changes.
- Update `public/robots.txt` if the production domain or sitemap path changes, and verify the rendered sitemap files.
- Social preview image defaults to `/brand/gg-logo-horizontal.png`; only change it if the replacement is production-ready.

## Design Standards

- Keep the site professional, restrained, and scannable.
- Prefer concise cards and structured lists over landing-page style sections.
- Avoid nested cards when a section can be unframed.
- Maintain mobile usability; primary navigation must remain accessible on small screens.
- Use existing components and Tailwind patterns before adding new abstractions.
- Keep card radius at `0.5rem` unless there is a deliberate design update across the whole site.

## Editing Standards

- Use `rg` for search.
- Keep edits scoped to the requested change and nearby consistency fixes.
- Do not add new dependencies unless clearly needed.
- If dependencies change, update `package-lock.json`.
- Do not commit generated `dist/` unless the user explicitly asks.
- Treat `src/data/profile.draft.json` as disposable local intake output; it should not be shipped as site content.
- Keep `scripts/content-intake.mjs` restricted to explicit intake folders so it does not scan the whole repo.

## Required Checks

Run these before saying the site is ready:

```bash
npm run check
npm run build
npm run check:links
npm run check:seo
```

Expected pre-prod output:

- Build emits the primary HTML pages plus one built detail page per `src/data/built.json` item.
- `/activity.xml` exists.
- `/activity` and `/rss.xml` should 404 unless intentionally reintroduced.
- `dist/sitemap-index.xml` and `dist/sitemap-0.xml` must exist and list the expected page URLs.
- `check:links` and `check:seo` must pass.

## Deployment Notes

- GitHub Actions deployment is in `.github/workflows/deploy.yml`.
- Deployment must run check, build, link check, and SEO/social audit.
- Production `SITE_URL` should be set to the final canonical domain in repository variables.
