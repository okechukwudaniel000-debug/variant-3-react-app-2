# Dynamic Subdomain Routing: Phased Implementation Plan

## Objective

Transition three application modules — Featured Devices, Reviews, and Contact Us — from the primary domain (`daniel-gadgets.com`) to dedicated subdomains (`featured.daniel-gadgets.com`, `reviews.daniel-gadgets.com`, `contact.daniel-gadgets.com`) using dynamic edge-level routing. The project is deployed on Vercel (production) with a Docker/nginx stack for local development.

---

## Phase 1: Architecture & Infrastructure

### 1.1 DNS Configuration

**Current state:** `nginx.conf` has explicit `server_name` blocks for `gadgets.local`, `daniel-gadgets.com`, `api.gadgets.local`, `api.daniel-gadgets.com`, `products.gadgets.local`, `products.daniel-gadgets.com`. No wildcard DNS record exists.

**Actions:**

1. Provision a wildcard DNS `A` record (`*.daniel-gadgets.com`) at the DNS provider targeting the server IP.
2. Keep the root domain `A` record intact.
3. For local dev, add `127.0.0.1` entries for `daniel-gadgets.com`, `featured.daniel-gadgets.com`, `reviews.daniel-gadgets.com`, `contact.daniel-gadgets.com`, and `api.daniel-gadgets.com` to `/etc/hosts`.
4. Validate DNS propagation with `dig` before proceeding.

**Dependencies:** DNS must precede SSL certificate issuance (1.2).

### 1.2 Wildcard SSL Certificate

**Current state:** `nginx.conf` listens on port 80 only. No SSL configuration exists.

**Actions:**

1. Obtain a wildcard certificate via DNS-01 challenge: `certbot certonly --manual --preferred-challenges dns -d daniel-gadgets.com -d '*.daniel-gadgets.com'`.
2. Store certs at `/etc/letsencrypt/live/daniel-gadgets.com/`.
3. Configure auto-renewal with a cron job and post-hook to reload nginx.
4. Add `listen 443 ssl http2` to the nginx catch-all block (see 1.3).
5. Add an HTTP-to-HTTPS redirect block on port 80.

### 1.3 Proxy & Edge Routing

**Current state:** `nginx.conf` has three separate `server` blocks (main, API, products). `proxy.ts` is the Next.js 16 middleware (CSP headers only). `docker-compose.yml` runs nginx + backend on separate services. Production deploys to Vercel.

**Actions:**

1. **Consolidate nginx into a single catch-all block** that proxies all subdomains to the Next.js app:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name daniel-gadgets.com *.daniel-gadgets.com;
       ssl_certificate /etc/letsencrypt/live/daniel-gadgets.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/daniel-gadgets.com/privkey.pem;
       location / {
           proxy_pass http://nextjs:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header X-Forwarded-Host $host;
       }
   }
   ```
2. **Update `docker-compose.yml`** — add a `nextjs` service on port 3000, remove the redundant `products` nginx block, update `ALLOWED_ORIGINS` to include all subdomains.
3. **For Vercel production** — configure the `vercel.json` or Vercel dashboard to handle wildcard subdomain routing. Next.js middleware (`proxy.ts`) will handle subdomain-to-path rewriting at the edge.
4. **Update `proxy.ts`** — extend it to handle subdomain rewriting (see Phase 2).

---

## Phase 2: Routing Logic

### 2.1 Subdomain Extraction & Mapping

**Actions:**

1. Add `getSubdomain(host)` to `proxy.ts` — extracts the first label from the hostname, returns `null` for the root domain.
2. Define the mapping:
   ```typescript
   const SUBDOMAIN_MAP: Record<string, string> = {
     featured: '/products',
     reviews: '/reviews',
     contact: '/contact',
   };
   ```
3. `api` and `www` subdomains are pass-throughs (no rewrite).

### 2.2 Middleware Rewrite Logic

**Current state:** `proxy.ts` only sets CSP headers. It does not rewrite URLs.

**Actions:**

1. After CSP logic, detect the subdomain and rewrite the URL:
   - `featured.daniel-gadgets.com/iphone-16` → internally rewrite to `/products/iphone-16`
   - Preserve query parameters and path suffixes.
   - Return `NextResponse.rewrite(rewrittenUrl)` for matched subdomains.
   - Return `NextResponse.next()` for the root domain and unmatched subdomains.
2. Update `config.matcher` to exclude `_next/static`, `_next/image`, `favicon.ico`, and API routes from rewriting.

### 2.3 Redirect Old Paths to Subdomains

**Current state:** `next.config.mjs` already has a redirect from `/products` → `/#products` (permanent). This must be replaced, not duplicated.

