# System Architecture Diagram

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                          END USER'S BROWSER                                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    gadgets.html (Frontend)                            │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────┐    │ │
│  │  │ 1. Page Loads                                               │    │ │
│  │  │    - API_CONFIG detects domain                             │    │ │
│  │  │    - DOMContentLoaded triggers                             │    │ │
│  │  │    - fetchAndRenderProducts() called                       │    │ │
│  │  └─────────────────────────────────────────────────────────────┘    │ │
│  │                              │                                      │ │
│  │                              ↓                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────┐    │ │
│  │  │ 2. Subdomain Detection (API_CONFIG)                         │    │ │
│  │  │                                                              │    │ │
│  │  │    IF localhost/127.0.0.1                                  │    │ │
│  │  │    → Route to localhost:5000                               │    │ │
│  │  │                                                              │    │ │
│  │  │    ELSE IF has api/products subdomain                      │    │ │
│  │  │    → Use subdomain directly                                │    │ │
│  │  │                                                              │    │ │
│  │  │    ELSE (production)                                        │    │ │
│  │  │    → Route to api.{domain}                                 │    │ │
│  │  │                                                              │    │ │
│  │  └─────────────────────────────────────────────────────────────┘    │ │
│  │                              │                                      │ │
│  │                              ↓                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────┐    │ │
│  │  │ 3. Fetch from API                                           │    │ │
│  │  │    fetch(API_CONFIG.getProductsURL())                      │    │ │
│  │  │    → /api/products                                          │    │ │
│  │  │                                                              │    │ │
│  │  │    Expected Response:                                       │    │ │
│  │  │    [{id, brand, category, name, price, specs, ...}, ...]  │    │ │
│  │  │                                                              │    │ │
│  │  └─────────────────────────────────────────────────────────────┘    │ │
│  │                              │                                      │ │
│  │                  ┌───────────┴───────────┐                         │ │
│  │                  │ Success      │ Failure                           │ │
│  │                  ↓              ↓                                    │ │
│  │  ┌────────────────────┐  ┌──────────────────────┐                 │ │
│  │  │ 4a. Render from API│  │ 4b. Fallback         │                 │ │
│  │  │                    │  │ Keep static products │                 │ │
│  │  │ createProductCard()│  │ (existing HTML)      │                 │ │
│  │  │ → dynamic HTML     │  │                      │                 │ │
│  │  │                    │  │ Log warning to       │                 │ │
│  │  │ Cache by category  │  │ console              │                 │ │
│  │  │                    │  │                      │                 │ │
│  │  └────────────────────┘  └──────────────────────┘                 │ │
│  │        │                         │                                 │ │
│  │        └─────────────┬───────────┘                                │ │
│  │                      ↓                                            │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │ 5. Attach Filter Handlers                                   │  │ │
│  │  │    - All, Phones, Laptops, Accessories buttons              │  │ │
│  │  │    - Filter based on product.category                       │  │ │
│  │  │    - Animate show/hide                                      │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  │                      │                                             │ │
│  │                      ↓                                             │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │ 6. Display Products                                         │  │ │
│  │  │    - Product grid shows all/filtered items                 │  │ │
│  │  │    - Stock badges, prices, specs                           │  │ │
│  │  │    - Hover animations work                                 │  │ │
│  │  │    - Buttons are interactive                               │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTPS/HTTP
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐      ┌────────▼──────────┐
            │ Main Domain    │      │ API Subdomain    │
            │ gadgets.local  │      │ api.gadgets.local │
            │ (Frontend)     │      │ (Backend)         │
            └────────────────┘      └────────┬──────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │                             │
                       ┌──────▼──────┐            ┌────────▼────────┐
                       │  Node.js    │            │  Port 5000      │
                       │  Express    │            │  (Server)       │
                       │  Server     │            │                 │
                       └──────┬──────┘            └─────────────────┘
                              │
                    ┌─────────┴────────────┐
                    │                      │
            ┌───────▼────────┐    ┌───────▼────────┐
            │ CORS Enabled   │    │ API Endpoints  │
            │ for subdomains │    │ /api/products  │
            │                │    │ /api/reviews   │
            │ Pattern:       │    │ /api/contact   │
            │ *.local        │    │                │
            │ *.domain.com   │    └────────┬───────┘
            └────────────────┘             │
                                    ┌──────▼────────┐
                                    │ Data Layer    │
                                    │               │
                                    │ products.json │
                                    │ reviews.json  │
                                    │               │
                                    └───────────────┘
```

---

## 📊 Data Flow Diagram

```
User Action                System Response
═══════════════════════════════════════════════════════════════════

