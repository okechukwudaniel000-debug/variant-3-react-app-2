# Dynamic Subdomain Routing: Implementation Strategy

## Objective

Transition Featured Devices, Reviews, and Contact Us from `daniel-gadgets.com` to dedicated subdomains (`featured.daniel-gadgets.com`, `reviews.daniel-gadgets.com`, `contact.daniel-gadgets.com`) using dynamic edge-level routing via Next.js 16 middleware (`proxy.ts`), nginx reverse proxy (local dev), and Docker Compose.

---

## Task Breakdown

### Phase 1: Architecture & Infrastructure

#### Task 1.1 — Provision Wildcard DNS Record
- **Action:** Create a wildcard `A` record (`*.daniel-gadgets.com`) at the DNS provider pointing to the server IP. Keep the root domain `A` record intact.
- **Resources:** DNS provider console (Route53, Cloudflare, or equivalent); `dig`/`nslookup` for validation.
- **Dependencies:** None.
- **Milestone:** DNS propagates; `dig +short *.daniel-gadgets.com` returns the server IP.

#### Task 1.2 — Obtain Wildcard SSL Certificate
- **Action:** Run `certbot certonly --manual --preferred-challenges dns -d daniel-gadgets.com -d '*.daniel-gadgets.com'`. Store certs at `/etc/letsencrypt/live/daniel-gadgets.com/`. Configure auto-renewal cron job with nginx reload hook.
- **Resources:** `certbot`, DNS provider API access (for automated DNS-01 challenge), cron/systemd timer.
- **Dependencies:** Task 1.1 (DNS must resolve first).
- **Milestone:** Certificate files exist at `/etc/letsencrypt/live/daniel-gadgets.com/`; auto-renewal tested with `certbot renew --dry-run`.

#### Task 1.3 — Configure nginx Catch-All Proxy
- **Action:** Replace the three existing `server` blocks in `nginx.conf` with a single catch-all block that listens on 443 SSL and proxies all subdomains to the Next.js app. Add an HTTP-to-HTTPS redirect block on port 80.
- **Resources:** `nginx.conf`, `docker-compose.yml`, Docker.
- **Dependencies:** Tasks 1.1, 1.2.
- **Milestone:** `nginx -t` passes; `docker-compose up` starts with the new config; all subdomains proxy to Next.js.

#### Task 1.4 — Update docker-compose.yml
- **Action:** Add a `nextjs` service running the Next.js app on port 3000. Remove the redundant `products` nginx server block reference. Update `ALLOWED_ORIGINS` in the backend environment to include all subdomains. Ensure `nextjs` depends on `backend`.
- **Resources:** `docker-compose.yml`, Docker, backend service.
- **Dependencies:** Task 1.3.
- **Milestone:** `docker-compose up` runs all three services (nginx, nextjs, backend) without errors.

#### Task 1.5 — Configure Vercel Wildcard Subdomains (Production)
- **Action:** In the Vercel dashboard, configure the project to accept wildcard subdomain requests. Ensure the `vercel.json` or project settings route all subdomains to the Next.js deployment. The `proxy.ts` middleware will handle subdomain-to-path rewriting at the edge.
- **Resources:** Vercel dashboard, `vercel.json` (if present).
- **Dependencies:** Task 1.1 (DNS wildcard record must be active).
- **Milestone:** Vercel deployment responds to `*.daniel-gadgets.com` requests.

---

### Phase 2: Routing Logic

#### Task 2.1 — Implement Subdomain Extraction in proxy.ts
- **Action:** Add a `getSubdomain(host)` function to `proxy.ts` that extracts the first label from the hostname. Define `SUBDOMAIN_MAP` mapping `featured` → `/products`, `reviews` → `/reviews`, `contact` → `/contact`. Treat `api`, `www`, and the root domain as pass-throughs.
- **Resources:** `proxy.ts` (existing file), TypeScript.
- **Dependencies:** Task 1.3 (nginx catch-all must be in place).
- **Milestone:** `getSubdomain('featured.daniel-gadgets.com')` returns `'featured'`; `getSubdomain('daniel-gadgets.com')` returns `null`.

