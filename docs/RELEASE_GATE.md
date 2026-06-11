# Release Gate for AI API Ops

## CI gate

GitHub Actions runs `npm run verify` on every push to `main` and every pull request. A failing verify blocks merge and blocks deployment.

## Local gate

Before any change is treated as ready, run:

- `npm run verify`
- Review the resulting diff
- Confirm no unrelated files changed

## Cloudflare Pages gate

**Cloudflare Pages dashboard must use build command `npm run verify`, not only `npm run build`.**

Using `npm run build` alone skips the full gate and allows problematic HTML to reach production. Set the build command in the Cloudflare Pages dashboard to:

```
npm run verify
```

## Production gate

Do not report Done until all of the following are true on the live custom domain:

- Cloudflare Pages production deploy is confirmed
- `npm run check:prod` passes
- Changed public pages return 200
- Planned pages return 404
- `sitemap.xml` returns 200 and includes only canonical public URLs
- `robots.txt` returns 200 and references `https://aiapiops.com/sitemap.xml`
- `llms.txt` returns 200 and lists only public pages
- CTA URLs are exact:
  - `https://app.rutaapi.com/register?lng=en`
  - `https://app.rutaapi.com/pricing`
- No banned claims are present
- No cross-project contamination is present
- No playground copy is present
- No duplicate numbering patterns like `1. 1`, `2. 2`, `3. 3`
- Downloaded production HTML is saved and scanned for each changed page

## Local verify checks

`npm run verify` runs the following checks in sequence:

1. `npm run build` — Astro static build
2. `check:public-pages` — dist HTML count, 404.html content, planned pages 404 on `aiapiops.pages.dev`
3. `check:content` — placeholder, filler, contamination patterns
4. `check:links` — CTA URL exactness
5. `check:claims` — banned claims
6. `check:seo` — title, meta, canonical, og, H1 uniqueness and length
7. `check:jsonld` — valid JSON-LD
8. `check:static-files` — sitemap.xml, robots.txt, llms.txt correctness
9. `check:duplicate-numbering` — no `1. 1` / `2. 2` patterns in HTML text

## Production check

After deployment, run:

```bash
npm run check:prod
```

This runs against the live `https://aiapiops.com` domain (or `BASE` env var) and checks:

- 9 public pages return 200
- sitemap.xml, robots.txt, llms.txt return 200
- sitemap.xml has 9 URLs, no /404, no `aiapiops.pages.dev` references
- llms.txt has 9 URLs, no /404
- robots.txt references `https://aiapiops.com/sitemap.xml`
- 26 planned paths return 404

## Search submission gate

Do not submit or recommend Google Search Console or Bing until the production gate passes.

## Planned pages 404 policy

Planned pages are not public routes. They must return 404 until fully written, reviewed, and promoted.

## Sitemap, llms, robots policy

- `sitemap.xml` must list only public canonical URLs.
- `llms.txt` must list only public pages.
- `robots.txt` must reference the canonical sitemap URL.

## Final report format

When reporting release status, include:

- files changed
- local verify result
- production deployed commit hash
- production live check result (`npm run check:prod`)
- sitemap URL set
- llms URL set
- planned pages 404 result
- CTA URL exactness result
- banned claims result
- cross-project contamination result
- whether search submission is allowed