1. Page Loads
   │
   └─→ DOMContentLoaded
       └─→ fetchAndRenderProducts()
           │
           ├─→ Detect: hostname = "gadgets.local"
           ├─→ Determine: API at "http://api.gadgets.local:5000"
           ├─→ Fetch: /api/products
           │
           ├─ SUCCESS ────────────────────────────────────────┐
           │                                                   │
           ├─→ Parse JSON response (10 products)              │
           ├─→ Cache products by category                     │
           ├─→ createProductCard() for each product           │
           ├─→ Append to #pgrid                               │
           ├─→ attachFilterHandlers()                         │
           └─→ Display complete product grid ────────────────┐
                                                              │
           ├─ FAILURE ─────────────────────────────────────┐  │
           │                                               │   │
           ├─→ console.warn("Could not load...")          │   │
           ├─→ Keep existing static HTML products         │   │
           ├─→ attachFilterHandlers() still works         │   │
           └─→ Display fallback products ────────┐        │   │
                                                 │        │   │
                                                 ↓        ↓   ↓
                                         ┌───────────────────────┐
                                         │ Featured Products     │
                                         │ Section Ready         │
                                         └───────────────────────┘

2. User Clicks Filter Button
   │
   └─→ "Phones" button clicked
       │
       ├─→ Filter attached by attachFilterHandlers()
       ├─→ Loop through all .pcard elements
       ├─→ Compare product.category vs filter value
       │
       ├─ MATCH ──────────────────────────────────┐
       │  │                                        │
       │  ├─→ card.style.display = 'block'        │
       │  ├─→ Animate: opacity 0→1, scale 0.95→1 │
       │  └─→ Show product card                   │
       │                                          │
       ├─ NO MATCH ────────────────────────────┐  │
       │  │                                    │   │
       │  ├─→ Animate: opacity 1→0, scale 1→0.95│ │
       │  ├─→ After animation (400ms)          │   │
       │  └─→ card.style.display = 'none'      │   │
       │                                        │   │
       └────────────────────────────────────────┘   │
                                                    ↓
                                          ┌────────────────┐
                                          │ Filtered View  │
                                          │ (e.g., 5 Phones)
                                          └────────────────┘

3. User Hovers Over Product Card
   │
   └─→ Mouse enters .pcard
       │
       └─→ .pspecs (specs overlay)
           │
           ├─→ Initially hidden: transform translateY(100%)
           ├─→ On hover: transform translateY(0)
           └─→ Shows: Device specs, "Order Now" button
               (transition: 0.5s ease)

4. User Clicks "Order Now"
   │
   └─→ goWA() function called
       │
       └─→ window.open('https://t.me/DanielClothings000', '_blank')
           │
           └─→ Opens WhatsApp in new tab
```

---

## 🔀 Subdomain Routing Logic

```
┌─────────────────────────────────────┐
│ Detect Hostname                     │
│ window.location.hostname            │
└────────────────┬────────────────────┘
                 │
         ┌───────┴────────────┬─────────────────┬──────────┐
         │                    │                 │          │
         ▼                    ▼                 ▼          ▼
    localhost           127.0.0.1          gadgets.local   api.gadgets.local
         │                    │                 │          │
         └────────────────────┴─────────┐       │          │
                                        │       │          │
                     ┌──────────────────┘       │          │
                     │                         │          │
                     ▼                         │          │
            ┌─────────────────────┐           │          │
            │ Development Route   │           │          │
            │ → localhost:5000    │           │          │
            │ → API on port 5000  │           │          │
            └─────────────────────┘           │          │
                                              │          │
         ┌────────────────────────────────────┘          │
         │                                               │
         ▼                                               ▼
    ┌──────────────────┐                    ┌──────────────────────────┐
    │ Production Route │                    │ Direct Subdomain Route   │
    │ → api.domain.com │                    │ → Use domain directly    │
    │ → Full domain    │                    │ → api.gadgets.local:5000 │
    └──────────────────┘                    └──────────────────────────┘
         │                                               │
         └───────────────────────────┬───────────────────┘
                                     │
                          ┌──────────▼───────────┐
                          │ Construct Base URL   │
                          │ API_CONFIG.getBase() │
                          └──────────┬───────────┘
                                     │
                          ┌──────────▼──────────────┐
                          │ Append Endpoint        │
                          │ /api/products          │
                          │ /api/reviews           │
                          └──────────┬──────────────┘
                                     │
                          ┌──────────▼──────────────┐
                          │ Execute Fetch          │
                          │ Pass to Network        │
                          └────────────────────────┘
```

---

## 📦 Product Card Creation Process

```
API Response (JSON)
       │
       ▼
