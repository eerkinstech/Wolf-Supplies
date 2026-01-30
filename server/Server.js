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
import { submitChatMessage } from './controllers/formController.js';
import paymentController from './controllers/paymentController.js';
import { guestIdMiddleware } from './middleware/guestIdMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop problematic indexes and recreate
    try {
      const cartCollection = mongoose.connection.collection('carts');
      const indexes = await cartCollection.getIndexes();
      console.log('Existing cart indexes:', indexes);
      
      // Drop user_1 index if it exists (unique index causing problems)
      if (indexes.user_1) {
        try {
          console.log('Dropping user_1 index...');
          await cartCollection.dropIndex('user_1');
          console.log('user_1 index dropped');
        } catch (dropErr) {
          console.log('Could not drop user_1 index:', dropErr.message);
        }
      }
    } catch (indexErr) {
      console.log('Index cleanup note:', indexErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't exit - let server continue for debugging
    console.log('Continuing despite database error...');
  }
};

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-Commerce API' });
});

// API routes
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

// Chat button endpoint (separate from forms)
app.post('/api/chat', submitChatMessage);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Debug endpoint to check database
app.get('/api/debug/carts', async (req, res) => {
  try {
    const carts = await Cart.find({}).lean();
    console.log('All carts in database:', carts);
    res.json({ carts, count: carts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/debug/wishlists', async (req, res) => {
  try {
    const wishlists = await Wishlist.find({}).lean();
    console.log('All wishlists in database:', wishlists);
    res.json({ wishlists, count: wishlists.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    console.log('All users in database:', users);
    res.json({ users, count: users.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});