import Cart from '../models/Cart.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import EventLog from '../models/EventLog.js';

// GET /api/cart - get cart by guestId (or user if authenticated)
export const getCart = asyncHandler(async (req, res) => {
  console.log('==== getCart called ====');
  try {
    const guestId = req.guestId;
    const userId = req.user?._id;

    console.log('Getting cart for guestId:', guestId, 'userId:', userId);
    console.log('Cookies received:', req.headers.cookie);
    
    // Try to find cart by user ID first (if authenticated), then by guestId
    let cart = null;
    if (userId) {
      console.log('Searching cart by userId:', userId);
      cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price image');
    } else if (guestId) {
      console.log('Searching cart by guestId:', guestId);
      cart = await Cart.findOne({ guestId }).populate('items.product', 'name price image');
      console.log('Cart query result:', cart);
    }
    
    console.log('Cart found:', cart ? 'yes' : 'no');
    if (cart) {
      console.log('Cart items count:', cart.items?.length || 0);
    }
    res.json(cart || { items: [] });
  } catch (err) {
    console.error('getCart error:', err.message);
    throw err;
  }
});

// POST /api/cart - update/create cart for guestId or user
export const updateCart = asyncHandler(async (req, res) => {
  console.log('==== updateCart called ====');
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('req.user:', req.user);
  
  const guestId = req.guestId;
  const userId = req.user?._id;
  const { items } = req.body;

  console.log('Updating cart for guestId:', guestId, 'userId:', userId);
  
  if (!Array.isArray(items)) {
    console.error('Items is not an array:', typeof items, items);
    res.status(400);
    throw new Error('Cart items must be an array');
  }

  if (items.length === 0) {
    console.log('Empty items array received');
  }

  // Load or create cart
  let cart = null;
  if (userId) {
    cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.log('Creating new cart for user:', userId);
      cart = new Cart({ user: userId, items: [] });
    }
  } else if (guestId) {
    cart = await Cart.findOne({ guestId });
    if (!cart) {
      console.log('Creating new cart for guestId:', guestId);
      cart = new Cart({ guestId, items: [] });
    }
  } else {
    console.error('No guestId or userId available!');
    res.status(400);
    throw new Error('No user identification available');
  }

  console.log('Found existing cart:', !!cart);
  
  // Replace cart items entirely with incoming items (client is source of truth for full cart)
  const serverItems = [];
  for (const incoming of items) {
    if (!incoming) {
      console.warn('Skipping null/undefined item');
      continue;
    }
    
    let productId = incoming.product;
    if (productId && typeof productId === 'string' && mongoose.Types.ObjectId.isValid(productId)) {
      productId = new mongoose.Types.ObjectId(productId);
    } else {
      productId = productId || undefined;
    }

    serverItems.push({
      product: productId || incoming.product,
      name: incoming.name || '',
      quantity: Math.max(1, parseInt(incoming.quantity) || 1),
      price: Number(incoming.price || 0),
      selectedVariants: incoming.selectedVariants || {},
      image: incoming.image || '',
    });
  }

  console.log('Setting cart items:', serverItems.length, 'items');
  cart.items = serverItems;
  
  console.log('Cart before save:', {
    _id: cart._id,
    user: cart.user,
    guestId: cart.guestId,
    items: cart.items.length
  });

  try {
    console.log('Saving cart...');
    const saved = await cart.save();
    console.log('Cart saved successfully!');
    console.log('Saved cart:', {
      _id: saved._id,
      user: saved.user,
      items: saved.items.length
    });
    await saved.populate('items.product', 'name price image');
    console.log('Cart populated and returning');
    res.json(saved);
  } catch (err) {
    console.error('Error saving cart:', err.message, err);
    throw err;
  }
});

// DELETE /api/cart - clear cart (by guestId or user)
export const clearCart = asyncHandler(async (req, res) => {
  const guestId = req.guestId;
  const userId = req.user?._id;

  console.log('Clearing cart for guestId:', guestId, 'userId:', userId);

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  const cart = await Cart.findOneAndUpdate(query, { items: [] }, { new: true });
  res.json(cart || { items: [] });
});
