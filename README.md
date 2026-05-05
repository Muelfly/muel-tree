# Muel

`muel-tree` is the Vercel-hosted landing page and Activity surface for Muel.

## Landing Terms

- **Muel** — Bot
- **Gomdori** — Game
- **Weave** — App
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

## Product Registry

Landing labels live in `src/config/apps.ts`. Keep public names aligned with the landing page before adding routes or bot commands.

## Deployments

- Web app: Vercel
- Bot entrypoint: Render, via the separate `muel-bot` repository

## Local Development

```bash
npm install
npm run dev
```