#### Task 2.2 — Add Middleware Rewrite Logic to proxy.ts
- **Action:** After the existing CSP header logic, add subdomain detection and URL rewriting: clone the request URL, prepend the mapped internal path to the pathname, and return `NextResponse.rewrite(rewrittenUrl)`. For unmatched subdomains, return `NextResponse.next()`. Preserve query parameters and path suffixes.
- **Resources:** `proxy.ts`, Next.js `NextResponse`.
- **Dependencies:** Task 2.1.
- **Milestone:** `featured.daniel-gadgets.com/iphone-16` internally rewrites to `/products/iphone-16` with query params preserved.

#### Task 2.3 — Update Middleware Matcher in proxy.ts
- **Action:** Ensure the `config.matcher` excludes `_next/static`, `_next/image`, `favicon.ico`, and API routes from subdomain rewriting. The API subdomain (`api.daniel-gadgets.com`) must not be rewritten so API routes function correctly.
- **Resources:** `proxy.ts`.
- **Dependencies:** Task 2.2.
- **Milestone:** Static assets and API routes are not affected by subdomain rewriting.

#### Task 2.4 — Replace /products Redirect and Add Subdomain Redirects in next.config.mjs
- **Action:** Remove the existing `/products` → `/#products` redirect from `next.config.mjs`. Add 301 redirects for `/products`, `/products/:path*`, `/reviews`, `/reviews/:path*`, `/contact`, `/contact/:path*` to their respective subdomain URLs.
- **Resources:** `next.config.mjs`.
- **Dependencies:** Task 2.2 (rewriting must work before redirects are added).
- **Milestone:** `curl -I https://daniel-gadgets.com/products` returns 301 with `Location: https://featured.daniel-gadgets.com`.

#### Task 2.5 — Update Navigation Links in Components
- **Action:** Update `Chrome.jsx`, `Footer.jsx`, `Hero.jsx`, `Products.jsx`, and `Reviews.jsx` to link to subdomain URLs (`https://featured.daniel-gadgets.com`, `https://reviews.daniel-gadgets.com`, `https://contact.daniel-gadgets.com`) instead of internal hash paths.
- **Resources:** `components/Chrome.jsx`, `components/Footer.jsx`, `components/Hero.jsx`, `components/Products.jsx`, `components/Reviews.jsx`.
- **Dependencies:** Task 2.4.
- **Milestone:** All navigation links on the main domain point to subdomain URLs.

#### Task 2.6 — Handle Unknown Subdomains
- **Action:** In `proxy.ts`, if the subdomain is not in `SUBDOMAIN_MAP` and is not `api`, `www`, or the root domain, redirect to `https://daniel-gadgets.com` with a 302. Log unknown subdomain requests for monitoring.
- **Resources:** `proxy.ts`.
- **Dependencies:** Task 2.2.
- **Milestone:** `https://unknown.daniel-gadgets.com` redirects to `https://daniel-gadgets.com`.

---

### Phase 3: Data & Session Management

#### Task 3.1 — Update CORS Configuration
- **Action:** Update `ALLOWED_ORIGINS` in `docker-compose.yml` to include `https://featured.daniel-gadgets.com`, `https://reviews.daniel-gadgets.com`, `https://contact.daniel-gadgets.com`. The existing `server.js` CORS regex already covers `*.daniel-gadgets.com`, so no code change is needed there. Add `Access-Control-Allow-Origin` headers to the Next.js API routes (`app/api/contact/route.js`, `app/api/reviews/route.js`, `app/api/newsletter/route.ts`) that dynamically validate the request `Origin` header. Handle `OPTIONS` preflight in each route.
- **Resources:** `docker-compose.yml`, `app/api/contact/route.js`, `app/api/reviews/route.js`, `app/api/newsletter/route.ts`.
- **Dependencies:** Task 1.4.
- **Milestone:** API calls from subdomain pages succeed with correct CORS headers.

