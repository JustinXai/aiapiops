# Operations Guide for AI API Ops

## Cloudflare Pages deployment workflow

- Merge or push the release commit to the production branch.
- Confirm Cloudflare Pages picks up the commit.
- Confirm the production deployment hash matches the intended commit.
- Purge cache when the live domain serves stale content.

## Production live check

After deployment, run the automated production check:

```bash
npm run check:prod
```

This script performs cache-busted fetches against the live custom domain (`https://aiapiops.com` by default, or set `BASE` env var) and verifies:

- 9 public pages return 200
- sitemap.xml, robots.txt, llms.txt return 200
- sitemap.xml has 9 URLs, no /404, no `aiapiops.pages.dev` references
- llms.txt has 9 URLs, no /404
- robots.txt references `https://aiapiops.com/sitemap.xml`
- 26 planned paths return 404

Override the base URL with an environment variable if needed:

```bash
BASE=https://aiapiops.pages.dev npm run check:prod
```

## Manual production check commands

Use cache-busted fetches against the live custom domain and save the responses before scanning:

```bash
curl.exe -L -H "Cache-Control: no-cache" "https://aiapiops.com/mcp-registry/?v=%RANDOM%%RANDOM%" -o prod-mcp-registry.html
curl.exe -L -H "Cache-Control: no-cache" "https://aiapiops.com/sitemap.xml?v=%RANDOM%%RANDOM%" -o prod-sitemap.xml
curl.exe -L -H "Cache-Control: no-cache" "https://aiapiops.com/llms.txt?v=%RANDOM%%RANDOM%" -o prod-llms.txt
curl.exe -L -H "Cache-Control: no-cache" "https://aiapiops.com/robots.txt?v=%RANDOM%%RANDOM%" -o prod-robots.txt
```

## Cache purge note

If production HTML contradicts local `dist/`, purge Cloudflare cache and recheck the live HTML.

## Exact URLs to verify on production

- `https://aiapiops.com/`
- `https://aiapiops.com/mcp-server-chatgpt/`
- `https://aiapiops.com/mcp-registry/`
- `https://aiapiops.com/llm-observability/`
- `https://aiapiops.com/openclaw-openrouter/`
- `https://aiapiops.com/openclaw-api-key/`
- `https://aiapiops.com/claude-code-token-cost/`
- `https://aiapiops.com/video-generation-api-pricing/`
- `https://aiapiops.com/image-generation-api-pricing/`
- `https://aiapiops.com/sitemap.xml`
- `https://aiapiops.com/robots.txt`
- `https://aiapiops.com/llms.txt`

## GSC sitemap submission workflow

Only consider GSC sitemap submission after production live checks pass and `sitemap.xml` is confirmed correct on the live domain.

## Bing URL Inspection workflow

Only inspect URLs in Bing after the live custom-domain HTML, sitemap, and llms checks pass.

## When not to submit GSC/Bing

Do not submit search-console or URL-inspection actions when:

- the production deployment has not been confirmed
- cache-busted live checks have not passed
- duplicate numbering or stale content is still visible in live HTML
- the sitemap or llms outputs do not match public pages