**Actions:**

1. Remove the existing `/products` → `/#products` redirect from `next.config.mjs`.
2. Add new 301 redirects in `next.config.mjs`:
   - `/products` → `https://featured.daniel-gadgets.com`
   - `/products/:path*` → `https://featured.daniel-gadgets.com/:path*`
   - `/reviews` → `https://reviews.daniel-gadgets.com`
   - `/reviews/:path*` → `https://reviews.daniel-gadgets.com/:path*`
   - `/contact` → `https://contact.daniel-gadgets.com`
   - `/contact/:path*` → `https://contact.daniel-gadgets.com/:path*`
3. Update navigation in `Chrome.jsx` (lines 80–82, 100+), `Footer.jsx` (lines 8–13, 15–26), `Hero.jsx`, `Products.jsx`, and `Reviews.jsx` to link to subdomain URLs instead of internal hash paths.

### 2.4 Unknown Subdomain Handling

**Actions:**

1. In `proxy.ts`, if the subdomain is not in `SUBDOMAIN_MAP` and is not `api`, `www`, or the root domain, redirect to `https://daniel-gadgets.com` with a 302.
2. Log unknown subdomain requests for monitoring.

---

## Phase 3: Data & Session Management

### 3.1 CORS

**Current state:** `server.js` already has regex-based CORS that matches `*.daniel-gadgets.com` via the pattern `/^https?:\/\/([a-z0-9-]+\.)*daniel-gadgets\.com$/`. This already covers the new subdomains.

**Actions:**

1. Update `ALLOWED_ORIGINS` in `docker-compose.yml` to include `https://featured.daniel-gadgets.com`, `https://reviews.daniel-gadgets.com`, `https://contact.daniel-gadgets.com`.
2. Update CSP `connect-src` in `proxy.ts` to include `https://api.daniel-gadgets.com`.
3. Add `Access-Control-Allow-Origin` headers to the Next.js API routes (`app/api/contact/route.js`, `app/api/reviews/route.js`, `app/api/newsletter/route.ts`) — validate the request `Origin` header against the allowed origins list and echo it back.
4. Handle `OPTIONS` preflight in each API route.

### 3.2 Authentication & Session Sharing

**Current state:** Auth is client-side only. `StoreProvider.tsx` stores user state in `localStorage` (key `dg_user`). There is no `next-auth` or server-side session. This means auth state does not naturally cross subdomains.

**Actions:**

1. **Migrate auth to cookie-based sessions** — set a `dg_auth` cookie with `domain=.daniel-gadgets.com` so it is accessible across all subdomains. The `StoreProvider` should read from this cookie on mount and sync to localStorage.
2. **On login**, set the cookie via a `Set-Cookie` header from the API response (or set it client-side with `document.cookie` including `domain=.daniel-gadgets.com; Secure; SameSite=Lax`).
3. **On subdomain navigation**, the cookie is automatically sent, and `StoreProvider` reads it to restore the user session.
4. **Logout** clears the cookie and localStorage entry.

### 3.3 Asset Sharing

**Actions:**

1. Use absolute URLs for cross-subdomain asset references.
2. Ensure `Content-Type` headers are correct for all static assets.
3. The Next.js `public` directory is served from the same origin, so assets load correctly on all subdomains.

### 3.4 API Architecture Clarification

**Decision required:** The project has two API layers:
- **Next.js API routes** (`app/api/contact/route.js`, `app/api/reviews/route.js`, `app/api/products/route.js`) — served by the Next.js app.
- **Express backend** (`fullstack/backend/server.js` on port 5000) — also serves `/api/products`, `/api/reviews`, `/api/contact`.

