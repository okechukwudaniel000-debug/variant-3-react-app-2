require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Enhanced CORS for subdomain support
const corsOptions = {
  origin: function (origin, callback) {
    // Basic allowed origins
    const baseOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      /localhost/,
      /127\.0\.0\.1/,
      /gadgets\.local$/,
      /daniel-gadgets\.com$/
    ];

    // Merge with origins from environment variables if any
    const envOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
      : [];
    
    const allowedOrigins = [...baseOrigins, ...envOrigins];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? origin === allowed : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Robust Data Loader
function loadData(filename, defaultValue = []) {
  const filePath = path.join(__dirname, 'data', filename);
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: Data file ${filename} not found at ${filePath}. Using empty default.`);
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${filename}:`, error.message);
    return defaultValue;
  }
}

let products = loadData('products.json');
let reviews = loadData('reviews.json');

// API Endpoints
app.get('/api/products', (req, res) => {
  try {
    const category = req.query.category;
    let filtered = products;
    
    if (category && category !== 'all') {
      filtered = products.filter(p => p.category === category);
    }
    
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

// Contact Endpoint (Placeholder)
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Received message from ${name} (${email}): ${message}`);
  res.status(200).json({ success: true, message: 'Message received by futuristic relay system.' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`Daniel Gadgets Backend operational on port ${PORT}`);
  console.log(`CORS allowed origins: localhost, 127.0.0.1, .gadgets.local, .daniel-gadgets.com`);
});