createProductCard(product)
       │
       ├─→ Create <article class="pcard">
       │
       ├─→ Stock Badge
       │   ├─ Check product.stock (true/false)
       │   ├─ Set color based on stock status
       │   └─ Add pulsing dot animation
       │
       ├─→ Specs Overlay (.pspecs)
       │   ├─ Generate rows from product.specs object
       │   ├─ "Order Now" button
       │   └─ Initially hidden (transform translateY)
       │
       ├─→ Product Image (.pimg)
       │   ├─ Apply gradient from product.gradient
       │   ├─ Device mockup phone
       │   ├─ Apply deviceGradient
       │   ├─ Screen with screenGradient
       │   └─ Pulsing animation
       │
       ├─→ Product Info (.pinfo)
       │   ├─ Brand: product.brand
       │   ├─ Name: product.name
       │   ├─ Description: product.description
       │   ├─ Price: ₦{product.price.toLocaleString()}
       │   └─ "View Details" button
       │
       └─→ Return <article> element
                   │
                   ▼
            Append to pgrid
                   │
                   ▼
            HTML renders on page
```

---

## 🎯 Filter Logic

```
Filter Button Clicked (e.g., "Phones")
       │
       ├─→ Get filter value: "phones"
       │
       ├─→ Update active state
       │   └─ Remove "active" from all buttons
       │   └─ Add "active" to clicked button
       │
       ├─→ Loop through all .pcard elements
       │   │
       │   └─→ For each card:
       │       │
       │       ├─ Get card.dataset.category
       │       │
       │       ├─ IF filter === 'all' OR category === filter
       │       │  │
       │       │  ├─→ card.style.display = 'block'
       │       │  ├─→ setTimeout → opacity = 1
       │       │  ├─→ setTimeout → transform = scale(1)
       │       │  └─→ SHOW with animation
       │       │
       │       ├─ ELSE
       │       │  │
       │       │  ├─→ opacity = 0
       │       │  ├─→ transform = scale(0.95)
       │       │  ├─→ HIDE with animation
       │       │  ├─→ setTimeout(400ms) → display = 'none'
       │       │  └─→ Hidden after animation
       │       │
       │       └─ [End for each]
       │
       └─→ Filtered view displayed to user
```

---

## 🌍 CORS Flow

```
Browser Request
       │
       ├─→ Fetch: /api/products
       ├─→ From: http://gadgets.local
       ├─→ To: http://api.gadgets.local:5000
       │
       └─→ Preflight Check
           ├─ Method: OPTIONS
           ├─ Headers: Origin, Content-Type
           │
           └─→ Server receives
               │
               ├─→ Check origin in corsOptions.allowedOrigins
               │
               ├─ MATCH ────────────────────┐
               │  │                         │
               │  ├─→ 200 OK response       │
               │  ├─→ CORS headers added:   │
               │  │  - Access-Control-Allow-Origin: *
               │  │  - Access-Control-Allow-Methods: GET, POST, OPTIONS
               │  │  - Access-Control-Allow-Headers: Content-Type
               │  │
               │  └─→ Browser receives ──┐  │
               │                         │  │
               ├─ NO MATCH ────────────┐ │  │
               │  │                    │ │  │
               │  ├─→ 403 Forbidden    │ │  │
               │  ├─→ CORS error       │ │  │
               │  │                    │ │  │
               │  └─→ Browser blocks ──┤ │  │
               │                       │ │  │
               └───────────────────────┘ │  │
                                         │  │
              Browser can now send ──────┘  │
              actual request                │
                                           │
                    ┌──────────────────────┘
                    │
                    ▼
             GET /api/products
                    │
                    ▼
             Server responds with products JSON
                    │
                    ├─ + CORS headers
                    └─→ Browser receives & parses
                           │
                           └─→ JavaScript can use data
```

---

## 📈 Caching Strategy

```
API Response
       │
       ▼
cachedProducts = {}
       │
       ├─→ For each product:
       │   │
       │   └─→ Get product.category (e.g., "phones")
       │       │
       │       ├─ If category not in cache
       │       │  └─→ cachedProducts["phones"] = []
       │       │
       │       └─→ Push product to cache[category]
       │
       └─→ Cache complete
           │
           ├─ cachedProducts["phones"] = [5 products]
           ├─ cachedProducts["laptops"] = [5 products]
           └─ cachedProducts["accessories"] = [5 products]

When filter clicked:
       │
       ├─→ Could use cache if needed
       └─→ Currently filters rendered DOM (not cached)
           (Could be optimized to use cache in future)
```

---

**This diagram shows the complete flow from page load through product display and filtering.**
