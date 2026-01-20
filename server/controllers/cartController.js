import Cart from '../models/Cart.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// GET /api/cart - get current user's cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price image');
  res.json(cart || { user: req.user.id, items: [] });
});

// POST /api/cart - update/create cart for user
export const updateCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400);
    throw new Error('Cart items must be an array');
  }

  // Load or create cart for user
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Helper to normalize selectedVariants for comparison
  const normalizeVars = (vars) => {
    if (!vars || typeof vars !== 'object') return '';
    const keys = Object.keys(vars).sort();
    return keys.map(k => `${k}:${String(vars[k])}`).join('|');
  };

  // Merge incoming items into existing cart by product + selectedVariants
  // Replace cart items entirely with incoming items (client is source of truth for full cart)
  const serverItems = [];
  for (const incoming of items) {
    let productId = incoming.product;
    if (productId && typeof productId === 'string' && mongoose.Types.ObjectId.isValid(productId)) {
      productId = new mongoose.Types.ObjectId(productId);
    } else {
      productId = productId || undefined;
    }

    serverItems.push({
      product: productId || incoming.product,
      name: incoming.name,
      quantity: incoming.quantity || 1,
      price: incoming.price,
      selectedVariants: incoming.selectedVariants || {},
      image: incoming.image || '',
    });
  }

  cart.items = serverItems;

  const saved = await cart.save();
  await saved.populate('items.product', 'name price image');
  res.json(saved);
});

// DELETE /api/cart - clear cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] }, { new: true });
  res.json(cart || { user: req.user.id, items: [] });
});
