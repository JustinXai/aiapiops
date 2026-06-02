# SEO and Geo Rules for AI API Ops

## English-only content

AI API Ops is an English-language site. Do not add Chinese URLs or Chinese page copy.

## Page metadata requirements

Every public page must have:

- unique title
- unique meta description
- unique H1
- canonical URL
- AI Summary
- Quick Answer
- FAQ

## FAQ and summary requirements

- AI Summary should explain the page purpose in plain English.
- Quick Answer should be concise and useful.
- FAQ should answer the most likely operational questions.

## JSON-LD rules

- Breadcrumb JSON-LD must match the page hierarchy.
- FAQ JSON-LD must match visible FAQ content.
- Do not add structured data that contradicts visible content.

## Official vs third-party API wording

- Be explicit when a page refers to an official API, a third-party provider, or an aggregator.
- Do not imply official support where none is confirmed.
- Do not promise unsupported model availability.

## Media pricing freshness warnings

- Media generation pricing can change.
- Use wording like "check live model pricing" and "model availability can change".
- Media generation pricing may be per token, credit, second, image, video or async task.
- Failed generations and retries should be checked in request logs and provider dashboards.

## Model availability policy

- Do not make unsupported model availability promises.
- Do not say that every model is available.
- Do not say that Sora, Veo, Kling, Runway, or Seedance are always available through RutaAPI.