#### Task 3.2 — Update CSP connect-src Directive
- **Action:** In `proxy.ts`, add `https://api.daniel-gadgets.com` to the `connect-src` CSP directive so that subdomain pages can make API calls.
- **Resources:** `proxy.ts`.
- **Dependencies:** None.
- **Milestone:** Browser console shows no CSP violations for API connections from subdomain pages.

#### Task 3.3 — Migrate Auth to Cookie-Based Sessions
- **Action:** Modify `StoreProvider.tsx` to read/write auth state from a `dg_auth` cookie with `domain=.daniel-gadgets.com; Secure; SameSite=Lax`. On login, set the cookie. On mount, read the cookie to restore session. On logout, clear the cookie and localStorage.
- **Resources:** `components/StoreProvider.tsx`, `components/Chrome.jsx` (login form).
- **Dependencies:** Task 1.3 (catch-all proxy must be in place for cookies to work across subdomains).
- **Milestone:** Logging in on `daniel-gadgets.com` persists the session when navigating to `featured.daniel-gadgets.com`.

#### Task 3.4 — Consolidate API Architecture
- **Action:** Decide whether to use Next.js API routes exclusively or keep the Express backend. **Recommended:** Use Next.js API routes (`app/api/*`) as the primary API layer. Keep the Express backend (`fullstack/backend/server.js`) only for the legacy `gadgets.html` page. This eliminates the need for a separate `api.daniel-gadgets.com` nginx block and simplifies the architecture.
- **Resources:** `app/api/*`, `fullstack/backend/server.js`, `legacy/gadgets.html`.
- **Dependencies:** Task 1.4.
- **Milestone:** API architecture is consolidated; one decision documented.

---

### Phase 4: Deployment & Testing

#### Task 4.1 — Set Up Staging Environment
- **Action:** Provision wildcard DNS for `*.staging.daniel-gadgets.com`. Obtain a staging SSL certificate. Deploy the application to staging using `docker-compose` with updated environment variables (`ALLOWED_ORIGINS` includes `https://*.staging.daniel-gadgets.com`).
- **Resources:** DNS provider, SSL certificate, Docker, staging server.
- **Dependencies:** Tasks 1.1–1.5, 2.1–2.6, 3.1–3.4.
- **Milestone:** Staging environment is live with all subdomains resolving.

#### Task 4.2 — Write Vitest Tests for Routing Logic
- **Action:** Write unit tests for `getSubdomain()` and middleware rewrite logic. Test cases: `getSubdomain('featured.daniel-gadgets.com')` → `'featured'`, `getSubdomain('daniel-gadgets.com')` → `null`, `getSubdomain('api.daniel-gadgets.com')` → `'api'`, unknown subdomain → redirect. Write integration tests verifying the middleware rewrite behavior for each subdomain.
- **Resources:** `vitest.config.ts`, `test/` directory, Vitest.
- **Dependencies:** Task 2.1.
- **Milestone:** All Vitest tests pass (`npm run test`).

#### Task 4.3 — Execute Validation Test Suite
- **Action:** Run the following tests against the staging environment:
  1. Routing accuracy: visit each subdomain, verify correct content.
  2. Path preservation: `featured.staging.daniel-gadgets.com/iphone-16` renders product detail.
  3. Redirects: old paths 301-redirect to subdomains.
  4. Auth sharing: login on main domain, verify session on subdomains.
  5. CORS: submit a review/contact form from a subdomain; verify API call succeeds.
  6. Asset loading: verify all images/CSS/JS load without 404s.
  7. SSL: verify wildcard certificate with `openssl s_client`.
- **Resources:** Browser, `curl`, `openssl`, staging environment.
- **Dependencies:** Task 4.1, 4.2.
- **Milestone:** All validation tests pass on staging.

