const mongoose = require('mongoose');
const Product = require('../models/Product.js');
const Category = require('../models/Category.js');
const Settings = require('../models/Settings.js');

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
const getProducts = async (req, res) => {
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

const getProductById = async (req, res) => {
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

const createProduct = async (req, res) => {
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

const updateProduct = async (req, res) => {
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

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await Product.deleteOne({ _id: req.params.id });
  res.json({ message: 'Product removed' });
};

// POST /api/products/:id/reviews - add a review for a product
const createProductReview = async (req, res) => {
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
const updateReviewApprovalStatus = async (req, res) => {
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
const deleteProductReview = async (req, res) => {
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

// POST /api/products/import - Import products from CSV
const importProducts = async (req, res) => {
  try {
    const { products: productsData } = req.body;

    if (!Array.isArray(productsData) || productsData.length === 0) {
      return res.status(400).json({ message: 'No products provided for import' });
    }

    const importedProducts = [];
    const errors = [];

    // Group products by slug to merge variant combinations
    const productsBySlug = {};

    const normalizeKey = (key) => {
      if (!key) return '';
      return key.toLowerCase().replace(/\s+/g, ' ').trim();
    };

    const normalize = (obj) => {
      const result = {};
      if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          result[normalizeKey(key)] = value;
        });
      }
      return result;
    };

    // First pass: normalize and group by slug
    for (let i = 0; i < productsData.length; i++) {
      try {
        const productData = productsData[i];
        const normalized = normalize(productData);

        // Validate required fields
        if (!normalized.name) {
          errors.push(`Row ${i + 1}: Product name is required`);
          continue;
        }

        // Handle price
        let price = null;
        if (normalized.price !== undefined && normalized.price !== null && normalized.price !== '') {
          price = parseFloat(normalized.price);
        } else if (normalized['base price'] !== undefined && normalized['base price'] !== null && normalized['base price'] !== '') {
          price = parseFloat(normalized['base price']);
        }

        if (price === null || isNaN(price)) {
          errors.push(`Row ${i + 1}: Valid product price is required`);
          continue;
        }

        const slug = normalized.slug || normalized.name.toLowerCase().replace(/\s+/g, '-');

        // If this product doesn't exist yet, create base structure
        if (!productsBySlug[slug]) {
          productsBySlug[slug] = {
            name: normalized.name,
            slug: slug,
            description: normalized.description || '',
            price: price,
            originalPrice: normalized['original price'] ? parseFloat(normalized['original price']) : null,
            discount: normalized['discount (%)'] ? parseFloat(normalized['discount (%)']) : 0,
            stock: normalized['base stock'] ? parseInt(normalized['base stock']) : (normalized.stock ? parseInt(normalized.stock) : 0),
            metaTitle: normalized['meta title'] || '',
            metaDescription: normalized['meta description'] || '',
            metaKeywords: normalized['meta keywords'] || '',
            benefitsHeading: normalized['benefits heading'] || 'Why Buy This Product',
            benefits: normalizeBenefitsToHtml(normalized.benefits),
            sku: normalized.sku || '',
            isDraft: normalized.status?.toLowerCase() === 'draft' || normalized.isdraft === true || normalized.isdraft === 'true',
            rating: normalized.rating ? parseFloat(normalized.rating) : 0,
            numReviews: normalized['number of reviews'] ? parseInt(normalized['number of reviews']) : 0,
            variants: [],
            variantCombinations: [],
            variantTypes: new Set(), // Track unique variant types
            categories: Array.isArray(normalized.categories) ? normalized.categories : (normalized.category ? [normalized.category] : []),
            images: [],
          };
        }

        // Parse images
        if (normalized.images) {
          if (Array.isArray(normalized.images)) {
            productsBySlug[slug].images = normalized.images.filter(img => img && typeof img === 'string');
          } else if (typeof normalized.images === 'string' && normalized.images.trim()) {
            const imgs = normalized.images.split('|').map(img => img.trim()).filter(Boolean);
            productsBySlug[slug].images = Array.from(new Set([...productsBySlug[slug].images, ...imgs]));
          }
        }

        // Parse variants and create variant combination
        const variantsJsonStr = normalized['variants json'] || normalized['variants'];
        const variantCombinationsStr = normalized['variantcombinations'];
        const variantTypeStr = normalized['variant type'];
        const variantValuesStr = normalized['variant values'];

        // Debug: log all available fields
        if (i < 3) {
          console.log(`Row ${i + 1}: Available normalized fields:`, Object.keys(normalized));
          console.log(`Row ${i + 1}: Raw variants value:`, normalized['variants']);
          console.log(`Row ${i + 1}: Raw variantcombinations value:`, normalized['variantcombinations']);
          console.log(`Row ${i + 1}: variantsJsonStr="${variantsJsonStr}", variantCombinationsStr="${variantCombinationsStr}"`);
          console.log(`Row ${i + 1}: variantsJsonStr type: ${typeof variantsJsonStr}, length: ${String(variantsJsonStr).length}`);
        }

        if (variantsJsonStr && !variantsJsonStr.includes('[object Object]')) {
          // JSON format - could be a string or already an object
          try {
            let variantData = variantsJsonStr;

            // If it's a string, parse it
            if (typeof variantsJsonStr === 'string') {
              console.log(`Row ${i + 1}: Parsing JSON string for variants`);
              variantData = JSON.parse(variantsJsonStr);
            } else {
              console.log(`Row ${i + 1}: Variants already received as object`);
            }

            console.log(`Row ${i + 1}: Variant data:`, variantData);

            // Handle direct variants array
            if (Array.isArray(variantData)) {
              productsBySlug[slug].variants = variantData;
              variantData.forEach(v => {
                productsBySlug[slug].variantTypes.add(v.name);
              });
            } else if (variantData.variants && Array.isArray(variantData.variants)) {
              productsBySlug[slug].variants = variantData.variants;
              variantData.variants.forEach(v => {
                productsBySlug[slug].variantTypes.add(v.name);
              });
            }

            // Handle variant combinations
            let combos = null;
            if (variantCombinationsStr) {
              if (typeof variantCombinationsStr === 'string' && !variantCombinationsStr.includes('[object Object]')) {
                try {
                  combos = JSON.parse(variantCombinationsStr);
                } catch (e) {
                  console.warn(`Row ${i + 1}: Failed to parse variantcombinations string`, e.message);
                }
              } else if (Array.isArray(variantCombinationsStr)) {
                combos = variantCombinationsStr;
                console.log(`Row ${i + 1}: Variant combinations already received as array: ${combos.length} items`);
              }
            } else if (variantData.variantCombinations && Array.isArray(variantData.variantCombinations)) {
              combos = variantData.variantCombinations;
              console.log(`Row ${i + 1}: Using variantCombinations from variants object: ${combos.length} items`);
            }

            if (combos) {
              console.log(`Row ${i + 1}: Processing ${combos.length} variant combinations`);
              productsBySlug[slug].variantCombinations.push(...combos.map(vc => ({
                variantValues: vc.variantValues || {},
                sku: vc.sku || '',
                price: parseFloat(vc.price) || price,
                stock: parseInt(vc.stock) || 0,
                image: vc.image || '',
              })));
            }
          } catch (e) {
            console.warn(`Row ${i + 1}: Failed to process variants`, e.message);
          }
        } else if (variantTypeStr && variantValuesStr) {
          // Pipe-separated format
          try {
            console.log(`Row ${i + 1}: Parsing variants - Type: "${variantTypeStr}", Values: "${variantValuesStr}"`);

            const variantTypes = variantTypeStr.split('|').map(v => v.trim());
            const variantPairs = variantValuesStr.split('|').map(v => v.trim());

            const variantValues = {};
            variantPairs.forEach(pair => {
              const [key, value] = pair.split(':').map(s => s.trim());
              if (key && value) {
                variantValues[key] = value;
                productsBySlug[slug].variantTypes.add(key);
                console.log(`  Added variant type: ${key} = ${value}`);
              }
            });

            // Add variant combination
            productsBySlug[slug].variantCombinations.push({
              variantValues: variantValues,
              sku: normalized.sku || '',
              price: normalized['variant price'] ? parseFloat(normalized['variant price']) : price,
              stock: normalized['variant stock'] ? parseInt(normalized['variant stock']) : 0,
              image: normalized['variant image'] || '',
            });

            console.log(`  Combination added. Total combinations: ${productsBySlug[slug].variantCombinations.length}`);
          } catch (e) {
            console.warn(`Row ${i + 1}: Failed to parse pipe-separated variants`, e.message);
          }
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Second pass: create or update products with merged variant data
    for (const slug in productsBySlug) {
      try {
        const productData = productsBySlug[slug];

        console.log(`\n=== Processing product: ${slug} ===`);
        console.log(`Variant Types collected: ${Array.from(productData.variantTypes)}`);
        console.log(`Variant Combinations count: ${productData.variantCombinations.length}`);
        console.log(`First combination:`, productData.variantCombinations[0]);

        // Build final variants array with collected values
        if (productData.variantTypes.size > 0) {
          productData.variants = Array.from(productData.variantTypes).map(name => {
            const uniqueValues = new Set();
            productData.variantCombinations.forEach(vc => {
              if (vc.variantValues && vc.variantValues[name]) {
                uniqueValues.add(vc.variantValues[name]);
              }
            });
            return {
              name: name,
              values: Array.from(uniqueValues)
            };
          });
          console.log(`Built variants:`, productData.variants);
        }

        // Handle categories (create if doesn't exist) - can be array or pipe-separated string
        console.log(`Processing categories for ${slug}:`, productData.categories);

        if (productData.categories && Array.isArray(productData.categories) && productData.categories.length > 0) {
          const categoryIds = [];
          for (const catName of productData.categories) {
            if (typeof catName === 'string' && catName.trim()) {
              console.log(`  Looking for category: "${catName}"`);
              let category = await Category.findOne({ name: catName });
              if (!category) {
                console.log(`  Creating new category: "${catName}"`);
                category = await Category.create({
                  name: catName,
                  slug: catName.toLowerCase().replace(/\s+/g, '-'),
                });
              } else {
                console.log(`  Found existing category: ${category._id}`);
              }
              categoryIds.push(category._id);
            }
          }
          if (categoryIds.length > 0) {
            productData.categories = categoryIds;
            console.log(`  Set product categories to: ${categoryIds.join(', ')}`);
          }
        } else if (productData.category && typeof productData.category === 'string' && productData.category.trim()) {
          // Legacy single category field - split by | in case multiple categories
          console.log(`  Processing legacy category string: "${productData.category}"`);
          const categoryNames = productData.category.split('|').map(cat => cat.trim()).filter(Boolean);
          const categoryIds = [];

          for (const catName of categoryNames) {
            console.log(`  Looking for category: "${catName}"`);
            let category = await Category.findOne({ name: catName });
            if (!category) {
              console.log(`  Creating new category: "${catName}"`);
              category = await Category.create({
                name: catName,
                slug: catName.toLowerCase().replace(/\s+/g, '-'),
              });
            } else {
              console.log(`  Found existing category: ${category._id}`);
            }
            categoryIds.push(category._id);
          }

          productData.categories = categoryIds.length > 0 ? categoryIds : [];
          console.log(`  Set product categories to: ${categoryIds.join(', ')}`);
          delete productData.category;
        }

        // Remove temporary tracking fields before saving
        delete productData.variantTypes;

        // Create or update product
        let product;
        const existingProduct = await Product.findOne({ slug: productData.slug });

        if (existingProduct) {
          // Update existing product
          console.log(`Updating existing product: ${slug}`);
          existingProduct.variants = productData.variants;
          existingProduct.variantCombinations = productData.variantCombinations;
          existingProduct.images = productData.images;
          existingProduct.name = productData.name;
          existingProduct.description = productData.description;
          existingProduct.price = productData.price;
          existingProduct.stock = productData.stock;
          existingProduct.metaTitle = productData.metaTitle;
          existingProduct.metaDescription = productData.metaDescription;
          existingProduct.metaKeywords = productData.metaKeywords;
          existingProduct.benefitsHeading = productData.benefitsHeading;
          existingProduct.benefits = productData.benefits;
          existingProduct.rating = productData.rating;
          existingProduct.numReviews = productData.numReviews;
          existingProduct.isDraft = productData.isDraft;
          if (productData.categories) {
            existingProduct.categories = productData.categories;
          }

          product = await existingProduct.save();
        } else {
          // Create new product
          console.log(`Creating new product: ${slug}`);
          product = new Product(productData);
          product = await product.save();
        }

        console.log(`Product saved with variants:`, product.variants.length, `combinations:`, product.variantCombinations.length);
        importedProducts.push(product);
      } catch (error) {
        console.error(`Error processing product ${slug}:`, error);
        errors.push(`Product ${slug}: ${error.message}`);
      }
    }

    // Send final response
    res.json({
      message: `Successfully imported ${importedProducts.length} product(s)`,
      imported: importedProducts.length,
      errors: errors.length > 0 ? errors : undefined,
      products: importedProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateReviewApprovalStatus,
  deleteProductReview,
  importProducts,
};
