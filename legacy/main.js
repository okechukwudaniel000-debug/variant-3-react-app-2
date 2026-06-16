/* ============================================================
   AUTH MODAL LOGIC
============================================================ */
const authOverlay = document.getElementById('authOverlay');
const userBtn = document.getElementById('userBtn');
const authClose = document.getElementById('authClose');
const toRegister = document.getElementById('toRegister');
const toLogin = document.getElementById('toLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const lForm = document.getElementById('lForm');
const rForm = document.getElementById('rForm');

function openAuth() {
  if (!authOverlay) return;
  authOverlay.classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeAuth() {
  if (!authOverlay) return;
  authOverlay.classList.remove('on');
  document.body.style.overflow = '';
}

function updateUserUI(name) {
  if (!name || !userBtn) return;
  const initial = name.charAt(0).toUpperCase();
  userBtn.innerHTML = `<div class="user-avatar">${initial}</div>`;
  localStorage.setItem('dg_user', name);
}

if (userBtn) userBtn.addEventListener('click', openAuth);
if (authClose) authClose.addEventListener('click', closeAuth);
if (authOverlay) authOverlay.addEventListener('click', (e) => e.target === authOverlay && closeAuth());

if (toRegister) toRegister.addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
});
if (toLogin) toLogin.addEventListener('click', () => {
  registerForm.style.display = 'none';
  loginForm.style.display = 'block';
});

if (lForm) lForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('lEmail').value;
  const mockName = email.split('@')[0];
  updateUserUI(mockName);
  closeAuth();
});

if (rForm) rForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('rName').value;
  updateUserUI(name);
  closeAuth();
});

/* ============================================================
   API CONFIGURATION (SUBDOMAIN SUPPORT)
============================================================ */
const API_CONFIG = {
  getBaseURL: function() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    let baseURL;

    // 1. Local Development Fallback
    // If we're on localhost or 127.0.0.1 (likely using Live Server or direct access),
    // or if opened locally via file protocol, we target the backend port (5000) directly.
    if (!hostname || protocol === 'file:') {
      baseURL = 'http://localhost:5000';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      baseURL = `${protocol}//${hostname}:5000`;
    } 
    // 2. Subdomain Logic
    else {
      const parts = hostname.split('.');
      
      // If we are already on the API subdomain
      if (parts[0] === 'api') {
        baseURL = `${protocol}//${hostname}${port ? ':' + port : ''}`;
      } 
      // If we are on products subdomain, point to the api subdomain
      else if (parts[0] === 'products') {
        const domain = parts.slice(1).join('.');
        baseURL = `${protocol}//api.${domain}${port ? ':' + port : ''}`;
      }
      // If we are on the main domain (e.g. gadgets.local), prepend 'api.'
      else {
        baseURL = `${protocol}//api.${hostname}${port ? ':' + port : ''}`;
      }
    }
    
    console.log(`[API_CONFIG] Environment: ${hostname}, Routing to: ${baseURL}`);
    return baseURL;
  },
  
  getProductsURL: function() {
    return `${this.getBaseURL()}/api/products`;
  },
  
  getReviewsURL: function() {
    return `${this.getBaseURL()}/api/reviews`;
  }
};

