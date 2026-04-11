# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint
- `npx prisma migrate dev` — apply schema changes to local SQLite
- `npx prisma studio` — inspect the local DB

## Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Prisma 6 on SQLite (`prisma/dev.db`). Note the warning in [AGENTS.md](AGENTS.md): this Next.js version has breaking changes vs. older training data — consult `node_modules/next/dist/docs/` before writing Next-specific code.

## Architecture

The app is an affiliate-review site (Shopee). Three domain models in [prisma/schema.prisma](prisma/schema.prisma):

- **Category** — product category, has many Articles
- **Article** — review post with `featuredImage`, `rating`, `pros`/`cons` (stored as JSON strings), `affiliateUrl`, `price`, `views`, `clicks`, `published` flag
- **ApiKey** — bearer tokens used by external automation (n8n) to write articles

### Public routes ([src/app/](src/app/))
- `/` — home
- `/category/[slug]` — category listing
- `/article/[slug]` — article detail
- `/admin` — admin UI

### API routes ([src/app/api/](src/app/api/))
- `articles/` and `articles/[id]/` — article CRUD
- `categories/` — category CRUD
- `click/[id]/` — affiliate click tracking (increments `Article.clicks`)

Write endpoints are gated by `validateApiKey` in [src/lib/auth.ts](src/lib/auth.ts), which checks a `Bearer` token against the `ApiKey` table. This is the integration point for n8n.

Prisma is accessed through the singleton in [src/lib/prisma.ts](src/lib/prisma.ts) — always import from there, do not instantiate `PrismaClient` directly.

Shared UI lives in [src/components/](src/components/) (`Header`, `Footer`, `ArticleCard`).