#### Task 4.4 — Production Rollout (Incremental)
- **Action:** Deploy to production. Migrate links incrementally: Contact Us (least critical) → Reviews → Featured Devices. Monitor logs, error reporting, and analytics for 24–48 hours between each migration step.
- **Resources:** Production deployment pipeline, monitoring/alerting tools.
- **Dependencies:** Task 4.3.
- **Milestone:** All three modules are live on their subdomains in production.

#### Task 4.5 — Post-Migration Verification
- **Action:** Verify Google Search Console for crawl errors. Confirm 301 redirects from old paths work. Submit new subdomains for indexing. Run the full validation test suite against the production domain.
- **Resources:** Google Search Console, `curl`, browser.
- **Dependencies:** Task 4.4.
- **Milestone:** All subdomains indexed; no crawl errors; old-path redirects working.

#### Task 4.6 — Rollback Plan Execution (if needed)
- **Action:** If any module exhibits issues: (1) revert navigation links to original paths, (2) remove subdomain mapping entries from `proxy.ts` so subdomain traffic falls through to the main domain, (3) DNS wildcard removal is a last resort.
- **Resources:** Git revert, DNS provider console.
- **Dependencies:** Task 4.4 (only if issues are discovered).
- **Milestone:** Rollback completed within the monitoring window.

---

## Timeline & Milestones

| # | Milestone | Depends On | Key Deliverable |
|---|-----------|-----------|-----------------|
| M1 | DNS wildcard active | — | `dig +short *.daniel-gadgets.com` returns server IP |
| M2 | SSL certificate installed | M1 | Cert files at `/etc/letsencrypt/live/daniel-gadgets.com/` |
| M3 | nginx catch-all proxy working | M2 | `nginx -t` passes; all subdomains proxy to Next.js |
| M4 | Docker compose with nextjs service running | M3 | `docker-compose up` runs all services |
| M5 | Vercel wildcard subdomains configured | M1 | Vercel responds to `*.daniel-gadgets.com` |
| M6 | Subdomain extraction & mapping implemented | M3 | `getSubdomain()` returns correct values |
| M7 | Middleware rewrite logic working | M6 | `featured.daniel-gadgets.com/iphone-16` → `/products/iphone-16` |
| M8 | Old-path redirects replaced with subdomain redirects | M7 | `/products` → 301 → `featured.daniel-gadgets.com` |
| M9 | Navigation links updated to subdomain URLs | M8 | All nav links point to subdomains |
| M10 | Unknown subdomain handling active | M7 | Unknown subdomains redirect to main domain |
| M11 | CORS & CSP updated for subdomains | M4 | API calls from subdomains succeed |
| M12 | Auth cookie shared across subdomains | M3, M11 | Login persists across subdomains |
| M13 | API architecture consolidated | M4 | Decision documented; one API layer active |
| M14 | Staging environment validated | M11, M12, M13 | All staging tests pass |
| M15 | Vitest tests passing | M7 | `npm run test` green |
| M16 | Production rollout complete | M14, M15 | All modules live on subdomains |
| M17 | Post-migration verification done | M16 | No crawl errors; redirects working |

---

## Resources & Tools

| Resource | Used In | Purpose |
|----------|---------|---------|
| DNS provider console | 1.1 | Provision wildcard `A` record |
| `certbot` | 1.2 | Obtain and renew wildcard SSL certificate |
| `nginx` | 1.3 | Reverse proxy and SSL termination |
| Docker / Docker Compose | 1.4, 4.1 | Containerized deployment |
| Vercel dashboard | 1.5 | Production wildcard subdomain config |
| `proxy.ts` | 2.1–2.6, 3.2 | Next.js middleware for CSP + subdomain routing |
| `next.config.mjs` | 2.4 | Redirect rules |
| `docker-compose.yml` | 1.4, 3.1 | Service orchestration and CORS config |
| `StoreProvider.tsx` | 3.3 | Auth cookie migration |
| `app/api/*/route.js` | 3.1 | CORS headers on API routes |
| Vitest | 4.2 | Automated test suite |
| `curl` / `openssl` | 4.3 | Validation and SSL testing |
| Google Search Console | 4.5 | Post-migration SEO verification |

