const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const authRoutes = require('./routes/authRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const cartRoutes = require('./routes/cartRoutes.js');
const Cart = require('./models/Cart.js');
const Wishlist = require('./models/Wishlist.js');
const User = require('./models/User.js');
const settingsRoutes = require('./routes/settingsRoutes.js');
const wishlistRoutes = require('./routes/wishlistRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const pageConfigRoutes = require('./routes/pageConfigRoutes.js');
const pageRoutes = require('./routes/pageRoutes.js');
const policyRoutes = require('./routes/policyRoutes.js');
const mediaRoutes = require('./routes/mediaRoutes.js');
const formRoutes = require('./routes/formRoutes.js');
const newsletterRoutes = require('./routes/newsletterRoutes.js');
const couponRoutes = require('./routes/couponRoutes.js');
const gmcFeedRoutes = require('./routes/gmcFeedRoutes.js');
const sitemapRoutes = require('./routes/sitemapRoutes.js');
const { submitChatMessage } = require('./controllers/formController.js');
const paymentController = require('./controllers/paymentController.js');
const { initializeMiddleware } = require('./middleware/guestIdMiddleware.js');

const app = express();

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection]', reason);
});

// Middleware - CORS configuration
// Handle both development and production origins
const allowedOrigins = [
  'http://localhost:5173',      // Local development (Vite)
  'http://localhost:5000',      // Local backend
  'http://localhost:3000',      // Alternative local dev
  'https://wolfsupplies.co.uk', // Production domain
  process.env.CLIENT_URL,       // Environment variable
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Guest-ID'],
  exposedHeaders: ['X-Guest-ID', 'Content-Type', 'Set-Cookie'],
  credentials: true, // Allow credentials (cookies, auth headers)
  optionsSuccessStatus: 200,
  maxAge: 3600 // Cache preflight for 1 hour
};

app.use(cors(corsOptions));

// Middleware to ensure X-Guest-ID header is always set in responses
app.use((req, res, next) => {
  // Wrap res.json and res.send to ensure X-Guest-ID is set
  const originalJson = res.json;
  const originalSend = res.send;
  
  res.json = function(data) {
    if (req.guestId) {
      res.setHeader('X-Guest-ID', req.guestId);
    }
    return originalJson.call(this, data);
  };
  
  res.send = function(data) {
    if (req.guestId) {
      res.setHeader('X-Guest-ID', req.guestId);
    }
    return originalSend.call(this, data);
  };
  
  next();
});

// Stripe webhook endpoint requires raw body so mount before express.json
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.webhookHandler);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    const conn = await mongoose.connect(mongoUri);
    console.log('[Database] Connected successfully');

    // Add error handlers to mongoose connection
    mongoose.connection.on('error', (err) => {
      console.error('[Mongoose Connection Error]', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[Mongoose] Connection disconnected');
    });

    return conn;
  } catch (error) {
    console.error('[Database Connection Error]', error.message);
    // Don't exit - let server continue for debugging

  }
};

// Initialize middleware and database synchronously
let guestIdMiddleware;

const initializeApp = async () => {
  try {
    // Initialize guest ID middleware FIRST
    guestIdMiddleware = await initializeMiddleware();
    
    app.use(guestIdMiddleware);
    
    // Now register all routes AFTER middleware is applied
    registerRoutes();
    
    // Connect to database
    await connectDB();
  } catch (err) {
    console.error('[Initialization Error]', err.message, err.stack);
    process.exit(1);
  }
};

// Function to register all routes
const registerRoutes = () => {
  // Routes
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to E-Commerce API' });
  });

  // API routes
  try {
    app.use('/api/users', authRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/wishlist', wishlistRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/page-config', pageConfigRoutes);
    app.use('/api/pages', pageRoutes);
    app.use('/api/policies', policyRoutes);
    app.use('/api/media', mediaRoutes);
    app.use('/api/forms', formRoutes);
    app.use('/api/newsletter', newsletterRoutes);
    app.use('/api/coupons', couponRoutes);
    app.use('/api', gmcFeedRoutes);
    app.use('/api', sitemapRoutes);

    // Chat button endpoint (separate from forms)
    app.post('/api/chat', submitChatMessage);
  } catch (routeErr) {
    console.error('[Routes Setup Error]', routeErr.message, routeErr.stack);
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
  });

  // Debug endpoint to check database
  app.get('/api/debug/carts', async (req, res) => {
    try {
      const carts = await Cart.find({}).lean();

      res.json({ carts, count: carts.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/debug/wishlists', async (req, res) => {
    try {
      const wishlists = await Wishlist.find({}).lean();

      res.json({ wishlists, count: wishlists.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/debug/users', async (req, res) => {
    try {
      const users = await User.find({}).select('-password').lean();

      res.json({ users, count: users.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('[Express Error Handler]', err.message);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
};

// Start initialization
(async () => {
  await initializeApp();
  
  // Start server AFTER initialization is complete
  const PORT = process.env.PORT || 5000;
  try {
    const server = app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
    });

    server.on('error', (err) => {
      console.error('[Server Error]', err.message);
      process.exit(1);
    });

    // Keep server alive
    process.on('exit', () => {
      console.log('[Server] Shutting down gracefully');
    });
  } catch (err) {
    console.error('[Server Startup Error]', err.message);
    process.exit(1);
  }
})();
