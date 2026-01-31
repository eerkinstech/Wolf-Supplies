import Cart from '../models/Cart.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import EventLog from '../models/EventLog.js';

// GET /api/cart - get cart by guestId (or user if authenticated)
export const getCart = asyncHandler(async (req, res) => {

  try {
    const guestId = req.guestId;
    const userId = req.user?._id;

    // Try to find cart by user ID first (if authenticated), then by guestId
    let cart = null;
    if (userId) {

      cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price image');
    } else if (guestId) {

      cart = await Cart.findOne({ guestId }).populate('items.product', 'name price image');

    }

    if (cart) {

    }
    res.json(cart || { items: [] });
  } catch (err) {

    throw err;
  }
});

// POST /api/cart - update/create cart for guestId or user
export const updateCart = asyncHandler(async (req, res) => {

  const guestId = req.guestId;
  const userId = req.user?._id;
  const { items } = req.body;

  if (!Array.isArray(items)) {

    res.status(400);
    throw new Error('Cart items must be an array');
  }

  if (items.length === 0) {

  }

  // Load or create cart
  let cart = null;
  if (userId) {
    cart = await Cart.findOne({ user: userId });
    if (!cart) {

      cart = new Cart({ user: userId, items: [] });
    }
  } else if (guestId) {
    cart = await Cart.findOne({ guestId });
    if (!cart) {

      cart = new Cart({ guestId, items: [] });
    }
  } else {

    res.status(400);
    throw new Error('No user identification available');
  }

  // Replace cart items entirely with incoming items (client is source of truth for full cart)
  const serverItems = [];
  for (const incoming of items) {
    if (!incoming) {

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

  cart.items = serverItems;try {

    const saved = await cart.save();await saved.populate('items.product', 'name price image');

    res.json(saved);
  } catch (err) {

    throw err;
  }
});

// DELETE /api/cart - clear cart (by guestId or user)
export const clearCart = asyncHandler(async (req, res) => {
  const guestId = req.guestId;
  const userId = req.user?._id;

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  const cart = await Cart.findOneAndUpdate(query, { items: [] }, { new: true });
  res.json(cart || { items: [] });
});

