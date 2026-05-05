# Muel Web App

`muel-tree` is the Vercel-hosted web app for the Muel Platform.

## Terms

- **Muel Platform**: the overall brand and product system.
- **Muel Web App**: this repository, deployed on Vercel.
- **Hub**: `/`, the public landing page and product list.
- **Activity**: a Discord Activity route inside this app, such as `/weave`.
- **Mini App**: a Toss App in Toss service that can point to a matching product experience.
- **Product**: an individual service such as Muel, Black or White, or 세계수.
- **Muel Discord Bot**: the separate `muel-bot` repository, deployed on Render.

## Current Routes

- `/` — Hub
- `/weave` — 세계수 Activity
- `/force` — force-layout test surface
- `/payment/success`, `/payment/fail` — Toss Payments return pages
- `/api/dreams` — read 세계수 graph data
- `/api/dreams/submit` — authenticated Discord Activity write endpoint
- `/api/discord/token` — Discord Activity OAuth token exchange

## Product Registry

Product labels and routes live in `src/config/apps.ts`. Add new products there first, then add the matching route.

## Deployments

- Web app: Vercel
- Bot entrypoint: Render, via the separate `muel-bot` repository

## Local Development

```bash
npm install
npm run dev
```
