# API Architecture Consolidation Decision

**Date:** 2026-08-21
**Status:** Decided
**Decision Maker:** Engineering team (per plan Task 3.4)

## Decision

Use **Next.js API routes (`app/api/*`)** as the primary and exclusive API layer for all new and existing features.

Retain the **Express backend (`fullstack/backend/server.js`)** only for serving the legacy `legacy/gadgets.html` static page. No new features should be added to the Express backend.

## Rationale

1. **Simplified architecture** — Eliminates the need for a separate `api.daniel-gadgets.com` nginx block and reduces service count in `docker-compose.yml`.
2. **Unified deployment** — Next.js API routes deploy with the frontend, removing cross-service CORS complexity for internal calls.
3. **Edge compatibility** — Next.js API routes work seamlessly with Vercel edge functions and the `proxy.ts` middleware.
4. **Type safety** — Next.js API routes support TypeScript natively, whereas the Express backend uses plain Node.js.
5. **Maintenance** — One API layer to test, monitor, and secure.

## Scope

| Layer | Status | Purpose |
|-------|--------|---------|
| `app/api/contact/route.js` | Active | Contact form relay |
| `app/api/reviews/route.js` | Active | Reviews data |
| `app/api/newsletter/route.ts` | Active | Newsletter subscription |
| `app/api/products/route.js` | Active | Product catalog |
| `app/api/products/[id]/route.js` | Active | Single product detail |
| `fullstack/backend/server.js` | Legacy only | Serves `legacy/gadgets.html` |

## Migration Path

- All new API endpoints go in `app/api/`.
- Existing Express routes that serve HTML (`gadgets.html`) remain in `fullstack/backend/server.js`.
- If `legacy/gadgets.html` is ever retired, the Express backend service can be removed from `docker-compose.yml` entirely.

## CORS Impact

Since Next.js API routes are same-origin with the frontend (subdomain traffic is rewritten internally by `proxy.ts`), CORS is only needed for cross-origin scenarios. The `withCors` wrapper in `lib/cors.ts` handles this for all `app/api/*` routes.
