# Dynamic Subdomain Routing: Phased Implementation Plan

## Objective

This document outlines a phased plan to architect and implement a dynamic subdomain routing system. The goal is to transition specific application modules—Featured Devices, Reviews, and Contact Us—from the primary domain to dedicated subdomains (`featured.`, `reviews.`, `contact.`).

---

## Phase 1: Architecture & Infrastructure

This phase focuses on establishing the foundational infrastructure required to handle requests for multiple subdomains and route them to the single Next.js application.

### 1.1. DNS Configuration

-   **Requirement:** A wildcard DNS record must be configured to direct traffic from any subdomain of your primary domain to your application server(s).
-   **Action:**
    1.  Access your DNS provider's management console.
    2.  Create a wildcard `A` record or `CNAME` record:
        -   **Type:** `A` or `CNAME`
        -   **Name/Host:** `*` (e.g., `*.yourdomain.com`)
        -   **Value/Target:**
            -   For an `A` record, use the IP address of your server/load balancer.
            -   For a `CNAME` record, use the hostname of your hosting provider (e.g., `cname.vercel-dns.com` or your load balancer's DNS name).
    -   **Note:** You will also need an `A` record or `CNAME` for the root domain (`@` or `yourdomain.com`).

### 1.2. Wildcard SSL Certificate

-   **Requirement:** To serve traffic securely over HTTPS, a wildcard SSL certificate is necessary to cover all potential subdomains.
-   **Action:**
    1.  **Automated (Recommended):** Use a service like Let's Encrypt with a client such as `certbot`. The `dns-01` challenge is typically required for wildcard certificates, which involves creating a `TXT` record in your DNS to prove domain ownership.
    2.  **Cloud Provider:** If using a cloud platform like AWS, Azure, or Google Cloud, utilize their certificate management services (e.g., AWS Certificate Manager) to provision and manage a free wildcard certificate.
    3.  **Manual:** Purchase a wildcard certificate from a commercial Certificate Authority (CA).

### 1.3. Proxy & Request Routing

-   **Requirement:** A mechanism is needed to intercept incoming requests, identify the subdomain, and internally route the request to the correct Next.js page or handler.
-   **Recommendation:** Leverage **Next.js Middleware** for routing logic. This is the most idiomatic and integrated approach, running at the edge before the request hits the cache or server-side render functions.
-   **Alternative (Nginx):** If you are running a self-hosted environment with Nginx as a reverse proxy, you can handle some logic there. However, keeping the logic within the Next.js application itself is generally cleaner.

    *Example Nginx `server` block (for reference):*
    ```nginx
    server {
        listen 80;
        server_name *.yourdomain.com;

        # SSL Configuration
        listen 443 ssl http2;
        ssl_certificate /path/to/your/wildcard.crt;
        ssl_certificate_key /path/to/your/wildcard.key;

        location / {
            proxy_pass http://localhost:3000; # Your Next.js app
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

---

## Phase 2: Routing Logic

This phase details the implementation of the code that will perform the actual routing based on the request's hostname.

### 2.1. Intercepting Requests with Middleware

-   **Action:** Create a `middleware.ts` file in the root of your project (or inside `src/`). This middleware will inspect the `Host` header of every incoming request.

### 2.2. Implementing the Routing Strategy

-   **Logic:** The middleware will extract the subdomain from the hostname and use `URL.rewrite()` to serve content from a different path within the application, without changing the URL in the user's browser.
-   **Implementation (`middleware.ts`):**

    ```typescript
    import { NextResponse } from 'next/server';
    import type { NextRequest } from 'next/server';

    // Define the mapping of subdomains to internal paths
    const SUBDOMAIN_MAP: { [key: string]: string | null } = {
        'featured': '/products', // 'featured.yourdomain.com' -> '/products'
        'reviews': '/reviews',     // 'reviews.yourdomain.com'  -> '/reviews'
        'contact': '/contact',   // 'contact.yourdomain.com'  -> '/contact'
        'api': '/api',             // Let 'api.yourdomain.com' pass through to API routes
    };

    export function middleware(request: NextRequest) {
        const url = request.nextUrl.clone();
        const hostname = request.headers.get('host') || '';

        // NOTE: Replace 'yourdomain.com' with your actual domain.
        const subdomain = hostname.replace('.yourdomain.com', '').split('.')[0];

        const internalPath = SUBDOMAIN_MAP[subdomain];

        if (internalPath) {
            // Rewrite the URL to the internal path
            // e.g., 'featured.yourdomain.com/some-product' becomes a request for '/products/some-product'
            url.pathname = `${internalPath}${url.pathname}`;
            return NextResponse.rewrite(url);
        }

        // Allow all other requests (e.g., for the main domain) to proceed as normal
        return NextResponse.next();
    }

    export const config = {
      // Matcher to ensure the middleware runs on all requests
      matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
      ],
    };
    ```

---

## Phase 3: Data & Session Management

This phase addresses the challenges of maintaining a consistent user experience across different subdomains.

### 3.1. Cross-Origin Resource Sharing (CORS)

-   **Requirement:** API routes must be configured to trust requests originating from the new subdomains.
-   **Action:** Update your CORS configuration to include all subdomains in the allowed origins list.
    -   If using a custom server or API middleware, add the origins there.
    -   In Next.js API routes, you can set headers on the response object. A dynamic approach is best.

    *Example in an API route (`/pages/api/some-route.ts`):*
    ```typescript
    import { NextApiRequest, NextApiResponse } from 'next';

    export default function handler(req: NextApiRequest, res: NextApiResponse) {
        // Set CORS headers dynamically based on request origin
        const origin = req.headers.origin;
        const allowedOrigins = [
            'https://yourdomain.com',
            'https://featured.yourdomain.com',
            'https://reviews.yourdomain.com',
            'https://contact.yourdomain.com'
        ];

        if (origin && allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // ... your API logic
        res.status(200).json({ name: 'Success' });
    }
    ```

### 3.2. Authentication & Session Cookies

-   **Requirement:** Users must remain logged in as they navigate between the main domain and the subdomains.
-   **Action:** Configure session cookies to be shared across all subdomains by setting the `domain` attribute to the root domain.
    -   **Cookie Domain:** The cookie domain must be prefixed with a dot (e.g., `.yourdomain.com`).
    -   **Implementation:** If using an authentication library like `next-auth`, you can configure this in the `cookies` option.

    *Example for `next-auth`:*
    ```typescript
    // In your [...nextauth].ts file
    export const authOptions = {
      // ... your providers
      cookies: {
        sessionToken: {
          name: `__Secure-next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: true,
            domain: '.yourdomain.com', // The key change for cross-subdomain sessions
          },
        },
      },
    };
    ```

---

## Phase 4: Deployment & Testing

This final phase outlines the process for safely deploying and verifying the new routing system.

### 4.1. Staging Environment

-   **Requirement:** A dedicated staging or pre-production environment that mirrors the production infrastructure.
-   **Action:**
    1.  Set up wildcard DNS and SSL for a staging domain (e.g., `*.staging.yourdomain.com`).
    2.  Deploy the application to this environment.
    3.  Ensure all environment variables (API keys, database connections, domain names) are configured correctly for staging.

### 4.2. Validation & Testing

-   **Requirement:** Thoroughly test all aspects of the subdomain routing to prevent production issues.
-   **Action:** Execute the following test plan (manual and automated):

    -   **Routing Accuracy:**
        -   [ ] Navigate to `featured.staging.yourdomain.com`. Verify it displays the featured devices content.
        -   [ ] Navigate to `reviews.staging.yourdomain.com`. Verify it displays the reviews content.
        -   [ ] Navigate to `contact.staging.yourdomain.com`. Verify it displays the contact form.
        -   [ ] Navigate to `staging.yourdomain.com`. Verify it displays the standard home page.

    -   **Authentication & State:**
        -   [ ] Log in on the main domain (`staging.yourdomain.com`).
        -   [ ] Navigate to a subdomain (e.g., `reviews.staging.yourdomain.com`).
        -   [ ] Verify that you are still logged in and your session is persisted.

    -   **CORS & API Calls:**
        -   [ ] Open the browser's developer tools.
        -   [ ] Perform an action on a subdomain that triggers an API call (e.g., submitting a review).
        -   [ ] Check the Network tab to ensure the API call succeeds (HTTP 2xx status) and there are no CORS errors in the Console.

    -   **Asset Loading:**
        -   [ ] Ensure all images, CSS, and JavaScript files load correctly on all subdomains. Check for broken links or 404 errors in the console.

### 4.3. Production Rollout

-   **Recommendation:** A controlled, incremental rollout is advised.
-   **Action:**
    1.  **Initial Deployment:** Deploy the changes to production.
    2.  **Update Links:** Start by updating the links for the least critical module (e.g., change the "Contact Us" link in your navigation from `/contact` to `https://contact.yourdomain.com`).
    3.  **Monitor:** Closely monitor application logs, error reporting tools (e.g., Sentry), and analytics for any unusual activity or errors.
    4.  **Incremental Rollout:** Once confident, proceed to update the links for the other modules (`Reviews`, then `Featured Devices`).
    5.  **Consider Redirects (Optional):** Decide whether to implement 301 redirects from the old paths (e.g., `yourdomain.com/reviews`) to the new subdomains (`reviews.yourdomain.com`) for SEO and usability. This can also be handled in the middleware.

---

## Phase 5: Refinement and Optimization

This phase focuses on enhancing the performance, maintainability, and search engine optimization (SEO) of the subdomain routing system.

### 5.1. Caching Strategies

-   **Requirement:** Optimize content delivery and reduce server load by implementing efficient caching.
-   **Action:**
    1.  **CDN Integration:** Utilize a Content Delivery Network (CDN) to cache static assets (images, CSS, JS) and dynamically rendered pages at edge locations, closer to users. Configure CDN rules to handle subdomain routing and cache invalidation appropriately.
    2.  **Server-Side Caching:** Implement server-side caching for frequently accessed data or API responses to reduce database/upstream service calls. This can be done using a caching layer (e.g., Redis) or Next.js's `revalidate` option for ISR (Incremental Static Regeneration).
    3.  **Browser Caching:** Leverage HTTP caching headers (e.g., `Cache-Control`, `Expires`) for client-side caching of static assets.

### 5.2. SEO Considerations

-   **Requirement:** Ensure search engine visibility and prevent duplicate content issues when transitioning to subdomains.
-   **Action:**
    1.  **Canonical Tags:** Implement canonical tags on all subdomain pages pointing to the preferred version (either the subdomain URL or the main domain path, depending on your SEO strategy).
    2.  **Sitemap Updates:** Update your `sitemap.xml` to include all new subdomain URLs. If you have separate sitemaps for different subdomains, ensure they are properly linked or submitted to search engines.
    3.  **Google Search Console:** Add and verify each new subdomain as a separate property in Google Search Console to monitor their performance and indexing status.
    4.  **Internal Linking:** Update internal links within your application to point to the new subdomain URLs where applicable, ensuring search engine crawlers discover the new structure.
    5.  **301 Redirects:** Implement permanent (301) redirects from the old primary domain paths (e.g., `yourdomain.com/reviews`) to their corresponding new subdomain URLs (`reviews.yourdomain.com`). This preserves link equity and guides users/crawlers to the correct locations. This can be handled in Next.js redirects configuration or at the proxy level (Nginx).

### 5.3. Monitoring and Alerting

-   **Requirement:** Continuously monitor the performance and health of the subdomain routing system to quickly identify and resolve issues.
-   **Action:**
    1.  **Performance Monitoring:** Set up tools (e.g., New Relic, Datadog, Prometheus) to monitor server response times, error rates, and resource utilization across all subdomains.
    2.  **Error Tracking:** Integrate error tracking services (e.g., Sentry, Bugsnag) to capture and alert on application errors specific to subdomain requests.
    3.  **Uptime Monitoring:** Use uptime monitoring services to ensure all subdomains are accessible and responding correctly.
    4.  **Analytics:** Configure web analytics (e.g., Google Analytics) to track user behavior across subdomains, ensuring consistent data collection and reporting.

---
