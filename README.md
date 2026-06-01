# AI API Ops

Independent developer guides for building and operating AI app workflows with fewer API surprises.

## Tech stack

- **Astro** (static site, SSG)
- **TypeScript**
- **Tailwind CSS** (v3)
- **Cloudflare Pages** (deployment)

## Getting started

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Verification

```bash
npm run verify
```

This runs all checks: build, public pages count, content quality, link validation, banned claims, SEO, and JSON-LD.

## Pages

- `/` — Homepage
- `/mcp-server-chatgpt/` — MCP Server for ChatGPT guide
- `/mcp-registry/` — MCP Registry Trust guide
- `/llm-observability/` — LLM Observability guide

## Cloudflare Pages

Build command: `npm run build`
Output directory: `dist`