/* ============================================================
   OFFLINE FALLBACK DATA
   Used when the backend API (localhost:5000) is unreachable,
   e.g. when the site is opened via Live Server / static hosting.
============================================================ */
const FALLBACK_PRODUCTS = [
  {
    "id": "i16pm",
    "brand": "Apple iPhone",
    "category": "phones",
    "name": "iPhone 16 Pro Max 256GB",
    "description": "A18 Pro chip, 48MP Fusion camera, Camera Control button and titanium design.",
    "price": 2500000,
    "stock": true,
    "specs": {
      "Chipset": "A18 Pro Bionic",
      "Display": "6.9\" ProMotion",
      "Storage": "256GB",
      "Camera": "48MP Fusion"
    },
    "image": "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(170,175,200,.12),rgba(90,95,115,.18))"
  },
  {
    "id": "i16",
    "brand": "Apple iPhone",
    "category": "phones",
    "name": "iPhone 16 128GB",
    "description": "A18 chip, 48MP main camera, Action Button and the new Camera Control.",
    "price": 1850000,
    "stock": true,
    "specs": {
      "Chipset": "A18 Bionic",
      "Display": "6.1\" Super Retina XDR",
      "Storage": "128GB",
      "Camera": "48MP Dual"
    },
    "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(18,94,160,.16),rgba(140,92,255,.14))"
  },
  {
    "id": "i15",
    "brand": "Apple iPhone",
    "category": "phones",
    "name": "iPhone 15 128GB",
    "description": "48MP main camera, Dynamic Island, USB-C and the A16 Bionic chip.",
    "price": 1550000,
    "stock": true,
    "specs": {
      "Chip": "A16 Bionic",
      "Display": "Super Retina XDR",
      "Camera": "48MP Main",
      "Port": "USB-C"
    },
    "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(18,94,160,.16),rgba(140,92,255,.14))"
  },
  {
    "id": "s24fe",
    "brand": "Samsung Galaxy",
    "category": "phones",
    "name": "Galaxy S24 FE 256GB",
    "description": "Flagship Fan Edition with Galaxy AI, 50MP camera and Exynos 2400e power.",
    "price": 1115000,
    "stock": true,
    "specs": {
      "Processor": "Exynos 2400e",
      "Display": "6.7\" AMOLED 2X",
      "Storage": "8GB / 256GB",
      "Camera": "50MP Triple"
    },
    "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(14,30,120,.38),rgba(5,12,55,.45))"
  },
  {
    "id": "zfold6",
    "brand": "Samsung Galaxy",
    "category": "phones",
    "name": "Galaxy Z Fold 6 256GB",
    "description": "Foldable powerhouse with a 7.6\" main display, Galaxy AI and S-Pen support.",
    "price": 3005000,
    "stock": true,
    "specs": {
      "Processor": "SD 8 Gen 3",
      "Main Display": "7.6\" AMOLED 2X",
      "Storage": "12GB / 256GB",
      "Battery": "4400mAh"
    },
    "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(20,40,160,.22),rgba(8,18,80,.28))"
  },
  {
    "id": "pvflip2",
    "brand": "Tecno",
    "category": "phones",
    "name": "Phantom V Flip 2 5G 256GB",
    "description": "Compact 5G flip phone with a vivid cover screen and 8GB RAM.",
    "price": 1060000,
    "stock": true,
    "specs": {
      "Network": "5G",
      "Memory": "8GB / 256GB",
      "Display": "6.9\" AMOLED Fold",
      "Camera": "64MP Dual"
    },
    "image": "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(34,197,94,.16),rgba(16,185,129,.14),rgba(7,23,19,.24))"
  },
  {
    "id": "note40pro",
    "brand": "Infinix",
    "category": "phones",
    "name": "Note 40 Pro 256GB",
    "description": "108MP camera, 8GB RAM and 45W all-round fast charging on Android 14.",
    "price": 405500,
    "stock": true,
    "specs": {
      "OS": "Android 14",
      "Memory": "8GB / 256GB",
      "Display": "120Hz AMOLED",
      "Camera": "108MP Triple"
    },
    "image": "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(34,197,94,.16),rgba(16,185,129,.14),rgba(7,23,19,.24))"
  },
  {
    "id": "spark30pro",
    "brand": "Tecno",
    "category": "phones",
    "name": "Spark 30 Pro 256GB",
    "description": "Big 8GB RAM, 256GB storage and a smooth 120Hz display for everyday use.",
    "price": 285100,
    "stock": true,
    "specs": {
      "Memory": "8GB / 256GB",
      "Display": "120Hz",
      "Camera": "50MP Main",
      "Battery": "5000mAh"
    },
    "image": "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(34,197,94,.16),rgba(16,185,129,.14),rgba(7,23,19,.24))"
  },
  {
    "id": "redmi13",
    "brand": "Xiaomi",
    "category": "phones",
    "name": "Redmi 13 8GB 256GB",
    "description": "108MP camera, large 8GB RAM and a crisp FHD+ display at a great price.",
    "price": 250600,
    "stock": true,
    "specs": {
      "Memory": "8GB / 256GB",
      "Display": "FHD+ 90Hz",
      "Camera": "108MP Dual",
      "Battery": "5030mAh"
    },
    "image": "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(34,197,94,.16),rgba(16,185,129,.14),rgba(7,23,19,.24))"
  },
  {
    "id": "a06",
    "brand": "Samsung Galaxy",
    "category": "phones",
    "name": "Galaxy A06 4GB 128GB",
    "description": "Affordable everyday Samsung with a 50MP camera and 5000mAh battery.",
    "price": 156500,
    "stock": false,
    "specs": {
      "Memory": "4GB / 128GB",
      "Display": "6.7\" HD+",
      "Camera": "50MP Dual",
      "Battery": "5000mAh"
    },
    "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(14,30,120,.38),rgba(5,12,55,.45))"
  },
  {
    "id": "flex5",
    "brand": "Lenovo",
    "category": "laptops",
    "name": "Ideapad Flex 5 14\"",
    "description": "Versatile 2-in-1 convertible with 8GB RAM and a fast 512GB SSD.",
    "price": 770000,
    "stock": false,
    "specs": {
      "Memory": "8GB RAM",
      "Storage": "512GB SSD",
      "Display": "14\" Touch",
      "Form": "2-in-1 Convertible"
    },
    "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(200,200,200,.1),rgba(80,80,80,.15))"
  },
  {
    "id": "lat7389",
    "brand": "Dell",
    "category": "laptops",
    "name": "Latitude 7389 2-in-1",
    "description": "13.3\" business convertible, Core i7, 16GB RAM and a 256GB SSD on Win 10 Pro.",
    "price": 437000,
    "stock": false,
    "specs": {
      "Processor": "Intel Core i7",
      "Memory": "16GB RAM",
      "Storage": "256GB SSD",
      "Display": "13.3\" Touch"
    },
    "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(150,155,180,.12),rgba(80,85,110,.18))"
  },
  {
    "id": "watchultra",
    "brand": "Samsung Galaxy",
    "category": "accessories",
    "name": "Galaxy Watch Ultra LTE 47mm",
    "description": "Rugged titanium smartwatch with LTE, advanced health and 100m water resistance.",
    "price": 861000,
    "stock": true,
    "specs": {
      "Case": "47mm Titanium",
      "Connectivity": "LTE + BT",
      "Rating": "10ATM / IP68",
      "Health": "BioActive Sensor"
    },
    "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(130,140,200,.1),rgba(70,80,140,.15))"
  },
  {
    "id": "watch7",
    "brand": "Samsung Galaxy",
    "category": "accessories",
    "name": "Galaxy Watch7 44mm",
    "description": "Bluetooth smartwatch with advanced BioActive sensors, sleep tracking and Wear OS.",
    "price": 436000,
    "stock": true,
    "specs": {
      "Case": "44mm",
      "Connectivity": "Bluetooth",
      "Health": "BioActive Sensor",
      "OS": "Wear OS"
    },
    "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(14,30,120,.38),rgba(5,12,55,.45))"
  },
  {
    "id": "awultra2",
    "brand": "Apple Watch",
    "category": "accessories",
    "name": "Apple Watch Ultra 2 49mm",
    "description": "Rugged titanium case, brightest Apple display ever, precision dual-frequency GPS.",
    "price": 1950000,
    "stock": true,
    "specs": {
      "Case": "49mm Titanium",
      "Chip": "S9 SiP",
      "Battery": "Up to 36 Hours",
      "Rating": "WR100 / EN13319"
    },
    "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(130,140,200,.1),rgba(70,80,140,.15))"
  },
  {
    "id": "tecnowatch1",
    "brand": "Tecno",
    "category": "accessories",
    "name": "Tecno Watch 1",
    "description": "Affordable fitness smartwatch with heart-rate monitoring and multiple sport modes.",
    "price": 15000,
    "stock": true,
    "specs": {
      "Display": "Full Touch",
      "Health": "Heart Rate",
      "Modes": "Multi-Sport",
      "Battery": "Long Life"
    },
    "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(34,197,94,.16),rgba(16,185,129,.14),rgba(7,23,19,.24))"
  },
  {
    "id": "airpodspro2",
    "brand": "Apple",
    "category": "audio",
    "name": "AirPods Pro (2nd Gen)",
    "description": "Adaptive Audio, 2x stronger Active Noise Cancellation and USB-C charging.",
    "price": 355000,
    "stock": true,
    "specs": {
      "Chip": "Apple H2",
      "ANC": "Active + Adaptive",
      "Case": "USB-C MagSafe",
      "Battery": "30hrs w/ Case"
    },
    "image": "https://images.unsplash.com/photo-1590664095641-7fa05f689813?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(170,175,200,.12),rgba(90,95,115,.18))"
  },
  {
    "id": "wh1000xm5",
    "brand": "Sony",
    "category": "audio",
    "name": "WH-1000XM5 Headphones",
    "description": "Industry-leading noise cancellation with crystal-clear hands-free calling.",
    "price": 490000,
    "stock": true,
    "specs": {
      "Type": "Over-ear Wireless",
      "ANC": "Dual Processor",
      "Battery": "30 Hours",
      "Connectivity": "BT 5.2"
    },
    "image": "https://images.unsplash.com/photo-1590664095641-7fa05f689813?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(20,40,160,.22),rgba(8,18,80,.28))"
  },
  {
    "id": "buds3pro",
    "brand": "Samsung Galaxy",
    "category": "audio",
    "name": "Galaxy Buds 3 Pro",
    "description": "Intelligent ANC, blade-style design and 360° spatial audio.",
    "price": 283000,
    "stock": true,
    "specs": {
      "Audio": "Hi-Fi 24-bit",
      "ANC": "Intelligent",
      "Connectivity": "BT 5.4",
      "Battery": "30hrs w/ Case"
    },
    "image": "https://images.unsplash.com/photo-1590664095641-7fa05f689813?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(20,40,160,.22),rgba(8,18,80,.28))"
  },
  {
    "id": "taba9",
    "brand": "Samsung Galaxy",
    "category": "tablets",
    "name": "Galaxy Tab A9 LTE 64GB",
    "description": "Compact 8.7\" tablet with LTE, 4GB RAM and dual speakers for media on the go.",
    "price": 291000,
    "stock": true,
    "specs": {
      "Display": "8.7\" WXGA+",
      "Memory": "4GB / 64GB",
      "Network": "LTE + WiFi",
      "Battery": "5100mAh"
    },
    "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(188,0,255,.1),rgba(60,0,100,.2))"
  },
  {
    "id": "ps5slim",
    "brand": "PlayStation",
    "category": "gaming",
    "name": "PlayStation 5 Slim 1TB",
    "description": "Slimmer PS5 with a 1TB SSD, lightning-fast loading and 4K gaming.",
    "price": 800000,
    "stock": true,
    "specs": {
      "Storage": "1TB SSD",
      "Resolution": "Up to 4K 120Hz",
      "Edition": "Disc Edition",
      "Feature": "DualSense Haptics"
    },
    "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(255,255,255,.05),rgba(0,242,255,.1))"
  },
  {
    "id": "quest3",
    "brand": "Meta",
    "category": "gaming",
    "name": "Meta Quest 3 128GB",
    "description": "Breakthrough mixed-reality headset with full-colour passthrough and crisp visuals.",
    "price": 900000,
    "stock": true,
    "specs": {
      "Storage": "128GB",
      "Display": "4K+ Infinite",
      "Chipset": "Snapdragon XR2 Gen 2",
      "Feature": "Colour Passthrough"
    },
    "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(0,242,255,.1),rgba(0,80,120,.2))"
  }
];

