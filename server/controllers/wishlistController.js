import asyncHandler from 'express-async-handler';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.product');
  if (!wishlist) return res.json({ items: [] });
  // return items including snapshot when present
  const items = wishlist.items.map((it) => ({
    product: it.product,
    snapshot: it.snapshot || null,
    addedAt: it.addedAt,
  }));
  res.json({ items });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, snapshot } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error('productId is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, items: [] });
  }

  // Avoid duplicates. If snapshot provided and has variantId, check by variantId
  const exists = snapshot && snapshot.variantId
    ? wishlist.items.find((it) => it.product.toString() === productId.toString() && it.snapshot && String(it.snapshot.variantId) === String(snapshot.variantId))
    : wishlist.items.find((it) => it.product.toString() === productId.toString() && !it.snapshot);

  if (exists) {
    return res.status(200).json({ message: 'Already in wishlist' });
  }

  wishlist.items.push({ product: product._id, snapshot: snapshot || null });
  await wishlist.save();
  await wishlist.populate('items.product');

  res.status(201).json({ items: wishlist.items });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantId } = req.query; // optional: remove specific variant snapshot

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.status(200).json({ items: [] });

  if (variantId) {
    // Remove only the item that matches both productId and snapshot.variantId
    wishlist.items = wishlist.items.filter((it) => {
      if (!it.product) return true;
      const sameProduct = it.product.toString() === productId.toString();
      const hasSnapshot = !!(it.snapshot && it.snapshot.variantId);
      const sameVariant = hasSnapshot && String(it.snapshot.variantId) === String(variantId);
      // keep item if it's not the matching one
      return !(sameProduct && sameVariant);
    });
  } else {
    // Remove all wishlist entries for this productId
    wishlist.items = wishlist.items.filter((it) => it.product.toString() !== productId.toString());
  }

  await wishlist.save();
  await wishlist.populate('items.product');

  const items = wishlist.items.map((it) => ({ product: it.product, snapshot: it.snapshot || null, addedAt: it.addedAt }));
  res.json({ items });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.status(200).json({ items: [] });

  wishlist.items = [];
  await wishlist.save();

  res.json({ items: [] });
});
