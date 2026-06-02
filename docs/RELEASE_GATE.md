# Release Gate for AI API Ops

## Local gate

Before any change is treated as ready, run:

- `npm run verify`
- Review the resulting diff
- Confirm no unrelated files changed

## Production gate

Do not report Done until all of the following are true on the live custom domain:

- Cloudflare Pages production deploy is confirmed
- Cache-busted production live checks pass
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

## Search submission gate

Do not submit or recommend Google Search Console or Bing until the production gate passes.

## Exact URLs to test

- `https://aiapiops.com/`
- `https://aiapiops.com/mcp-server-chatgpt/`
- `https://aiapiops.com/mcp-registry/`
- `https://aiapiops.com/llm-observability/`
- `https://aiapiops.com/openclaw-openrouter/`
- `https://aiapiops.com/claude-code-token-cost/`
- `https://aiapiops.com/video-generation-api-pricing/`
- `https://aiapiops.com/sitemap.xml`
- `https://aiapiops.com/robots.txt`
- `https://aiapiops.com/llms.txt`

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
- production live check result
- sitemap URL set
- llms URL set
- planned pages 404 result
- CTA URL exactness result
- banned claims result
- cross-project contamination result
- whether search submission is allowed
