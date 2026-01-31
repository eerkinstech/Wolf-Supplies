import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';

// Normalize benefits to an HTML string. Accepts:
// - HTML string (leave as-is)
// - Array of strings (convert to <ul><li>...</li></ul>)
// - JSON-stringified array (parse and convert)
const normalizeBenefitsToHtml = (val) => {
  if (val === undefined || val === null) return '';
  if (Array.isArray(val)) {
    if (val.length === 0) return '';
    return `<ul>${val.map((s) => `<li>${s}</li>`).join('')}</ul>`;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.length === 0 ? '' : `<ul>${parsed.map((s) => `<li>${s}</li>`).join('')}</ul>`;
        }
      } catch (e) {
        // fall through
      }
    }
    return val;
  }
  return '';
};
// GET /api/products?search=&category=&page=&limit=
export const getProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const keyword = req.query.search
    ? { name: { $regex: req.query.search, $options: 'i' } }
    : {};
  const count = await Product.countDocuments({ ...keyword });
  // Populate categories array so frontend receives category details
  const products = await Product.find({ ...keyword })
    .populate('categories')
    .limit(limit)
    .skip(limit * (page - 1))
    .sort({ createdAt: -1 });
  res.json({ products, page, pages: Math.ceil(count / limit) });
};

export const getProductById = async (req, res) => {
  try {
    // Support fetching by Mongo _id or by slug (route may pass either `id` or `slug` param)
    const identifier = req.params.id || req.params.slug;
    let product = null;
    if (!identifier) return res.status(400).json({ message: 'Missing product identifier' });

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      product = await Product.findById(identifier).populate('categories');
    } else {
      // Try a decoded, case-insensitive slug lookup to be more forgiving
      const decodeSlug = (s) => {
        try { return decodeURIComponent(String(s).trim()).toLowerCase(); } catch (e) { return String(s).trim().toLowerCase(); }
      };
      const slugVal = decodeSlug(identifier);
      // escape regex special chars
      const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      product = await Product.findOne({ slug: { $regex: `^${escapeRegExp(slugVal)}$`, $options: 'i' } }).populate('categories');
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Manually populate reviews with user data
    if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
      const User = mongoose.model('User');
      const populatedReviews = [];
      
      for (const review of product.reviews) {
        let reviewObj = review.toObject ? review.toObject() : { ...review };
        
        // Populate user data if user ID exists
        if (reviewObj.user) {
          try {
            const userData = await User.findById(reviewObj.user).lean();
            if (userData) {
              reviewObj.user = {
                _id: userData._id,
                name: userData.name,
                email: userData.email
              };
            }
          } catch (err) {
            // If user fetch fails, keep the user ID
          }
        }
        
        populatedReviews.push(reviewObj);
      }
      
      product.reviews = populatedReviews;
    } else if (!product.reviews) {
      product.reviews = [];
    }
    
    res.json(product);
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    // Accept both JSON body arrays or JSON-stringified values from forms
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      discount,
      categories,
      category,
      images,
      stock,
      variants,
      variantCombinations,
      benefits,
      benefitsHeading,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    // Helper to safely parse arrays that might be sent as JSON strings
    const parseMaybeArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    };

    const safeVariants = parseMaybeArray(variants);
    const safeVariantCombinations = parseMaybeArray(variantCombinations);

    // Resolve categories: support both new categories array and legacy single category
    let categoryIds = [];

    // Prefer categories array (new format)
    if (categories && Array.isArray(categories) && categories.length > 0) {
      for (const cat of categories) {
        if (mongoose.Types.ObjectId.isValid(cat)) {
          categoryIds.push(cat);
        } else {
          const found = await Category.findOne({ name: cat });
          if (found) categoryIds.push(found._id);
        }
      }
    } else if (category) {
      // Fallback to single category (legacy format)
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryIds = [category];
      } else {
        const found = await Category.findOne({ name: category });
        if (found) categoryIds = [found._id];
      }
    }

    // Ensure slug exists; generate from name when missing
    const makeSlug = (s) =>
      String(s || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

    let finalSlug = req.body.slug || (name ? makeSlug(name) : undefined);
    if (!finalSlug && name) finalSlug = makeSlug(name);

    // Guarantee slug uniqueness (append timestamp when conflict)
    if (finalSlug) {
      const exists = await Product.findOne({ slug: finalSlug });
      if (exists) finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const product = new Product({
      name,
      slug: finalSlug,
      description,
      price: price || 0,
      originalPrice,
      discount: discount || 0,
      categories: categoryIds.length > 0 ? categoryIds : [],
      images: images || [],
      benefitsHeading: benefitsHeading || 'Why Buy This Product',
      benefits: normalizeBenefitsToHtml(benefits),
      isDraft: req.body.isDraft === true || req.body.isDraft === 'true' ? true : false,
      stock: stock !== undefined ? Number(stock) : 0,
      variants: safeVariants,
      variantCombinations: safeVariantCombinations,
      metaTitle: metaTitle || name || '',
      metaDescription: metaDescription || '',
      metaKeywords: metaKeywords || '',
      createdBy: req.user ? req.user._id : null,
    });

    const created = await product.save();
    res.status(201).json(created);
  } catch (error) {

    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Update basic scalar fields if provided
    const updatable = ['name', 'slug', 'description', 'price', 'originalPrice', 'discount', 'categories', 'images', 'inStock', 'isDraft', 'metaTitle', 'metaDescription', 'metaKeywords'];
    updatable.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    // Stock (basic product) may be provided as 'stock'
    if (req.body.stock !== undefined) {
      product.stock = Number(req.body.stock);
    }

    // Categories may be sent as array of names/IDs or legacy single category
    if (req.body.categories !== undefined) {
      const catsVal = req.body.categories;
      if (!catsVal || (Array.isArray(catsVal) && catsVal.length === 0)) {
        product.categories = [];
      } else if (Array.isArray(catsVal)) {
        const resolvedIds = [];
        for (const cat of catsVal) {
          if (mongoose.Types.ObjectId.isValid(cat)) {
            resolvedIds.push(cat);
          } else {
            const found = await Category.findOne({ name: cat });
            if (found) resolvedIds.push(found._id);
          }
        }
        product.categories = resolvedIds;
      }
    } else if (req.body.category !== undefined) {
      // Fallback: legacy single category support
      const catVal = req.body.category;
      if (catVal === null || catVal === '') {
        product.categories = [];
      } else if (mongoose.Types.ObjectId.isValid(catVal)) {
        product.categories = [catVal];
      } else {
        const found = await Category.findOne({ name: catVal });
        product.categories = found ? [found._id] : product.categories;
      }
    }

    // Variants / variant combinations are optional and may be JSON strings
    if (req.body.variants !== undefined) {
      try {
        product.variants = Array.isArray(req.body.variants) ? req.body.variants : JSON.parse(req.body.variants);
      } catch (e) {
        product.variants = [];
      }
    }

    if (req.body.variantCombinations !== undefined) {
      try {
        product.variantCombinations = Array.isArray(req.body.variantCombinations) ? req.body.variantCombinations : JSON.parse(req.body.variantCombinations);
      } catch (e) {
        product.variantCombinations = [];
      }
    }

    // Benefits: allow updating an array or a JSON-stringified array
    if (req.body.benefits !== undefined) {
      // Always normalize incoming benefits to an HTML string so it matches the
      // Product model (which stores benefits as a String containing HTML).
      try {
        product.benefits = normalizeBenefitsToHtml(req.body.benefits);
      } catch (e) {
        product.benefits = '';
      }
    }

    // Benefits Heading
    if (req.body.benefitsHeading !== undefined) {
      product.benefitsHeading = req.body.benefitsHeading || 'Why Buy This Product';
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {

    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await Product.deleteOne({ _id: req.params.id });
  res.json({ message: 'Product removed' });
};

// POST /api/products/:id/reviews - add a review for a product
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // require authenticated user
    if (!req.user) return res.status(401).json({ message: 'Authentication required to leave a review' });

    // Prevent duplicate reviews by same user
    const alreadyReviewed = product.reviews.find(r => r.user && r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: 'You have already reviewed this product' });

    // Check if review approval is required
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    const requireApproval = settings.requireReviewApproval !== false;

    const review = {
      name: req.user.name || req.body.name || 'Anonymous',
      rating: Number(rating) || 0,
      comment: comment || '',
      user: req.user._id,
      email: req.user.email || req.body.email || '',
      isApproved: !requireApproval, // Auto-approve if approval not required
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/products/:id/reviews/:index - approve/disapprove a review
export const updateReviewApprovalStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const reviewIndex = parseInt(req.params.index);
    if (isNaN(reviewIndex) || reviewIndex < 0 || reviewIndex >= product.reviews.length) {
      return res.status(400).json({ message: 'Invalid review index' });
    }

    product.reviews[reviewIndex].isApproved = Boolean(isApproved);
    
    // Recalculate rating based on all reviews (both approved and unapproved)
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0;
    
    await product.save();

    res.json({ message: 'Review approval status updated' });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/:id/reviews/:index - delete a review
export const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const reviewIndex = parseInt(req.params.index);
    if (isNaN(reviewIndex) || reviewIndex < 0 || reviewIndex >= product.reviews.length) {
      return res.status(400).json({ message: 'Invalid review index' });
    }

    product.reviews.splice(reviewIndex, 1);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length > 0 
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
      : 0;

    await product.save();
    res.json({ message: 'Review deleted' });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