const FALLBACK_REVIEWS = [
  {"id":1,"initials":"CA","name":"Chinedu A.","location":"Lagos, Nigeria","text":"Excellent service and authentic products. My iPhone arrived exactly as described — sealed and brand new. Will absolutely shop here again!","stars":5,"color":"linear-gradient(135deg,#1428A0,#00020bd5)"},
  {"id":2,"initials":"GO","name":"Grace O.","location":"Abuja, Nigeria","text":"Very reliable store. The Samsung Galaxy device I purchased works perfectly. Great customer service and very fair pricing.","stars":5,"color":"linear-gradient(135deg,#000000,#1a9050)"},
  {"id":3,"initials":"ME","name":"Michael E.","location":"Port Harcourt, Nigeria","text":"Fast delivery and professional communication throughout. Highly recommended for anyone looking for genuine gadgets at reasonable prices.","stars":5,"color":"linear-gradient(135deg,#501090,#0c0412)"},
  {"id":4,"initials":"OE","name":"Obong E.","location":"Calabar, Nigeria","text":"Passionate and dedicated services. I highly recommend this brand for anyone looking for genuine gadgets at affordable prices.","stars":5,"color":"linear-gradient(135deg,#8f0c54,#7a990b)"},
  {"id":5,"initials":"CA","name":"Chioma A.","location":"Enugu, Nigeria","text":"My package arrived completely sealed, 100% original, and beautifully boxed. Absolute peace of mind!","stars":5,"color":"linear-gradient(135deg,#036308,#6b13b4)"},
  {"id":6,"initials":"TO","name":"Tunde O.","location":"Ibadan, Nigeria","text":"I bought a smartwatch in the morning, and it was in my hands before evening. The customer service team kept me updated every step of the way.","stars":5,"color":"linear-gradient(135deg,#2e0755,#c10194)"},
  {"id":7,"initials":"AM","name":"Amina M.","location":"Wuse Abuja, Nigeria","text":"Bought a pair of wireless earbuds and a laptop charger. Both work perfectly and the sound quality on the buds is exceptional.","stars":5,"color":"linear-gradient(135deg,#0e5b5c,#fff200)"},
  {"id":8,"initials":"AA","name":"Clement I.","location":"Oyo, Nigeria","text":"I was incredibly skeptical about buying a high-end device online, but Daniel Gadgets proved me wrong. I can assure you that it's a reliable brand.","stars":5,"color":"linear-gradient(135deg,#d2375e,#050304)"},
  {"id":9,"initials":"AA","name":"Amaka A.","location":"Enugu, Nigeria","text":"Purchased an Apple Watch and I am completely blown away by the quality. The team was responsive and helpful every step of the process.","stars":5,"color":"linear-gradient(135deg,#c7be0f,#621126)"},
  {"id":10,"initials":"OB","name":"Oluwaseun B.","location":"Ibadan, Nigeria","text":"Best gadget store I have encountered online. The authenticity guarantee gives me confidence every time I place an order. A truly 10/10 experience.","stars":5,"color":"linear-gradient(135deg,#431b00,#015570)"}
];

