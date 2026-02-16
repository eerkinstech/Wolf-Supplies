const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist.js');
const Product = require('../models/Product.js');
const EventLog = require('../models/EventLog.js');

// @desc    Get wishlist by guestId or user
// @route   GET /api/wishlist
// @access  Public
const getWishlist = asyncHandler(async (req, res) => {
  const guestId = req.guestId;
  const userId = req.user?._id;

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  const wishlist = await Wishlist.findOne(query).populate('items.product');

  if (!wishlist) {

    return res.json({ items: [] });
  }

  // return items including snapshot when present
  const items = wishlist.items.map((it) => {
    return {
      product: it.product,
      snapshot: it.snapshot || null,
      addedAt: it.addedAt,
    };
  });

  res.json({ items });
});

// @desc    Add product to wishlist (by guestId or user)
// @route   POST /api/wishlist
// @access  Public
const addToWishlist = asyncHandler(async (req, res) => {

  const guestId = req.guestId;
  const userId = req.user?._id;
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

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  let wishlist = await Wishlist.findOne(query);

  if (!wishlist) {

    const newWishlist = { items: [] };
    if (userId) {
      newWishlist.user = userId;
    } else {
      newWishlist.guestId = guestId;
    }
    wishlist = new Wishlist(newWishlist);
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
// @access  Public
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantId } = req.query;
  const guestId = req.guestId;
  const userId = req.user?._id;

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  // Convert productId to ObjectId if it's a valid MongoDB ID
  let productObjectId = productId;
  if (typeof productId === 'string' && mongoose.Types.ObjectId.isValid(productId)) {
    productObjectId = new mongoose.Types.ObjectId(productId);

  }

  // Use MongoDB $pull operator to remove items directly
  let updateQuery = {};

  if (variantId) {
    // Remove only items matching both product AND variantId
    updateQuery = {
      $pull: {
        items: {
          product: productObjectId,
          'snapshot.variantId': variantId
        }
      }
    };
  } else {
    // Remove all items with this productId
    updateQuery = {
      $pull: {
        items: { product: productObjectId }
      }
    };
  }

  try {

    // Use findOneAndUpdate to remove items and get updated document
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      query,
      updateQuery,
      { new: true }
    ).populate('items.product');

    if (!updatedWishlist) {

      return res.json({ items: [] });
    }

    const items = updatedWishlist.items.map((it) => ({
      product: it.product,
      snapshot: it.snapshot || null,
      addedAt: it.addedAt,
    }));

    res.json({ items });
  } catch (err) {

    throw err;
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Public
const clearWishlist = asyncHandler(async (req, res) => {
  const guestId = req.guestId;
  const userId = req.user?._id;

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  try {

    // Use MongoDB $set operator to directly clear the items array
    const clearedWishlist = await Wishlist.findOneAndUpdate(
      query,
      { $set: { items: [] } },
      { new: true }
    );

    if (!clearedWishlist) {

      return res.status(200).json({ items: [] });
    }

    res.json({ items: [] });
  } catch (err) {

    throw err;
  }
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};

