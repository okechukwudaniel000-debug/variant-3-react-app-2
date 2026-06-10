# Featured Products Testing & Usage Guide

## 🧪 Testing Scenarios

### Scenario 1: Local Development (File Protocol)
**URL:** `file:///path/to/gadgets.html`

**Expected Behavior:**
- Static products display (fallback mode)
- Filtering works on static cards
- Console shows no API fetch errors (warning only)
- All interactions work normally

**Test Steps:**
1. Open gadgets.html directly in browser
2. Verify products display
3. Click "Phones" filter - should show only phones
4. Click "All" to reset
5. Open DevTools Console - should see fallback message

---

### Scenario 2: Localhost Development
**Prerequisites:**
```bash
cd fullstack/backend
npm install
npm start
# Server runs on http://localhost:5000
```

**URL:** `http://localhost:3000` (or any local dev server)

**Expected Behavior:**
- API call to `http://localhost:5000/api/products`
- Products load dynamically
- Filtering works
- No CORS errors
- Console shows: "Fetching products from: http://localhost:5000/api/products"
- Console shows: "Loaded 10 products"

**Test Steps:**
1. Start backend: `npm start` in fullstack/backend
2. Open: `http://localhost:3000`
3. Wait for products to load
4. Test each filter:
   - All (10 items)
   - Phones (5 items: S25U, i16pm, i15, ga55, + 1)
   - Laptops (5 items: mbpm4, ippm4, dxps16, am18r2, + 1)
   - Accessories (3 items: aw10, gb3p, cgar, ps6)
5. Hover over products - specs should slide up
6. Click "View Details" or "Order Now" - redirects to WhatsApp

**Console Verification:**
```javascript
// In DevTools Console, type:
API_CONFIG.getBaseURL()
// Should return: http://localhost:5000

API_CONFIG.getProductsURL()
// Should return: http://localhost:5000/api/products
```

---

### Scenario 3: Subdomain Testing (Local)
**Setup /etc/hosts (Mac/Linux):**
```
127.0.0.1 localhost
127.0.0.1 gadgets.local
127.0.0.1 api.gadgets.local
```

**Windows C:\Windows\System32\drivers\etc\hosts:**
```
127.0.0.1 localhost
127.0.0.1 gadgets.local
127.0.0.1 api.gadgets.local
```

**URL:** `http://gadgets.local`

**Expected Behavior:**
- Frontend detects "gadgets.local" domain
- API_CONFIG routes to `http://api.gadgets.local:5000`
- Products load from backend
- Same filtering behavior as Scenario 2

**Test Steps:**
1. Edit hosts file with above entries
2. Flush DNS cache:
   - **Mac:** `sudo dscacheutil -flushcache`
   - **Windows:** `ipconfig /flushdns`
   - **Linux:** `sudo systemctl restart systemd-resolved`
3. Start backend on port 5000
4. Open `http://gadgets.local`
5. Verify products load and filters work

**Console Verification:**
```javascript
API_CONFIG.getBaseURL()
// Should return: http://api.gadgets.local:5000
```

---

### Scenario 4: Production Setup (daniel-gadgets.com)
**DNS Records:**
```
daniel-gadgets.com       A → 123.45.67.89
api.daniel-gadgets.com   A → 123.45.67.89
```

**URLs:**
- Main site: `https://daniel-gadgets.com`
- API: `https://api.daniel-gadgets.com`

**Expected Behavior:**
- Frontend on daniel-gadgets.com
- Auto-detects api subdomain
- Fetches from `https://api.daniel-gadgets.com/api/products`
- Full HTTPS/SSL support

**Console Verification:**
```javascript
API_CONFIG.getBaseURL()
// Should return: https://api.daniel-gadgets.com:443 (or without :443)
```

---

## 🧬 API Testing

### Test 1: Get All Products
```bash
curl http://localhost:5000/api/products
```

**Expected Response:**
```json
[
  {
    "id": "s25u",
    "brand": "Samsung Galaxy",
    "category": "phones",
    "name": "Galaxy S25 Ultra",
    "price": 1110000,
    "stock": true,
    ...
  },
  ...
]
```

**Status:** Should be 200 OK

---

### Test 2: Filter by Category
```bash
curl "http://localhost:5000/api/products?category=phones"
```

**Expected:** 5 phone products

```bash
curl "http://localhost:5000/api/products?category=laptops"
```

**Expected:** 5 laptop products

```bash
curl "http://localhost:5000/api/products?category=accessories"
```

**Expected:** 5 accessory products

---

### Test 3: Get Single Product
```bash
curl http://localhost:5000/api/products/s25u
```

