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
    // we target the backend port (5000) directly.
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
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
    "id": "s25u",
    "brand": "Samsung Galaxy",
    "category": "phones",
    "name": "Galaxy S25 Ultra",
    "description": "Titanium build, 200MP camera system, built-in S-Pen, Galaxy AI.",
    "price": 110000,
    "stock": true,
    "specs": {
      "Processor": "SD 8 Gen 4",
      "Display": "6.8\" AMOLED 2X",
      "Camera": "200MP Quad",
      "Battery": "5000mAh"
    },
    "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(14,30,120,.38),rgba(5,12,55,.45))"
  },
  {
    "id": "i16pm",
    "brand": "Apple iPhone",
    "category": "phones",
    "name": "iPhone 16 Pro Max",
    "description": "A18 Pro chip, 64MP Fusion Camera, Action Button, titanium design.",
    "price": 1200000,
    "stock": true,
    "specs": {
      "Chipset": "A18 Pro Bionic",
      "Display": "6.9\" ProMotion",
      "Storage": "256GB - 1TB",
      "Video": "4K 120fps ProRes"
    },
    "image": "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(170,175,200,.12),rgba(90,95,115,.18))"
  },
  {
    "id": "aw10",
    "brand": "Apple Watch",
    "category": "accessories",
    "name": "Apple Watch Series 10",
    "description": "Thinnest Apple Watch ever, advanced health monitoring, 18 hr battery.",
    "price": 350000,
    "stock": true,
    "specs": {
      "Sensor": "Blood Oxygen",
      "Display": "OLED Always-On",
      "Rating": "WR50 Water Res.",
      "Battery": "18-36 Hours"
    },
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYAf3CMo3b5p95nixZGDquBQIizivCk0pcOg&sdata:image/jpeg;base64,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",
    "gradient": "linear-gradient(135deg,rgba(130,140,200,.1),rgba(70,80,140,.15))"
  },
  {
    "id": "gb3p",
    "brand": "Samsung Galaxy",
    "category": "accessories",
    "name": "Galaxy Buds 3 Pro",
    "description": "Intelligent ANC, 3-way speaker system, 360° audio, 30 hr total battery.",
    "price": 98000,
    "stock": true,
    "specs": {
      "Audio": "Hi-Fi 24-bit",
      "ANC": "Intelligent",
      "Connectivity": "BT 5.4",
      "Battery": "30hrs w/ Case"
    },
    "image": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQwlZzMCOIitA58aazelLStYJViBnArhTprZnJ7BSyBi25_jev1Vs8AQUStzB3E0fUBGeTeVSY_Q9-dEDiV5vuqEptB52VGS_1R-2raoE8uhtQFy0USIDi93RGxzA6n7hnOD8x3pUo&usqp=CAc",
    "gradient": "linear-gradient(135deg,rgba(20,40,160,.22),rgba(8,18,80,.28))"
  },
  {
    "id": "i15",
    "brand": "Apple iPhone",
    "category": "phones",
    "name": "iPhone 15",
    "description": "48MP main camera, Dynamic Island, USB-C, A16 Bionic chip.",
    "price": 850000,
    "stock": true,
    "specs": {
      "Chip": "A16 Bionic",
      "Display": "Super Retina XDR",
      "Camera": "48MP Main",
      "Port": "USB-C"
    },
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHKobaohRFVeFUIreijsApWQ7XJPLhxy6YkA&s",
    "gradient": "linear-gradient(135deg,rgba(18,94,160,.16),rgba(140,92,255,.14))"
  },
  {
    "id": "ga55",
    "brand": "Samsung Galaxy",
    "category": "phones",
    "name": "Galaxy A55",
    "description": "50MP OIS camera, Exynos 1480, IP67 water resistance, Super AMOLED.",
    "price": 420000,
    "stock": true,
    "specs": {
      "Processor": "Exynos 1480",
      "Display": "120Hz AMOLED",
      "Protection": "IP67 Rated",
      "Battery": "5000mAh"
    },
    "image": "data:image/webp;base64,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",
    "gradient": "linear-gradient(135deg,rgba(34,197,94,.16),rgba(16,185,129,.14),rgba(7,23,19,.24))"
  },
  {
    "id": "mbpm4",
    "brand": "Apple",
    "category": "laptops",
    "name": "MacBook Pro M4",
    "description": "The world's most advanced laptop for workflows that demand extreme performance.",
    "price": 2450000,
    "stock": false,
    "specs": {
      "Processor": "Apple M4 Max",
      "Display": "14\" Liquid Retina",
      "Memory": "36GB - 128GB",
      "Battery": "Up to 22 Hours"
    },
    "image": "data:image/jpeg;base64,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",
    "gradient": "linear-gradient(135deg,rgba(150,155,180,.12),rgba(80,85,110,.18))"
  },
  {
    "id": "ippm4",
    "brand": "Apple",
    "category": "laptops",
    "name": "iPad Pro 13\" (M4)",
    "description": "Unbelievable performance and the world's most advanced display.",
    "price": 1550000,
    "stock": true,
    "specs": {
      "Display": "Ultra Retina XDR",
      "Chip": "Apple M4",
      "Design": "5.1mm Ultra Thin",
      "Input": "Pencil Pro Support"
    },
    "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(188,0,255,.1),rgba(60,0,100,.2))"
  },
  {
    "id": "cgar",
    "brand": "Samsung",
    "category": "accessories",
    "name": "Cyber Glass AR",
    "description": "Next-gen smart eyeglasses with integrated AR display and AI vision.",
    "price": 420000,
    "stock": true,
    "specs": {
      "Visuals": "HUD AR Overlay",
      "Camera": "12MP Ultra-wide",
      "AI": "Voice Controlled",
      "Audio": "Open-ear Spatial"
    },
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJRozcd7SQbDJw6W1WB1bytAcF7_VypEoHlQ&s",
    "gradient": "linear-gradient(135deg,rgba(0,242,255,.1),rgba(0,80,120,.2))"
  },
  {
    "id": "dxps16",
    "brand": "Dell",
    "category": "laptops",
    "name": "Dell XPS 16 (2026)",
    "description": "The iconic seamless design powered by the latest Intel Core Ultra processors.",
    "price": 2150000,
    "stock": true,
    "specs": {
      "Processor": "Core Ultra 9 185H",
      "Graphics": "RTX 4070 8GB",
      "Display": "4K OLED Touch",
      "Design": "Seamless Glass"
    },
    "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(200,200,200,.1),rgba(80,80,80,.15))"
  },
  {
    "id": "am18r2",
    "brand": "Alienware",
    "category": "laptops",
    "name": "Alienware m18 R2",
    "description": "Maximum performance with an 18-inch display and elite Alienware Cryo-tech.",
    "price": 3850000,
    "stock": true,
    "specs": {
      "Processor": "i9-14900HX",
      "Graphics": "RTX 4090 16GB",
      "Refresh": "480Hz QHD+",
      "Cooling": "Cryo-Tech Liquid"
    },
    "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(188,0,255,.15),rgba(50,0,100,.2))"
  },
  {
    "id": "ps6",
    "brand": "PlayStation",
    "category": "accessories",
    "name": "PlayStation 6",
    "description": "The future of immersive gaming with 16K visuals and advanced neural feedback.",
    "price": 1150000,
    "stock": true,
    "specs": {
      "Resolution": "Native 16K HDR",
      "Graphics": "Ray Tracing Gen 3",
      "Storage": "4TB Quantum SSD",
      "Feature": "Neural Haptic Link"
    },
    "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=500",
    "gradient": "linear-gradient(135deg,rgba(255,255,255,.05),rgba(0,242,255,.1))"
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

/* ============================================================
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
