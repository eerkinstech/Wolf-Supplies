import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import EventLog from '../models/EventLog.js';

// @desc    Get wishlist by guestId or user
// @route   GET /api/wishlist
// @access  Public
export const getWishlist = asyncHandler(async (req, res) => {
  const guestId = req.guestId;
  const userId = req.user?._id;

  console.log('=== getWishlist ===');
  console.log('guestId:', guestId);
  console.log('userId:', userId);

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  const wishlist = await Wishlist.findOne(query).populate('items.product');
  console.log('Wishlist found:', !!wishlist);

  if (!wishlist) {
    console.log('No wishlist exists, returning empty items');
    return res.json({ items: [] });
  }

  console.log('Wishlist items count:', wishlist.items.length);

  // return items including snapshot when present
  const items = wishlist.items.map((it) => {
    console.log('Item:', {
      product: it.product?._id || it.product,
      hasSnapshot: !!it.snapshot,
      variantId: it.snapshot?.variantId
    });
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
export const addToWishlist = asyncHandler(async (req, res) => {
  console.log('==== addToWishlist called ====');
  console.log('req.body:', req.body);
  console.log('req.user:', req.user);

  const guestId = req.guestId;
  const userId = req.user?._id;
  const { productId, snapshot } = req.body;

  console.log('productId:', productId);
  console.log('guestId:', guestId, 'userId:', userId);

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
  console.log('Found existing wishlist:', !!wishlist);

  if (!wishlist) {
    console.log('Creating new wishlist');
    const newWishlist = { items: [] };
    if (userId) {
      newWishlist.user = userId;
    } else {
      newWishlist.guestId = guestId;
    }
    wishlist = new Wishlist(newWishlist);
    console.log('Created new wishlist:', {
      _id: wishlist._id,
      user: wishlist.user,
      guestId: wishlist.guestId
    });
  }

  // Avoid duplicates. If snapshot provided and has variantId, check by variantId
  const exists = snapshot && snapshot.variantId
    ? wishlist.items.find((it) => it.product.toString() === productId.toString() && it.snapshot && String(it.snapshot.variantId) === String(snapshot.variantId))
    : wishlist.items.find((it) => it.product.toString() === productId.toString() && !it.snapshot);

  if (exists) {
    return res.status(200).json({ message: 'Already in wishlist' });
  }

  wishlist.items.push({ product: product._id, snapshot: snapshot || null });
  console.log('Wishlist before save:', {
    _id: wishlist._id,
    user: wishlist.user,
    guestId: wishlist.guestId,
    items: wishlist.items.length
  });

  await wishlist.save();
  console.log('Wishlist saved successfully!');
  console.log('Saved wishlist:', {
    _id: wishlist._id,
    user: wishlist.user,
    guestId: wishlist.guestId,
    items: wishlist.items.length
  });

  await wishlist.populate('items.product');

  res.status(201).json({ items: wishlist.items });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Public
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantId } = req.query;
  const guestId = req.guestId;
  const userId = req.user?._id;

  console.log('=== removeFromWishlist ===');
  console.log('productId from URL:', productId);
  console.log('variantId from query:', variantId);
  console.log('guestId:', guestId);
  console.log('userId:', userId);

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
    console.log('Converted productId to ObjectId:', productObjectId.toString());
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

  console.log('Update query:', JSON.stringify(updateQuery));

  try {
    console.log('Executing MongoDB update...');

    // Use findOneAndUpdate to remove items and get updated document
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      query,
      updateQuery,
      { new: true }
    ).populate('items.product');

    if (!updatedWishlist) {
      console.log('Wishlist not found, creating empty response');
      return res.json({ items: [] });
    }

    console.log('✅ Wishlist updated successfully');
    console.log('Items count after update:', updatedWishlist.items.length);

    const items = updatedWishlist.items.map((it) => ({
      product: it.product,
      snapshot: it.snapshot || null,
      addedAt: it.addedAt,
    }));

    console.log('✅ Returning to client:', { itemsCount: items.length });
    res.json({ items });
  } catch (err) {
    console.error('❌ ERROR REMOVING FROM WISHLIST:', err);
    console.error('Error message:', err.message);
    throw err;
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Public
export const clearWishlist = asyncHandler(async (req, res) => {
  const guestId = req.guestId;
  const userId = req.user?._id;

  console.log('=== clearWishlist ===');
  console.log('guestId:', guestId);
  console.log('userId:', userId);

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  try {
    console.log('Clearing wishlist using MongoDB update...');

    // Use MongoDB $set operator to directly clear the items array
    const clearedWishlist = await Wishlist.findOneAndUpdate(
      query,
      { $set: { items: [] } },
      { new: true }
    );

    if (!clearedWishlist) {
      console.log('No wishlist found to clear');
      return res.status(200).json({ items: [] });
    }

    console.log('✅ Wishlist cleared successfully in database');
    console.log('Items after clear:', clearedWishlist.items.length);

    res.json({ items: [] });
  } catch (err) {
    console.error('❌ ERROR CLEARING WISHLIST:', err);
    console.error('Error message:', err.message);
    throw err;
  }
});