---

## Risk Register

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|------------|------------|
| R1 | Wildcard DNS misconfiguration | High | Medium | Validate with `dig` before deploying; use DNS provider API for programmatic validation |
| R2 | SSL certificate expiry causes outage | Critical | Low | Automate renewal with certbot cron; monitor expiry with alerting |
| R3 | CORS blocks API calls from subdomains | High | Low | Existing `server.js` regex already covers `*.daniel-gadgets.com`; test on staging |
| R4 | Auth state lost on subdomain navigation | High | Medium | Migrate to cookie-based auth with `.daniel-gadgets.com` domain (Task 3.3) |
| R5 | Middleware rewrite breaks static assets | Medium | Low | Matcher excludes `_next/static`, `_next/image`, `favicon.ico` (Task 2.3) |
| R6 | Unknown subdomains cause unexpected behavior | Low | Low | Catch-all redirect to main domain (Task 2.6) |
| R7 | Existing `/products` → `/#products` redirect conflicts with new 301 | High | Medium | Remove old redirect before adding new one (Task 2.4) |
| R8 | Vercel wildcard subdomains not configured | High | Medium | Configure in Vercel dashboard before production rollout (Task 1.5) |
| R9 | Legacy `gadgets.html` has hardcoded subdomain logic | Medium | Medium | Audit and update `legacy/gadgets.html` subdomain detection (Task 3.4) |
| R10 | Two API layers (Next.js + Express) cause confusion | Medium | Medium | Consolidate on Next.js API routes (Task 3.4) |

---

## Open Questions

1. **API consolidation** — Should the Express backend (`fullstack/backend/server.js`) be deprecated in favor of Next.js API routes? This affects whether `api.daniel-gadgets.com` needs its own infrastructure.
2. **Auth migration** — Converting from localStorage to cookie-based auth is a behavioral change. Is this acceptable to the team?
3. **Vercel wildcard subdomains** — Is the Vercel project already configured to accept wildcard subdomain requests?
4. **Legacy `gadgets.html`** — The legacy file has its own subdomain detection logic. Does it need updating for the new subdomain structure?
5. **CDN configuration** — If a CDN is in use, does it need to be updated to serve assets consistently across all subdomains?

---

## Validation Checklist

- [ ] Wildcard DNS record for `*.daniel-gadgets.com` is active and resolvable (M1)
- [ ] Wildcard SSL certificate is installed and valid on nginx (M2)
- [ ] nginx catch-all block proxies all subdomains to Next.js (M3)
- [ ] Docker compose with nextjs service runs without errors (M4)
- [ ] Vercel wildcard subdomains configured for production (M5)
- [ ] `proxy.ts` extracts subdomains and maps to internal paths (M6)
- [ ] Middleware rewrites subdomain URLs to internal paths preserving query params (M7)
- [ ] Old `/products` redirect replaced with subdomain 301 redirects (M8)
- [ ] Navigation links in Chrome.jsx, Footer.jsx, Hero.jsx, Products.jsx, Reviews.jsx updated (M9)
- [ ] Unknown subdomains redirect to main domain (M10)
- [ ] CORS headers allow requests from all subdomains (M11)
- [ ] CSP `connect-src` allows API subdomain connections (M11)
- [ ] Auth cookie shared across all subdomains (M12)
- [ ] API architecture consolidated (M13)
- [ ] Staging environment validated end-to-end (M14)
- [ ] Vitest tests pass for subdomain extraction and routing logic (M15)
- [ ] Production rollout proceeds incrementally with monitoring (M16)
- [ ] Google Search Console updated; no crawl errors (M17)
- [ ] Rollback plan documented and tested (M16 contingency)
