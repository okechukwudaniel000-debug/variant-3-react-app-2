# Featured Products Subdomain Setup Guide

## Overview
The gadgets website has been improved to support subdomain-based API routing. Products are now loaded dynamically from a backend API, with intelligent detection of whether you're on localhost or a production domain.

---

## Architecture

### Frontend (gadgets.html)
**Subdomain Detection Logic:**
- Checks if current domain contains subdomain (e.g., `api.`, `products.`)
- Routes to appropriate API base URL
- Falls back to static products if API unavailable

**API Configuration:**
```javascript
API_CONFIG.getBaseURL()    // Returns correct API base URL
API_CONFIG.getProductsURL() // Returns /api/products endpoint
```

### Backend (server.js)
**CORS Support:**
- Localhost development (localhost:3000, localhost:5000)
- Custom domains (.gadgets.local, .daniel-gadgets.com)
- Production subdomains

**API Endpoints:**
- `GET /api/products` - List all products or filter by category
- `GET /api/products/:id` - Get single product details
- `GET /api/reviews` - Get reviews (existing)
- `POST /api/contact` - Contact form (existing)

### Data Format (products.json)
Each product now has:
```json
{
  "id": "unique-id",
  "brand": "Brand Name",
  "category": "phones|laptops|accessories",
  "name": "Product Name",
  "description": "Description",
  "price": 1000000,
  "stock": true,
  "specs": {
    "Key": "Value",
    "Display": "6.8\" AMOLED"
  },
  "gradient": "linear-gradient(...)",
  "deviceGradient": "linear-gradient(...)",
  "screenGradient": "linear-gradient(...)"
}
```

---

## Local Development Setup

### 1. Start Backend Server
```bash
cd fullstack/backend
npm install  # If not already done
npm start    # or node server.js
```
Server runs on: `http://localhost:5000`

### 2. Open Frontend
Open `gadgets.html` in browser:
- `file:///` - Falls back to static products
- `http://localhost:3000` - Calls `http://localhost:5000/api/products`
- `http://localhost:8080` - Calls `http://localhost:5000/api/products`

### 3. Test Product Filtering
- Click filter buttons (All, Phones, Laptops, Accessories)
- Products load from API and filter dynamically

---

## Production Subdomain Setup

### DNS Configuration
Add records to your DNS provider (e.g., GoDaddy, Route53):

```
daniel-gadgets.com       A     → your-server-ip
api.daniel-gadgets.com   A     → your-server-ip
products.daniel-gadgets.com    A     → your-server-ip
```

### Reverse Proxy Setup (Nginx)
```nginx
# Main site on port 80
server {
    listen 80;
    server_name daniel-gadgets.com;
    root /var/www/gadgets;
}

# API on subdomain, same server
server {
    listen 80;
    server_name api.daniel-gadgets.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Environment Variables
On server, set backend PORT:
```bash
export PORT=5000
node server.js
```

---

## Testing Subdomains Locally

### Option 1: Edit /etc/hosts (Mac/Linux)
```
127.0.0.1 localhost
127.0.0.1 gadgets.local
127.0.0.1 api.gadgets.local
127.0.0.1 products.gadgets.local
```

### Option 2: Use Browser Developer Tools
Set custom domain mapping or use proxy tools like Fiddler/Charles.

### Test URLs:
- `http://gadgets.local` - Main site (calls `http://api.gadgets.local:5000`)
- `http://api.gadgets.local:5000` - API server directly

---

## Features & Benefits

✅ **Dynamic Product Loading** - Products from database/API, not hardcoded
✅ **Category Filtering** - Filter by phones, laptops, accessories
✅ **Subdomain Support** - API on separate subdomain (best practice)
✅ **Fallback System** - Static products if API unavailable
✅ **CORS Enabled** - Cross-origin requests properly configured
✅ **Scalable** - Easy to add new products or categories

---

## Troubleshooting

### Products not loading?
1. Check browser console for API errors
2. Verify backend is running: `curl http://localhost:5000/api/products`
3. Check CORS headers in response
4. Ensure products.json is valid JSON

### CORS errors?
- Update `corsOptions` in server.js to include your domain
- Restart backend server

### Wrong API URL?
- Open browser console and check `API_CONFIG.getBaseURL()`
- Verify subdomain routing logic in code

### Products.json issues?
- Validate JSON: `cat fullstack/backend/data/products.json | python -m json.tool`
- Ensure all required fields present (id, brand, category, name, price, specs)

---

## Adding New Products

1. Open `fullstack/backend/data/products.json`
2. Add new object following this structure:
```json
{
  "id": "unique-slug",
  "brand": "Brand",
  "category": "phones",
  "name": "Product Name",
  "description": "Description",
  "price": 999999,
  "stock": true,
  "specs": {
    "Feature1": "Value1",
    "Feature2": "Value2"
  },
  "gradient": "linear-gradient(135deg,rgba(...))",
  "deviceGradient": "linear-gradient(...)",
  "screenGradient": "linear-gradient(...)"
}
```
3. Save file - API will automatically include it
4. Refresh browser to see new product

---

## API Reference

### Get All Products
```bash
GET http://api.domain.com/api/products
```
Response: Array of all products

### Filter by Category
```bash
GET http://api.domain.com/api/products?category=phones
```
Categories: `phones`, `laptops`, `accessories`

### Get Single Product
```bash
GET http://api.domain.com/api/products/s25u
```
Response: Single product object

### Get Reviews
```bash
GET http://api.domain.com/api/reviews
```

---

## File Locations

```
gadgets_website/
├── gadgets.html              (Updated: API_CONFIG, dynamic loading)
├── SUBDOMAIN_SETUP_GUIDE.md  (This file)
└── fullstack/
    └── backend/
        ├── server.js         (Updated: Enhanced CORS, API endpoints)
        ├── package.json
        └── data/
            ├── products.json (Updated: New data structure)
            └── reviews.json
```

---

## Next Steps

1. ✅ Update products.json with new format
2. ✅ Implement subdomain detection
3. ⚠️ Configure production DNS
4. ⚠️ Set up reverse proxy (Nginx/Apache)
5. ⚠️ Configure SSL certificates
6. ⚠️ Deploy backend server

---

**Questions or issues? Check browser console for detailed error messages.**
