# Historical Incidents for AI API Ops

This file records release and production issues that have already happened so future sessions can avoid repeating them.

## Cloudflare Pages Git disconnected warning

- What happened: Cloudflare Pages showed a Git disconnected warning during release work.
- Detection method: Pages dashboard warning and missing sync confidence.
- Root cause: Deployment state and repo state were not aligned.
- Prevention rule: Confirm production deployment state before reporting Done.
- Required validator/live check: Check the live custom domain after a confirmed deployment.

## Planned pages returning 200 or homepage content

- What happened: Planned routes temporarily returned 200 or homepage content before 404 behavior was fixed.
- Detection method: External live checks on planned URLs.
- Root cause: Planned routes were still reachable in production.
- Prevention rule: Planned pages must remain 404 until complete.
- Required validator/live check: Live 404 check for every planned URL.

## sitemap.xml custom-domain 500 after binding

- What happened: `sitemap.xml` returned 500 after domain binding.
- Detection method: Production fetch of `sitemap.xml`.
- Root cause: Domain binding and sitemap serving were not aligned.
- Prevention rule: Always check sitemap on the live custom domain after deployment.
- Required validator/live check: `curl` fetch of `https://aiapiops.com/sitemap.xml`.

## Bing title too long on /llm-observability/

- What happened: Bing flagged the `/llm-observability/` title as too long.
- Detection method: Search-engine validation / URL inspection feedback.
- Root cause: Title length exceeded accepted limits.
- Prevention rule: Keep titles concise and under the internal SEO threshold.
- Required validator/live check: SEO validator and live title length review.

## false positive "Version C" caused by "version control"

- What happened: A content check falsely matched "Version C" because it appeared inside ordinary text such as "version control".
- Detection method: Content scan false positive.
- Root cause: Over-broad pattern matching.
- Prevention rule: Use precise content checks and review matches in context.
- Required validator/live check: Scan rendered HTML and inspect surrounding text when a match is found.

## duplicate Quick Answer numbering caused by `<ol>` plus numeric badge

- What happened: Quick Answer items showed duplicate numbering in production.
- Detection method: External HTML fetch showed `1. 1`, `2. 2`, etc.
- Root cause: Ordered list markers and a visible numeric badge were both rendered.
- Prevention rule: Use only one numbering mechanism.
- Required validator/live check: Download production HTML and search for duplicate numbering patterns.

## production stale/cached content contradicting local dist

- What happened: Local `dist/` looked correct, but production still served old content.
- Detection method: Cache-busted production fetches revealed stale HTML.
- Root cause: Production cache or deployment state lagged behind local build output.
- Prevention rule: Treat production HTML as authoritative for release gating.
- Required validator/live check: Cache-busted live fetch of changed pages after deployment.

## external checks override local reports

- What happened: Local verification suggested success, but external production fetches contradicted it.
- Detection method: External fetches from the live domain.
- Root cause: Reliance on local output instead of live production.
- Prevention rule: Never report release completion until external production checks pass.
- Required validator/live check: Live custom-domain HTML fetches and scans.