The plan should consolidate on one layer. **Recommended:** Use Next.js API routes exclusively (they are already in the app and handle CORS). Deprecate the Express backend or keep it only for the legacy `gadgets.html` page. This simplifies the architecture and eliminates the need for a separate `api.daniel-gadgets.com` nginx block.

---

## Phase 4: Deployment & Testing

### 4.1 Staging Environment

**Actions:**

1. Provision wildcard DNS for `*.staging.daniel-gadgets.com`.
2. Obtain a staging SSL certificate.
3. Deploy to staging using `docker-compose` with updated environment variables.
4. Verify all subdomains resolve and serve the correct content.

### 4.2 Validation & Testing

1. **Routing accuracy** — visit each subdomain and verify correct content renders.
2. **Path preservation** — verify `featured.daniel-gadgets.com/iphone-16` rewrites to `/products/iphone-16`.
3. **Redirects** — verify old paths (`/products`, `/reviews`, `/contact`) 301-redirect to subdomains.
4. **Auth sharing** — log in on the main domain, navigate to a subdomain, verify session persists.
5. **CORS** — submit a review or contact form from a subdomain page; verify the API call succeeds with no CORS errors.
6. **Asset loading** — verify all images, CSS, and JS load without 404s on every subdomain.
7. **SSL** — verify the wildcard certificate is served correctly using `openssl s_client`.
8. **Automated tests** — write Vitest tests for `getSubdomain()` and middleware rewrite logic; run `npm run test`.

### 4.3 Production Rollout

1. Deploy to production with all changes.
2. Migrate links incrementally: Contact Us → Reviews → Featured Devices, monitoring for 24–48 hours between each.
3. Verify Google Search Console for crawl errors.
4. Submit new subdomains for indexing.

### 4.4 Rollback Plan

1. Revert navigation links to original paths.
2. Remove subdomain mapping entries from `proxy.ts` to cause all subdomain traffic to fall through to the main domain.
3. DNS wildcard record removal is a last resort.

---

## Open Questions

1. **API consolidation** — Should the Express backend be deprecated in favor of Next.js API routes? This affects whether `api.daniel-gadgets.com` needs its own infrastructure.
2. **Auth migration** — Converting from localStorage to cookie-based auth is a behavioral change. Is this acceptable?
3. **Vercel wildcard subdomains** — Vercel supports wildcard subdomains in project settings. Is this already configured?
4. **Legacy `gadgets.html`** — The legacy file has its own subdomain detection logic. Does it need updating for the new subdomain structure?

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Wildcard DNS misconfiguration | High | Medium | Validate with `dig` before deploying |
| SSL certificate expiry | Critical | Low | Automate renewal; monitor expiry |
| CORS blocks API calls from subdomains | High | Medium | Test CORS on staging; existing regex already covers `*.daniel-gadgets.com` |
| Auth state lost on subdomain navigation | High | Medium | Migrate to cookie-based auth with `.daniel-gadgets.com` domain |
| Middleware rewrite breaks static assets | Medium | Low | Exclude `_next/static`, `_next/image`, `favicon.ico` from matcher |
| Unknown subdomains cause errors | Low | Low | Catch-all redirect to main domain |

---

## Validation Checklist

- [ ] Wildcard DNS record for `*.daniel-gadgets.com` is active and resolvable
- [ ] Wildcard SSL certificate is installed and valid on nginx
- [ ] nginx catch-all block proxies all subdomains to Next.js
- [ ] `proxy.ts` middleware extracts subdomains and rewrites URLs correctly
- [ ] `featured.daniel-gadgets.com` serves `/products` content
- [ ] `reviews.daniel-gadgets.com` serves `/reviews` content
- [ ] `contact.daniel-gadgets.com` serves `/contact` content
- [ ] 301 redirects from old paths work (replacing existing `/products` → `/#products`)
- [ ] Auth cookie is shared across all subdomains
- [ ] CORS headers allow requests from all subdomains
- [ ] CSP `connect-src` allows API subdomain connections
- [ ] All static assets load correctly on all subdomains
- [ ] Vitest tests pass for subdomain extraction and routing logic
- [ ] Staging environment validated end-to-end
- [ ] Production rollout proceeds incrementally with monitoring
- [ ] Google Search Console updated with new subdomains
- [ ] Rollback plan documented and tested