/* ============================================================
   PRODUCT LOADING & FILTERING
============================================================ */
const pgrid = document.querySelector('.pgrid');
let allProducts = [];
let cachedProducts = {};

async function fetchAndRenderProducts() {
  if (!pgrid) {
    // Still initialize animations even if there's no product grid
    initAnimations();
    return;
  }
  
  try {
    const apiURL = API_CONFIG.getProductsURL();
    console.log(`Fetching products from: ${apiURL}`);
    
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    allProducts = await response.json();
    console.log(`Loaded ${allProducts.length} products`);
    
    renderProducts(allProducts);
  } catch (error) {
    console.warn(`Could not load from API: ${error.message}. Using offline data.`);
    allProducts = FALLBACK_PRODUCTS;
    renderProducts(FALLBACK_PRODUCTS);
  }
}

function renderProducts(products) {
  if (!pgrid) return;
  pgrid.innerHTML = '';
  
  products.forEach(product => {
    const card = createProductCard(product);
    pgrid.appendChild(card);
  });
  
  setupFilterListeners();
  initAnimations();
}

function createProductCard(product) {
  const article = document.createElement('article');
  article.className = `pcard fu`;
  article.dataset.category = product.category || 'all';
  article.dataset.productId = product.id || '';
  
  const stockStatus = product.stock ? 'In Stock' : 'Out of Stock';
  const badgeColor = product.stock ? 'var(--accent-cyan)' : 'rgba(255, 100, 100, 0.5)';
  
  const imageHTML = product.image 
    ? `<img src="${product.image}" alt="${product.name}" class="pimg-real">`
    : `
        <div class="pdevice">
          <div class="ph" style="background:${product.deviceGradient || 'linear-gradient(150deg,#0d1b55 0%,#08123a 55%,#040b22 100%)'}">
            <div class="ph-hole"></div>
            <div class="ph-screen" style="background:${product.screenGradient || 'linear-gradient(160deg,rgba(20,45,180,.55),rgba(5,15,70,.7))'}"></div>
          </div>
        </div>
      `;

  article.innerHTML = `
    <div class="stock-badge" style="background: ${badgeColor}20; border-color: ${badgeColor};">
      <span class="stock-dot" style="background: ${badgeColor};"></span>
      ${stockStatus}
    </div>
    <div class="pspecs">
      ${Object.entries(product.specs || {})
        .map(([key, value]) => `
        <div class="pspec-row">
          <span class="pspec-lbl">${key}</span>
          <span class="pspec-val">${value}</span>
        </div>
      `).join('')}
      <button class="btn-v" style="margin-top:15px" onclick="goWA()">Order Now</button>
    </div>
    <div class="pimg">
      <div class="pimg-bg" style="background:${product.gradient || 'linear-gradient(135deg,rgba(20,40,160,.2),rgba(5,15,70,.3))'}"></div>
      ${imageHTML}
    </div>
    <div class="pinfo">
      <div class="pcat">${product.brand}</div>
      <h3 class="pname">${product.name}</h3>
      <p class="pdesc">${product.description}</p>
      <div class="pfooter">
        <div><div class="pprice-lbl">Price</div><div class="pprice">₦${product.price.toLocaleString()}</div></div>
        <button class="btn-v" onclick="goWA()">View Details</button>
      </div>
    </div>
  `;
  
  article.addEventListener('click', (event) => {
    if (event.target.closest('.btn-v')) return;
    goWA();
  });
  
  return article;
}

