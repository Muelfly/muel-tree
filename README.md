# Muel

`muel-tree` is the Vercel-hosted landing page and Activity surface for Muel.

## Landing Terms

- **Muel** — Bot
- **Gomdori** — Game, operated as a `Discord <-> Toss` experience
- **Weave** — App, operated as a `Discord <-> Toss` experience
- **Server** — Discord
- **Team** — updates and public-facing notices

## Current Routes

- `/` — Muel landing page
- `/weave` — Weave
- `/force` — force-layout test surface
- `/payment/success`, `/payment/fail` — Toss Payments return pages
- `/api/dreams` — read 세계수 graph data
- `/api/dreams/submit` — authenticated Discord Activity write endpoint
- `/api/discord/token` — Discord Activity OAuth token exchange

## Service Registry

Public service names, labels, routes, statuses, CTA links, and operating models live in `src/config/services.ts`. The landing page and navigation read from that registry so Muel / Gomdori / Weave / Server stay aligned before adding routes or bot commands.

## Deployments

- Web app: Vercel
- Bot entrypoint: Render, via the separate `muel-bot` repository

## Local Development

```bash
npm install
npm run dev
```