**Expected Response:**
```json
{
  "id": "s25u",
  "brand": "Samsung Galaxy",
  "category": "phones",
  "name": "Galaxy S25 Ultra",
  "description": "Titanium build, 200MP camera system...",
  "price": 1110000,
  "stock": true,
  "specs": {
    "Processor": "SD 8 Gen 4",
    "Display": "6.8\" AMOLED 2X",
    "Camera": "200MP Quad",
    "Battery": "5000mAh"
  },
  ...
}
```

**Status:** Should be 200 OK

---

### Test 4: Invalid Product ID
```bash
curl http://localhost:5000/api/products/invalid
```

**Expected Response:**
```json
{
  "error": "Product not found"
}
```

**Status:** Should be 404 Not Found

---

### Test 5: CORS Headers
```bash
curl -i http://localhost:5000/api/products
```

**Look for in response:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 🎨 Frontend Feature Testing

### Product Card Features
- [ ] Stock badge displays correctly (In Stock / Out of Stock)
- [ ] Stock dot pulses animation
- [ ] Product image background gradient applied
- [ ] Device phone mockup renders
- [ ] On hover: specs slide up from bottom
- [ ] Specs show all key-value pairs from API
- [ ] Price formats with ₦ and comma separators
- [ ] "View Details" button clickable
- [ ] "Order Now" button clickable

### Filter Buttons
- [ ] Active filter highlighted
- [ ] Products animate in/out (smooth transitions)
- [ ] Filter logic works correctly
- [ ] All products return on "All" click
- [ ] Category filtering accurate

### Existing Features (Should Still Work)
- [ ] Theme toggle (dark/light mode)
- [ ] User authentication modal
- [ ] Text scramble effects
- [ ] Magnetic button hover effects
- [ ] HUD corner animations
- [ ] Scroll parallax effects

---

## 🔍 Debugging Tips

### Check if API is being called:
1. Open DevTools → Network tab
2. Filter by XHR/Fetch
3. Reload page
4. Look for `/api/products` request
5. Verify status is 200

### Check API response data:
1. Click the `/api/products` request
2. Go to Response tab
3. Verify JSON is valid
4. Check products have required fields

### Check console for errors:
```javascript
// If API fails, you'll see:
// ❌ "Could not load from API: ..."
// ℹ️ "Using fallback products"

// If API succeeds, you'll see:
// ℹ️ "Fetching products from: http://..."
// ✅ "Loaded X products"
```

### Verify subdomain detection:
```javascript
// In DevTools console, run:
console.log(API_CONFIG.getBaseURL());
console.log(window.location.hostname);
console.log(window.location.protocol);
```

---

## 📊 Product Categories Count

| Category | Count | IDs |
|----------|-------|-----|
| phones | 5 | s25u, i16pm, i15, ga55, + cbar |
| laptops | 5 | mbpm4, ippm4, dxps16, am18r2, + sb4 |
| accessories | 5 | aw10, gb3p, cgar, ps6, + extra |

---

## ⚡ Performance Checklist

- [ ] Products load within 1 second (local network)
- [ ] No console errors or CORS issues
- [ ] Smooth filter animations (60fps)
- [ ] Page renders while fetching (no blocking)
- [ ] Responsive on mobile devices
- [ ] Static fallback fast (instant)

---

## 🚨 Common Issues & Fixes

### Issue: Products not loading
**Symptom:** "Loaded 0 products" or blank grid

**Fixes:**
1. Check backend is running: `curl http://localhost:5000/api/products`
2. Verify products.json is valid JSON
3. Check Network tab for API errors
4. Check console for error messages

---

### Issue: CORS errors
**Symptom:** "Access to XMLHttpRequest blocked by CORS"

**Fixes:**
1. Verify backend CORS config includes your domain
2. Restart backend after config changes
3. Clear browser cache
4. Try in incognito window

---

### Issue: Products load but filters don't work
**Symptom:** Filter buttons don't show/hide products

**Fixes:**
1. Check products have `category` field
2. Verify filter names match categories: phones, laptops, accessories
3. Open console - check for errors
4. Reload page

---

### Issue: Wrong API URL detected
**Symptom:** API_CONFIG returns unexpected URL

**Fixes:**
1. Check `window.location.hostname` in console
2. Verify subdomain detection logic
3. Update corsOptions in server.js if needed
4. Restart backend

---

## 📝 Validation Checklist

- [ ] All 10 products loaded
- [ ] Each product has all required fields
- [ ] Prices are numbers (not strings)
- [ ] Categories are correct
- [ ] Stock status displays properly
- [ ] Specs display in correct format
- [ ] Device gradients applied
- [ ] Filters work for each category
- [ ] No console errors
- [ ] API responds correctly to category filters
- [ ] Single product API works
- [ ] CORS headers present
- [ ] Fallback mode works if API down

---

**🎉 If all checks pass, you're ready for production deployment!**
