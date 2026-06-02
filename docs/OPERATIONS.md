# Operations Guide for AI API Ops

## Cloudflare Pages deployment workflow

- Merge or push the release commit to the production branch.
- Confirm Cloudflare Pages picks up the commit.
- Confirm the production deployment hash matches the intended commit.
- Purge cache when the live domain serves stale content.

## Production live check commands

Use cache-busted fetches against the live custom domain and save the responses before scanning:

```bash
curl.exe -L -H "Cache-Control: no-cache" "https://aiapiops.com/openclaw-openrouter/?v=%RANDOM%%RANDOM%" -o prod-openclaw.html
curl.exe -L -H "Cache-Control: no-cache" "https://aiapiops.com/claude-code-token-cost/?v=%RANDOM%%RANDOM%" -o prod-claude.html
curl.exe -L -H "Cache-Control: no-cache" "https://aiapiops.com/video-generation-api-pricing/?v=%RANDOM%%RANDOM%" -o prod-video.html
curl.exe -L -H "Cache-Control: no-cache" "https://aiapiops.com/sitemap.xml?v=%RANDOM%%RANDOM%" -o prod-sitemap.xml
```

## Cache purge note

If production HTML contradicts local `dist/`, purge Cloudflare cache and recheck the live HTML.

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