let filtersInitialized = false;
function setupFilterListeners() {
  if (filtersInitialized) return;
  const filterBtns = document.querySelectorAll('.f-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const pCards = document.querySelectorAll('.pcard');
      pCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          setTimeout(() => { 
            card.style.opacity = '1'; 
            card.style.transform = 'translateY(0) scale(1)'; 
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 400);
        }
      });
    });
  });
  filtersInitialized = true;
}

/* ============================================================
   REVIEWS LOADING
============================================================ */
async function fetchAndRenderReviews() {
  const rvTrack = document.getElementById('rvTrack');
  if (!rvTrack) return;
  try {
    const apiURL = API_CONFIG.getReviewsURL();
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const reviews = await response.json();
    if (reviews && reviews.length > 0) {
      renderReviews(reviews);
    } else {
      renderReviews(FALLBACK_REVIEWS);
    }
  } catch (error) {
    console.warn(`Could not load reviews from API: ${error.message}. Using offline data.`);
    renderReviews(FALLBACK_REVIEWS);
  }
}

function renderReviews(reviews) {
  const rvTrack = document.getElementById('rvTrack');
  if (!rvTrack) return;
  rvTrack.innerHTML = '';
  
  reviews.forEach(review => {
    const card = createReviewCard(review);
    rvTrack.appendChild(card);
  });
  
  initCarousel();
}

