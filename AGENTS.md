# AI API Ops

AI API Ops is an English-language developer site for operating AI agents and media APIs with fewer cost surprises.

## Current project state

- Current public pages live on the production site:
  - `/`
  - `/mcp-server-chatgpt/`
  - `/mcp-registry/`
  - `/llm-observability/`
  - `/openclaw-openrouter/`
  - `/claude-code-token-cost/`
  - `/claude-fable-5-api/`
  - `/video-generation-api-pricing/`
- Phase 1.1 is the current public release line.
- Planned pages must remain planned until they are complete, reviewed, and explicitly moved into public routing.
- The homepage must keep the A · Ops Terminal feel.

## Public URL list

- https://aiapiops.com/
- https://aiapiops.com/mcp-server-chatgpt/
- https://aiapiops.com/mcp-registry/
- https://aiapiops.com/llm-observability/
- https://aiapiops.com/openclaw-openrouter/
- https://aiapiops.com/claude-code-token-cost/
- https://aiapiops.com/claude-fable-5-api/
- https://aiapiops.com/video-generation-api-pricing/

## Current positioning

AI API Ops covers MCP, Agent API Usage, Media APIs, Credits and LLM Observability.

## CTA policy

Use only these CTA URLs in public pages and related content:

- https://app.rutaapi.com/register?lng=en
- https://app.rutaapi.com/pricing

Do not change CTA URLs unless explicitly approved.

## Current stack

- Astro
- TypeScript
- Tailwind CSS
- Cloudflare Pages

## Cloudflare Pages deployment notes

- Production must be checked on the live custom domain, not only on `dist/`.
- Cache-busted fetches and downloaded HTML are required for release verification.
- A successful local build does not mean the release gate has passed.
- If production HTML disagrees with `dist/`, treat production as authoritative for release gating and investigate cache or deployment state.
