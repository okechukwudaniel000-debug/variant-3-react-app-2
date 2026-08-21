# Subdomain Routing Rollback Runbook

**Trigger:** Any module (Featured, Reviews, Contact) exhibits critical issues in production after rollout.

**Time Target:** Complete rollback within the monitoring window (24–48 hours per module).

---

## Rollback Procedure

### Level 1 — Revert navigation links (fastest)

**Impact:** Users clicking nav links are sent to internal paths instead of subdomains. Subdomain traffic still works but is no longer discoverable from the main site.

**Steps:**

1. Revert `MENU_LINKS` in all page components to internal paths:
   - `app/page.js:9-15` → restore `/products`, `/reviews`, `/#contact` etc.
   - `app/products/page.js:13-19` → restore internal paths
   - `app/products/[id]/page.js:12-18` → restore internal paths
   - `app/login/page.js:10-14` → restore internal paths

2. Revert component links:
   - `components/Footer.jsx` → restore internal paths in `SHOP_LINKS`, `COMPANY_LINKS`, `SUPPORT_LINKS`
   - `components/Hero.jsx:202` → restore `/#products` or `/products`
   - `components/Products.jsx:123` → restore `/products/${product.id}`

3. Commit and deploy.

**Verification:** Nav links on main domain point to internal paths. Subdomain pages still accessible directly.

---

### Level 2 — Disable middleware rewriting (if Level 1 insufficient)

**Impact:** Subdomain traffic falls through to the Next.js app root. Old internal paths continue to work. 301 redirects in `next.config.mjs` should also be reverted.

**Steps:**

1. Revert `proxy.ts` subdomain mapping:
   - Remove or comment out `SUBDOMAIN_MAP` entries (`proxy.ts:5-9`)
   - Remove or comment out the subdomain rewrite block (`proxy.ts:55-63`)
   - Remove or comment out the unknown subdomain redirect (`proxy.ts:62`)
   - Keep CSP nonce logic intact

2. Revert `next.config.mjs` redirects:
   - Remove the 301 redirect rules for `/products`, `/reviews`, `/contact` (`next.config.mjs:39-72`)
   - If a legacy `/products` → `/#products` redirect existed, restore it here

3. Commit and deploy.

**Verification:**
- `featured.daniel-gadgets.com` serves the root page (no rewrite)
- `reviews.daniel-gadgets.com` serves the root page
- `contact.daniel-gadgets.com` serves the root page
- `/products`, `/reviews`, `/contact` on main domain serve content normally (no 301)
- `api.daniel-gadgets.com` continues to work

---

### Level 3 — DNS wildcard removal (last resort)

**Impact:** All subdomains stop resolving. Only `daniel-gadgets.com` and `www.daniel-gadgets.com` work.

**Steps:**

1. Log into DNS provider console.
2. Delete the `*.daniel-gadgets.com` wildcard `A` record.
3. Keep the root domain `A` record intact.
4. Optionally remove SSL certificate for wildcard domain to avoid certificate warnings.

**Verification:**
```bash
dig +short featured.daniel-gadgets.com  # should return NXDOMAIN or no answer
dig +short daniel-gadgets.com          # should still return server IP
```

---

## Quick Reference: Files to Revert

| File | Changes to Revert |
|------|-------------------|
| `proxy.ts` | Remove `SUBDOMAIN_MAP` (lines 5-9), remove subdomain rewrite block (lines 55-63), remove unknown redirect (line 62) |
| `next.config.mjs` | Remove 301 redirect rules (lines 39-72) |
| `app/page.js` | Revert `MENU_LINKS` to internal paths (lines 9-15) |
| `app/products/page.js` | Revert `MENU_LINKS` (lines 13-19) |
| `app/products/[id]/page.js` | Revert `MENU_LINKS` (lines 12-18) |
| `app/login/page.js` | Revert `MENU_LINKS` (lines 10-14) |
| `components/Footer.jsx` | Revert `SHOP_LINKS`, `COMPANY_LINKS`, `SUPPORT_LINKS` to internal paths |
| `components/Hero.jsx` | Revert `scrollToProducts` destination (line 202) |
| `components/Products.jsx` | Revert product link href (line 123) |

---

## Git Commands for Rollback

```bash
# Revert all subdomain-related changes in one commit
git revert <commit-hash-of-subdomain-rollout> --no-commit
git reset HEAD   # stage reverted files
git add proxy.ts next.config.mjs app/page.js app/products/page.js \
      app/products/[id]/page.js app/login/page.js \
      components/Footer.jsx components/Hero.jsx components/Products.jsx
git commit -m "rollback: disable subdomain routing"

# Or revert individual files
git checkout HEAD~1 -- proxy.ts next.config.mjs
```

---

## Monitoring Checklist (During Rollback Window)

- [ ] Error rate in production logs (check for 5xx spikes)
- [ ] SSL certificate validity on subdomains
- [ ] API response times from subdomain pages
- [ ] Auth session persistence across subdomains
- [ ] Browser console CSP violations
- [ ] Google Search Console crawl errors

---

## Escalation

If rollback fails or issues persist after Level 2:
1. Escalate to infrastructure team for DNS-level intervention.
2. Contact Vercel support if wildcard subdomain configuration is the root cause.
3. Notify stakeholders within 2 hours of incident declaration.