function createReviewCard(rv) {
  const div = document.createElement('div');
  div.className = 'rv-card';
  div.innerHTML = `
    <div class="rv-inner" style="cursor:pointer">
      <div class="stars">${'★'.repeat(rv.stars)}${'☆'.repeat(5-rv.stars)}</div>
      <p class="rv-txt">"${rv.text}"</p>
      <div class="rv-author">
        <div class="rv-av" style="background:${rv.color}">${rv.initials}</div>
        <div>
          <div class="rv-name">${rv.name}</div>
          <div class="rv-loc">${rv.location}</div>
        </div>
      </div>
    </div>
  `;
  div.querySelector('.rv-inner').addEventListener('click', () => {
    window.open('https://t.me/DanielClothings000', '_blank');
  });
  return div;
}

/* ============================================================
   THEME
============================================================ */
const html = document.documentElement;
const tBtn = document.getElementById('themeBtn');
const tLabel = document.getElementById('tLabel');

function setTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('dg_theme', t);
  if (tLabel) tLabel.textContent = t === 'dark' ? 'Switch to Light' : 'Switch to Dark';
}
setTheme(localStorage.getItem('dg_theme') || 'dark');
if (tBtn) tBtn.addEventListener('click', () => setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark'));

/* ============================================================
   MENU
============================================================ */
const burger = document.getElementById('burgerBtn');
const overlay = document.getElementById('overlay');
const menu = document.getElementById('sidemenu');
const closeB = document.getElementById('closeBtn');

function openMenu() {
  if (!menu || !overlay || !burger) return;
  menu.classList.add('on');
  overlay.classList.add('on');
  burger.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  overlay.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  if (!menu || !overlay || !burger) return;
  menu.classList.remove('on');
  overlay.classList.remove('on');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
if (burger) burger.addEventListener('click', () => menu.classList.contains('on') ? closeMenu() : openMenu());
if (closeB) closeB.addEventListener('click', closeMenu);
if (overlay) overlay.addEventListener('click', closeMenu);
document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

/* ============================================================
   NAV SCROLL SHADOW
============================================================ */
const topnav = document.querySelector('.topnav');
window.addEventListener('scroll', () => {
  if (topnav) topnav.style.boxShadow = window.scrollY > 40 ? '0 4px 28px rgba(0,0,0,.35)' : 'none';
}, { passive: true });

/* ============================================================
   TEXT SCRAMBLE EFFECT
============================================================ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="d-char">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

const scrambleIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fx = new TextScramble(entry.target);
      fx.setText(entry.target.getAttribute('data-text') || entry.target.innerText);
      scrambleIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

function initScramble() {
  document.querySelectorAll('.sec-title, .h1-main, .h1-accent').forEach(el => {
    el.setAttribute('data-text', el.innerText);
    scrambleIO.observe(el);
  });
}

/* ============================================================
   REVIEWS CAROUSEL
============================================================ */
let cur = 0, spv = 3, maxS = 0, autoT;

function getSPV() { return window.innerWidth <= 580 ? 1 : window.innerWidth <= 900 ? 2 : 3; }

function buildDots() {
  const track = document.getElementById('rvTrack');
  const dotsW = document.getElementById('rvDots');
  if (!track || !dotsW) return;
  
  const TOTAL = track.children.length;
  spv = getSPV();
  maxS = Math.max(0, TOTAL - spv);
  dotsW.innerHTML = '';
  for (let i = 0; i <= maxS; i++) {
    const d = document.createElement('button');
    d.className = 'cdot' + (i === cur ? ' a' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', () => go(i));
    dotsW.appendChild(d);
  }
}

function go(i) {
  const track = document.getElementById('rvTrack');
  const dotsW = document.getElementById('rvDots');
  if (!track || !dotsW) return;
  
  cur = Math.max(0, Math.min(i, maxS));
  track.style.transform = `translateX(-${cur * (100 / spv)}%)`;
  dotsW.querySelectorAll('.cdot').forEach((d, j) => d.classList.toggle('a', j === cur));
}

function next() { go(cur >= maxS ? 0 : cur + 1); }
function prev() { go(cur <= 0 ? maxS : cur - 1); }
function startAuto() { if (autoT) clearInterval(autoT); autoT = setInterval(next, 4200); }
function resetAuto() { startAuto(); }

function initCarousel() {
  const nextBtn = document.getElementById('rvNext');
  const prevBtn = document.getElementById('rvPrev');
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  
  buildDots();
  startAuto();
  window.addEventListener('resize', () => { buildDots(); go(cur); });
}

/* ============================================================
   SCROLL ANIMATIONS
============================================================ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
  });
}, { threshold: .12, rootMargin: '0px 0px -36px 0px' });

function initAnimations() {
  document.querySelectorAll('.fu').forEach(el => io.observe(el));
}

/* ============================================================
   MAGNETIC BUTTONS
============================================================ */
const magneticButtons = document.querySelectorAll('.btn-p, .btn-s, .btn-v');
magneticButtons.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.02)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ============================================================
   ANIMATED COUNTERS
============================================================ */
function animNum(el) {
  const to = parseFloat(el.dataset.to);
  const sfx = el.dataset.sfx || '';
  const dec = el.dataset.dec === '1';
  const dur = 2000;
  const t0 = performance.now();
  (function tick(now) {
    const prog = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    el.textContent = (dec ? (to * ease).toFixed(1) : Math.floor(to * ease).toLocaleString()) + sfx;
    if (prog < 1) requestAnimationFrame(tick);
  })(t0);
}
const cio = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animNum(e.target); cio.unobserve(e.target); } });
}, { threshold: .5 });

function initCounters() {
  document.querySelectorAll('.tnum').forEach(el => cio.observe(el));
}

/* =============================================================
   UTILITY
============================================================ */
window.goWA = function() { window.open('https://wa.me/2349132715125', '_blank', 'noopener,noreferrer'); }
window.openTikTok = function() { window.open('https://www.tiktok.com/@danielclothings_', '_blank', 'noopener,noreferrer'); }

document.querySelectorAll('.fcard').forEach(card => {
  card.addEventListener('click', () => window.openTikTok());
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('dg_user');
  if (savedUser) updateUserUI(savedUser);
  
  fetchAndRenderProducts().then(() => {
    initScramble();
  });
  
  
  fetchAndRenderReviews();
  initCounters();
});
