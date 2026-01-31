import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';
import User from './models/User.js';
import settingsRoutes from './routes/settingsRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import pageConfigRoutes from './routes/pageConfigRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import formRoutes from './routes/formRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import { submitChatMessage } from './controllers/formController.js';
import paymentController from './controllers/paymentController.js';
import { guestIdMiddleware } from './middleware/guestIdMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection]', reason);
});

// Middleware - CORS with credentials support
// When credentials are enabled, wildcard origin is not allowed
// Must specify exact origin(s) that can send credentials
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Frontend URL
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Stripe webhook endpoint requires raw body so mount before express.json
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.webhookHandler);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Guest ID middleware - applies to all routes
app.use(guestIdMiddleware);

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

// Connect to database
connectDB().catch(err => {
  console.error('[Database Connection Unhandled Error]', err.message);
}).finally(() => {
  console.log('[Server] Database initialization complete, proceeding with route setup');
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-Commerce API' });
});

// API routes
try {
  console.log('[Server] Setting up routes...');
  app.use('/api/users', authRoutes);
  console.log('[Server] Users route mounted');
  app.use('/api/categories', categoryRoutes);
  console.log('[Server] Categories route mounted');
  app.use('/api/products', productRoutes);
  console.log('[Server] Products route mounted');
  app.use('/api/upload', uploadRoutes);
  console.log('[Server] Upload route mounted');
  app.use('/api/orders', orderRoutes);
  console.log('[Server] Orders route mounted');
  app.use('/api/settings', settingsRoutes);
  console.log('[Server] Settings route mounted');
  app.use('/api/cart', cartRoutes);
  console.log('[Server] Cart route mounted');
  app.use('/api/wishlist', wishlistRoutes);
  console.log('[Server] Wishlist route mounted');
  app.use('/api/payments', paymentRoutes);
  console.log('[Server] Payments route mounted');
  app.use('/api/page-config', pageConfigRoutes);
  console.log('[Server] Page config route mounted');
  app.use('/api/pages', pageRoutes);
  console.log('[Server] Pages route mounted');
  app.use('/api/policies', policyRoutes);
  console.log('[Server] Policies route mounted');
  app.use('/api/media', mediaRoutes);
  console.log('[Server] Media route mounted');
  app.use('/api/forms', formRoutes);
  console.log('[Server] Forms route mounted');
  app.use('/api/newsletter', newsletterRoutes);
  console.log('[Server] Newsletter route mounted');
  app.use('/api/coupons', couponRoutes);
  console.log('[Server] Coupons route mounted');

  // Chat button endpoint (separate from forms)
  app.post('/api/chat', submitChatMessage);
  console.log('[Server] Chat route mounted');
  console.log('[Server] All routes mounted successfully');
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

  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

try {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
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

