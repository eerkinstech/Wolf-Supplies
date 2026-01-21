import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, fetchProductBySlug } from '../redux/slices/productSlice';
import { addToCart, syncCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, addItemToServer, removeItemFromServer } from '../redux/slices/wishlistSlice';
import { FaStar, FaRegStar, FaStarHalfAlt, FaSpinner,FaSearchPlus, FaArrowLeft, FaArrowRight, FaShoppingCart,  FaCheck, FaHeart, FaShareAlt, FaTruck, FaUndoAlt, FaArrowAltCircleLeft, FaSync, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { GiShield } from 'react-icons/gi';
import toast from 'react-hot-toast';
import RelatedProducts from '../components/Products/RelatedProducts/RelatedProducts';
import Reviews from '../components/Products/Reviews/Reviews';
import { useAuth } from '../context/AuthContext';
import './ProductDetailPage.css';
import { Link } from 'react-router-dom';


const ProductDetailPage = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((state) => state.product);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  // Track the last variant/product the user saved locally (for optimistic UI)
  const [savedVariantId, setSavedVariantId] = useState(null);
  const [savedProductFlag, setSavedProductFlag] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});

  // Gallery & review state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const THUMB_VISIBLE = 7;
  const thumbContainerRef = useRef(null);
  const [showThumbLeftShadow, setShowThumbLeftShadow] = useState(false);
  const [showThumbRightShadow, setShowThumbRightShadow] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [zoomMousePos, setZoomMousePos] = useState({ x: 0, y: 0 });
  const zoomImageRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [requireReviewApproval, setRequireReviewApproval] = useState(true);
  const { token, user } = useAuth();
  const cartItems = useSelector((state) => state.cart.items);

  const API = import.meta.env.VITE_API_URL || '';

  // Helper to get absolute image URL
  const getImgSrc = (img) => {
    if (!img) return '';
    if (typeof img !== 'string') return '';
    return img.startsWith('http') ? img : `${API}${img}`;
  };

  // Fetch review approval settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API}/api/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setRequireReviewApproval(data.requireReviewApproval !== false);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, [API]);

  useEffect(() => {
    // Reset quantity and selections when slug/id changes
    setQuantity(1);
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedVariants({});
    setCurrentImageIndex(0);
    
    const ident = slug || id;
    if (ident) {
      if (slug) dispatch(fetchProductBySlug(slug));
      else dispatch(fetchProductById(id));
    }
  }, [id, slug, dispatch]);

  // Monitor product changes and restore scroll position when product updates
  useEffect(() => {
    // Only restore if we have a saved scroll position (meaning a review was just submitted)
    if (scrollPositionRef.current > 0 && !loading) {
      // Use requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
        scrollPositionRef.current = 0;
      });
    }
  }, [product, loading]); // Only depend on product and loading

  useEffect(() => {
    if (!product) return;
    // compute the currently matched variant id based on current selections
    let currentVariantId = null;
    if (product.variantCombinations && product.variantCombinations.length > 0) {
      const merged = { ...(selectedVariants || {}) };
      if (selectedSize) merged['Size'] = selectedSize;
      if (selectedColor) merged['Color'] = selectedColor;

      for (const vc of product.variantCombinations) {
        const raw = vc.variantValues || {};
        const normalized = raw instanceof Map ? Object.fromEntries(raw) : raw;
        const keys = Object.keys(normalized);
        let matches = true;
        for (const k of keys) {
          const want = normalized[k];
          const got = merged[k];
          if (want === undefined) continue;
          if (got === undefined || String(got) !== String(want)) { matches = false; break; }
        }
        if (matches) {
          currentVariantId = vc._id || vc.id || null;
          break;
        }
      }
    }

    // Build a plain object of current selection to compare against snapshot fields
    const currentSelection = {
      variantId: currentVariantId || null,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      selectedVariants: selectedVariants || {},
    };

    // Helper: does snapshot match current selection?
    const snapshotMatchesCurrent = (snap) => {
      if (!snap) return false;
      // Prefer exact variantId match if available
      if (snap.variantId && currentSelection.variantId) {
        if (String(snap.variantId) === String(currentSelection.variantId)) return true;
      }
      // Otherwise compare selected options (sizes/colors/variant map)
      const sSize = snap.selectedSize || null;
      const sColor = snap.selectedColor || null;
      const sVariants = snap.selectedVariants || {};
      if (sSize && currentSelection.selectedSize && String(sSize) === String(currentSelection.selectedSize) &&
        sColor && currentSelection.selectedColor && String(sColor) === String(currentSelection.selectedColor)) {
        return true;
      }
      // compare variant maps shallowly
      const aKeys = Object.keys(sVariants || {}).sort();
      const bKeys = Object.keys(currentSelection.selectedVariants || {}).sort();
      if (aKeys.length && aKeys.length === bKeys.length) {
        for (let i = 0; i < aKeys.length; i++) {
          const k = aKeys[i];
          if (String(sVariants[k]) !== String(currentSelection.selectedVariants[k])) return false;
        }
        return true;
      }
      return false;
    };

    // Check server/local wishlist for product-level save (snapshotless) or snapshot matching current selection
    let matched = false;
    for (const item of wishlistItems) {
      const prodId = item.productId || (item.product && (item.product._id || item.product)) || item._id || item.product;
      if (String(prodId) !== String(product._id)) continue;

      const isSnapshot = item.__isSnapshot || item.snapshot !== undefined || !!item.variantId;
      if (!isSnapshot) {
        // product-level save should only count as 'Saved' when the product has no variants
        if (!product.variantCombinations || product.variantCombinations.length === 0) {
          matched = true;
          break;
        }
        // otherwise ignore snapshotless product-level saves for varianted products
      }

      // item is a snapshot: check snapshot contents
      const snap = item.snapshot ? item.snapshot : item;
      const snapVariantId = item.variantId || snap.variantId || null;
      const snapObj = { ...snap, variantId: snapVariantId };
      if (snapshotMatchesCurrent(snapObj)) { matched = true; break; }
    }

    // optimistic checks: if user just saved this exact variant/product
    if (!matched) {
      if (currentSelection.variantId) {
        if (savedVariantId && String(savedVariantId) === String(currentSelection.variantId)) matched = true;
      } else if (savedProductFlag) matched = true;
    }

    setIsInWishlist(!!matched);

    // Clear optimistic saved markers if the current selection no longer matches them
    // For products with variants, ignore product-level saved flag
    if (product.variantCombinations && product.variantCombinations.length > 0) {
      if (savedProductFlag) setSavedProductFlag(false);
    }
    if (savedVariantId && currentSelection.variantId && String(savedVariantId) !== String(currentSelection.variantId)) {
      setSavedVariantId(null);
    }
  }, [product, wishlistItems, selectedVariants, selectedSize, selectedColor]);

  // Auto-select first variant option when product loads
  useEffect(() => {
    if (product && product.variantCombinations && product.variantCombinations.length > 0 && Object.keys(selectedVariants).length === 0) {
      // Extract variant options
      const options = {};
      for (const vc of product.variantCombinations) {
        const variantValues = vc.variantValues || {};
        for (const [key, value] of Object.entries(variantValues)) {
          if (!options[key]) {
            options[key] = new Set();
          }
          options[key].add(String(value));
        }
      }

      // Auto-select first value for each variant
      const autoSelected = {};
      for (const [key, set] of Object.entries(options)) {
        const sortedValues = Array.from(set).sort();
        autoSelected[key] = sortedValues[0];
      }

      if (Object.keys(autoSelected).length > 0) {
        setSelectedVariants(autoSelected);
      }
    }
  }, [product]);

  // Reset main image whenever selected options or gallery length change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedVariants, selectedSize, selectedColor, product?.images?.length]);

  // Helper: Get display images based on variant selection
  const getDisplayImages = () => {
    // Find matching combination using same logic as findMatchingCombination
    if (!product) return [];
    const merged = { ...(selectedVariants || {}) };
    if (selectedSize) merged['Size'] = selectedSize;
    if (selectedColor) merged['Color'] = selectedColor;

    let matched = null;
    for (const vc of product.variantCombinations || []) {
      const raw = vc.variantValues || {};
      const normalized = raw instanceof Map ? Object.fromEntries(raw) : raw;
      const keys = Object.keys(normalized);
      let matches = true;
      for (const k of keys) {
        const want = normalized[k];
        const got = merged[k];
        if (want === undefined) continue;
        if (got === undefined || String(got) !== String(want)) { matches = false; break; }
      }
      if (matches) { matched = vc; break; }
    }

    // Normalize image entries (handle strings or objects with url/secure_url/public_url/path/src)
    const normalizeImg = (img) => {
      if (!img) return '';
      if (typeof img === 'string') return img;
      if (typeof img === 'object') return img.url || img.secure_url || img.public_url || img.path || img.src || '';
      return '';
    };

    const productImagesRaw = product?.images || [];
    const normalizedProductImages = productImagesRaw.map(normalizeImg).filter(Boolean);

    // If matched variant has custom image, include it first then product images (normalized)
    if (matched && matched.image) {
      const variantImg = normalizeImg(matched.image);
      if (!variantImg) return normalizedProductImages;
      // remove any duplicate of variantImg from product images
      const otherImages = normalizedProductImages.filter(img => img !== variantImg);
      return [variantImg, ...otherImages];
    }

    // No matched variant image — return normalized product images (fallback)
    return normalizedProductImages;
  };



  // Helper to render star icons for fractional ratings
  const renderStars = (rating = 0, sizeClass = 'text-lg') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} className={`${sizeClass} text-yellow-400`} />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className={`${sizeClass} text-yellow-400`} />);
      } else {
        stars.push(<FaRegStar key={i} className={`${sizeClass} text-yellow-400`} />);
      }
    }
    return stars;
  };

  const displayImages = getDisplayImages();
  const currentDisplayImage = displayImages[currentImageIndex] || (product?.image || '🛍️');

  // Keep thumbnail window in sync with current image
  useEffect(() => {
    if (!displayImages || displayImages.length === 0) {
      setThumbStart(0);
      return;
    }
    // keep thumbStart in bounds (used for legacy fallbacks)
    setThumbStart((s) => Math.max(0, Math.min(Math.max(0, displayImages.length - THUMB_VISIBLE), s)));
  }, [currentImageIndex, displayImages]);

  // center active thumbnail in scrollable container when index changes
  useEffect(() => {
    const el = thumbContainerRef.current;
    if (!el) return;
    const child = el.querySelectorAll('button')[currentImageIndex];
    if (child && child.scrollIntoView) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    // update shadows after scrolling
    const updateShadows = () => {
      if (!el) return;
      setShowThumbLeftShadow(el.scrollLeft > 8);
      setShowThumbRightShadow(el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
    };
    // small timeout to allow scrollIntoView to change scrollLeft
    const t = setTimeout(updateShadows, 120);
    updateShadows();
    return () => clearTimeout(t);
  }, [currentImageIndex, displayImages]);

  // attach scroll handler to update overlays
  useEffect(() => {
    const el = thumbContainerRef.current;
    if (!el) return;
    const handler = () => {
      setShowThumbLeftShadow(el.scrollLeft > 8);
      setShowThumbRightShadow(el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
    };
    el.addEventListener('scroll', handler);
    // initial
    handler();
    return () => el.removeEventListener('scroll', handler);
  }, [displayImages]);

  const handleAddToCart = async () => {
    if (product) {
      // Prevent adding when item (or selected variant) is unavailable
      if (!isAvailable) {
        toast.error('This item is out of stock');
        return;
      }
      // Check if variations are required
      if (product.specifications?.sizes && !selectedSize) {
        toast.error('Please select a size');
        return;
      }
      if (product.specifications?.colors && !selectedColor) {
        toast.error('Please select a color');
        return;
      }

      // Check for other variants
      if (product.variants && Object.keys(product.variants).length > 0) {
        for (const [variantKey, variantData] of Object.entries(product.variants)) {
          if (variantData.required && !selectedVariants[variantKey]) {
            toast.error(`Please select ${variantKey}`);
            return;
          }
        }
      }

      // Normalize image to a simple string (prefer variant image)
      const rawImage = displayImages && displayImages.length > 0 ? displayImages[0] : (product.image || (product.images && product.images[0]) || '');
      let normalizedImage = '';
      if (typeof rawImage === 'string') normalizedImage = rawImage;
      else if (rawImage && typeof rawImage === 'object') normalizedImage = rawImage.url || rawImage.src || rawImage.path || '';

      // Create a deterministic cart key so different variant selections create distinct items
      const makeCartKey = (prodId, size, color, variants) => {
        const parts = [prodId || ''];
        parts.push(`size:${size || ''}`);
        parts.push(`color:${color || ''}`);
        if (variants && typeof variants === 'object') {
          const keys = Object.keys(variants).sort();
          const varParts = keys.map(k => `${k}:${variants[k]}`);
          parts.push(`vars:${varParts.join(',')}`);
        } else {
          parts.push('vars:');
        }
        return parts.join('|');
      };

      const cartKey = makeCartKey(product._id, selectedSize, selectedColor, selectedVariants);

      const cartItem = {
        // _id used client-side as unique identifier for this cart row (includes variant info)
        _id: cartKey,
        product: product._id,
        name: product.name,
        image: normalizedImage,
        price: Number(matchingCombination?.price ?? product.price ?? 0),
        category: product.category,
        discount: product.discount,
        quantity,
        selectedSize,
        selectedColor,
        selectedVariants,
      };
      dispatch(addToCart(cartItem));
      // Persist cart to backend when authenticated via thunk — await result so we know it saved
      if (token) {
        // Treat items as identical only when product id AND variant selections match
        const isSameCartItem = (a, b) => {
          if (!a || !b) return false;
          if ((a.product || '') !== (b.product || '')) return false;
          if ((a.selectedSize || '') !== (b.selectedSize || '')) return false;
          if ((a.selectedColor || '') !== (b.selectedColor || '')) return false;
          const va = a.selectedVariants || {};
          const vb = b.selectedVariants || {};
          const ka = Object.keys(va).sort();
          const kb = Object.keys(vb).sort();
          if (ka.length !== kb.length) return false;
          for (let i = 0; i < ka.length; i++) {
            const k = ka[i];
            if (k !== kb[i]) return false;
            if (String(va[k]) !== String(vb[k])) return false;
          }
          return true;
        };

        const existing = cartItems.find((i) => isSameCartItem(i, cartItem));
        let newItems = [];
        if (existing) {
          newItems = cartItems.map((i) => isSameCartItem(i, cartItem) ? { ...i, quantity: (i.quantity || 0) + (cartItem.quantity || 1) } : i);
        } else {
          newItems = [...cartItems, cartItem];
        }
        try {
          const resultAction = await dispatch(syncCart(newItems));
          // resultAction.payload contains normalized returned items when fulfilled
        } catch (err) {
          console.error('ProductDetail: syncCart failed', err);
          toast.error('Failed to save cart to server');
        }
      }

      const variantText = Object.entries(selectedVariants)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');

      toast.success(`${quantity} item(s) added to cart! ${variantText}`);
    }
  };

  const handleWishlist = () => {
    if (product) {
      const token = localStorage.getItem('token');
      // Build a variant snapshot object so variant-specific wishlist entries are stored
      const currentVariant = matchingCombination || null;
      const variantId = currentVariant?._id || currentVariant?.id || null;

      const rawImage = displayImages && displayImages.length > 0 ? displayImages[0] : (product.image || (product.images && product.images[0]) || '');
      let normalizedImage = '';
      if (typeof rawImage === 'string') normalizedImage = rawImage;
      else if (rawImage && typeof rawImage === 'object') normalizedImage = rawImage.url || rawImage.src || rawImage.path || '';

      const snapshot = {
        productId: product._id,
        name: product.name,
        price: Number(matchingCombination?.price ?? product.price ?? 0),
        image: normalizedImage,
        selectedVariants: selectedVariants || {},
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
        variantId: variantId || null,
      };

      if (token) {
        if (isInWishlist) {
          // optimistic UI: mark removed immediately
          setIsInWishlist(false);
          // clear saved marker
          setSavedVariantId(null);
          setSavedProductFlag(false);
          // remove specific variant if available, otherwise remove all product entries
          dispatch(removeItemFromServer({ productId: product._id, variantId }));
        } else {
          // optimistic UI: mark saved immediately
          setIsInWishlist(true);
          // remember which variant/product was saved so the button remains 'Saved' until selection changes
          if (variantId) {
            setSavedVariantId(variantId);
            setSavedProductFlag(false);
          } else {
            setSavedVariantId(null);
            setSavedProductFlag(true);
          }
          dispatch(addItemToServer({ productId: product._id, snapshot }));
        }
      } else {
        if (isInWishlist) {
          setIsInWishlist(false);
          setSavedVariantId(null);
          setSavedProductFlag(false);
          dispatch(removeFromWishlist({ productId: product._id, variantId }));
        } else {
          setIsInWishlist(true);
          if (variantId) {
            setSavedVariantId(variantId);
            setSavedProductFlag(false);
          } else {
            setSavedVariantId(null);
            setSavedProductFlag(true);
          }
          dispatch(addToWishlist({ productId: product._id, snapshot }));
        }
      }
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
    }
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing product: ${product.name}`,
        url: window.location.href,
      });
    } else {
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <FaSpinner className="text-6xl text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-3xl text-gray-600 mb-6">Product not found</p>
        <button onClick={() => navigate('/products')} className="bg-gradient-to-r from-gray-700 to-black text-white px-8 py-3 rounded-lg font-bold hover:from-gray-900 hover:to-grey-700 transition duration-300 transform hover:scale-105">
          Browse Products
        </button>
      </div>
    );
  }

  // Helper to find matching variant combination given selected options
  const findMatchingCombination = () => {
    if (!product || !product.variantCombinations || product.variantCombinations.length === 0) return null;

    const merged = { ...(selectedVariants || {}) };
    if (selectedSize) merged['Size'] = selectedSize;
    if (selectedColor) merged['Color'] = selectedColor;

    for (const vc of product.variantCombinations) {
      // variantValues may be a Map or plain object
      const raw = vc.variantValues || {};
      const normalized = raw instanceof Map ? Object.fromEntries(raw) : raw;
      const keys = Object.keys(normalized);
      let matches = true;
      for (const k of keys) {
        const want = normalized[k];
        const got = merged[k];
        if (want === undefined) continue;
        if (got === undefined || String(got) !== String(want)) { matches = false; break; }
      }
      if (matches) return vc;
    }
    return null;
  };

  const matchingCombination = findMatchingCombination();
  let availableStock = null;
  if (matchingCombination) {
    availableStock = Number(matchingCombination.stock || 0);
  } else if (product.variantCombinations && product.variantCombinations.length > 0) {
    availableStock = null; // unknown until options selected
  } else {
    availableStock = Number(product.stock || 0);
  }

  const isAvailable = (() => {
    if (availableStock !== null) return availableStock > 0;
    return !!product.inStock;
  })();



  // Helper: Extract unique variant option names and their available values from variantCombinations
  const getVariantOptions = () => {
    if (!product.variantCombinations || product.variantCombinations.length === 0) return {};

    const options = {};
    for (const vc of product.variantCombinations) {
      const variantValues = vc.variantValues || {};
      for (const [key, value] of Object.entries(variantValues)) {
        if (!options[key]) {
          options[key] = new Set();
        }
        options[key].add(String(value));
      }
    }

    // Convert Sets to sorted arrays
    const result = {};
    for (const [key, set] of Object.entries(options)) {
      result[key] = Array.from(set).sort();
    }
    return result;
  };

  const variantOptions = getVariantOptions();

  // Submit review (requires authenticated user)
  const submitReview = async (reviewData) => {
    if (!token) {
      toast.error('Please log in to submit a review');
      throw new Error('Not authenticated');
    }
    try {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY;

      const prodId = product?._id || id || slug;
      if (!prodId) throw new Error('Product identifier missing');

      const res = await fetch(`${API}/api/products/${prodId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');

      toast.success('Review submitted successfully');

      // refresh product details - scroll restoration will happen automatically via useEffect
      // Refresh using the product _id when available
      if (product && product._id) dispatch(fetchProductById(product._id));
      else dispatch(fetchProductById(prodId));
    } catch (err) {
      console.error('submitReview error', err);
      scrollPositionRef.current = 0; // Reset on error
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-black-100">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-gray-400 transition">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/products')} className="hover:text-gray-400 transition">Products</button>
            <span>/</span>
            <span className="text-gray-400 font-semibold">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-2 sm:px-2 lg:px-2 py-8">
        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-5 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className=" rounded-2xl  overflow-hidden p-2 sticky" style={{ top: 'var(--pdp-sticky-offset, 0px)' }}>
              {/* Gallery Container - Thumbnails Left, Main Image Right */}
              <div className="flex gap-2">
                {/* Left Side: Thumbnail Gallery (Vertical) */}
                {displayImages.length > 1 && (
                  <div className="flex-shrink-0 flex flex-col items-center">
                    {/* Scroll Up Button - Circular */}
                    <button
                      onClick={() => setThumbStart(Math.max(0, thumbStart - 1))}
                      className="bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white p-3 rounded-full shadow-lg transition mb-3 flex items-center justify-center"
                      aria-label="Scroll up"
                    >
                      <FaArrowUp className="text-sm " />
                    </button>

                    {/* Thumbnails Container - Vertical Scroll */}
                    <div 
                      ref={thumbContainerRef}
                      className="flex flex-col gap-4 max-h-80 overflow-hidden px-1"
                    >
                      {displayImages.slice(thumbStart, thumbStart + THUMB_VISIBLE).map((img, idx) => {
                        const actualIndex = thumbStart + idx;
                        return (
                          <button
                            key={actualIndex}
                            onClick={() => setCurrentImageIndex(actualIndex)}
                            className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all duration-300 hover:scale-110 ${
                              currentImageIndex === actualIndex
                                ? 'border-black '
                                : 'border-gray-300 hover:border-gray-400 shadow-md'
                            }`}
                          >
                            <img
                              src={getImgSrc(img)}
                              alt={`Thumbnail ${actualIndex + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Scroll Down Button - Circular */}
                    <button
                      onClick={() => setThumbStart(Math.min(Math.max(0, displayImages.length - THUMB_VISIBLE), thumbStart + 1))}
                      className="bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white p-3 rounded-full shadow-lg transition mt-3 flex items-center justify-center"
                      aria-label="Scroll down"
                    >
                      <FaArrowDown className="text-sm " />
                    </button>
                  </div>
                )}

                {/* Right Side: Main Image */}
                <div className="flex-1">
                  {/* 3D Perspective Main Image Container */}
                  <div 
                    className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden group cursor-zoom-in flex items-center justify-center"
                   
                    onClick={() => { setZoomImageIndex(currentImageIndex); setShowZoomModal(true); }}
                  >
                    {/* 3D Tilted Image Container */}
                    <div
                      className="relative w-full h-full flex items-center justify-center"
                  
                    >
                      {/* Main Image with Shadow Effect */}
                      <div className="relative w-full h-full shadow-2xl rounded-lg overflow-hidden">
                        <img
                          src={getImgSrc(currentDisplayImage)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />

                       
                        {/* Navigation Arrows */}
                        {displayImages.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex((idx) => {
                                  const newIdx = (idx - 1 + displayImages.length) % displayImages.length;
                                  setThumbStart((s) => Math.max(0, Math.min(Math.max(0, displayImages.length - THUMB_VISIBLE), s - 1)));
                                  return newIdx;
                                });
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-100 text-white p-3 rounded-full transition-all z-10 shadow-lg flex items-center justify-center"
                              aria-label="Previous image"
                            >
                              <FaArrowLeft className="text-lg" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex((idx) => {
                                  const newIdx = (idx + 1) % displayImages.length;
                                  setThumbStart((s) => Math.min(Math.max(0, displayImages.length - THUMB_VISIBLE), s + 1));
                                  return newIdx;
                                });
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-100 text-white p-3 rounded-full transition-all z-10 shadow-lg flex items-center justify-center"
                              aria-label="Next image"
                            >
                              <FaArrowRight className="text-lg" />
                            </button>
                          </>
                        )}

                     
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              {/* <div className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold mb-4">
                {product.category}
              </div> */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(product.rating || 0, 'text-lg')}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{(product.rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-gray-600">({product.numReviews || product.reviews?.length || 0} verified reviews)</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-linear-to-br from-gray-50 to-grey-100 p-4">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-2xl font-bold text-gray-400">£{matchingCombination?.price || product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-3xl text-gray-400 line-through">£{product.originalPrice}</span>
                    {/* {product.discount && <span className="text-lg font-bold text-red-600">Save {product.discount}%</span>} */}
                  </>
                )}
              </div>
              <p className="text-gray-700 font-semibold">✓ Great Price • Free Shipping In UK Everywhere</p>
            </div>

            {/* Stock Status (variant-aware) */}
            <div className="p-4 bg-gray-100 border-l-4 border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${isAvailable ? 'text-green-400' : 'text-red-600'}`}>
                  {isAvailable ? '✓' : '✗'}
                </div>
                <div>
                  <p className={`font-bold text-lg ${isAvailable ? 'text-gray-900' : 'text-red-600'}`}>
                    {isAvailable ? 'In Stock - Ships Today!' : 'Out of Stock'}
                  </p>
                  <p className="text-gray-600 text-sm">{isAvailable ? 'Available for immediate dispatch' : 'This item is currently unavailable'}</p>
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-6">
              {/* Size Variations */}
              {product.specifications?.sizes && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Size {selectedSize && <span className="text-gray-400">- {selectedSize}</span>}
                  </label>
                  <select
                    value={selectedSize || ''}
                    onChange={(e) => setSelectedSize(e.target.value || null)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 bg-white cursor-pointer hover:border-gray-400 transition focus:outline-none focus:border-gray-400"
                  >
                    {/* <option value="">Choose a size...</option> */}
                    {product.specifications.sizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Color Variations */}
              {product.specifications?.colors && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Color {selectedColor && <span className="text-gray-400">- {selectedColor}</span>}
                  </label>
                  <select
                    value={selectedColor || ''}
                    onChange={(e) => setSelectedColor(e.target.value || null)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 bg-white cursor-pointer hover:border-gray-400 transition focus:outline-none focus:border-gray-400"
                  >
                    {/* <option value="">Choose a color...</option> */}
                    {product.specifications.colors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Variants from variantCombinations */}
              {Object.keys(variantOptions).length > 0 && Object.entries(variantOptions).map(([variantName, variantValues]) => (
                <div key={variantName} className="space-y-2">
                  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
                    {variantName} {selectedVariants[variantName] && <span className="text-gray-400">- {selectedVariants[variantName]}</span>}
                  </label>
                  <select
                    value={selectedVariants[variantName] || ''}
                    onChange={(e) => setSelectedVariants({ ...selectedVariants, [variantName]: e.target.value || null })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 bg-white cursor-pointer hover:border-gray-400 transition focus:outline-none focus:border-gray-400"
                  >

                    {variantValues.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              ))}



              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-6 py-3 hover:bg-gray-100 font-bold text-lg text-gray-700 transition"
                  >
                    −
                  </button>
                  <span className="px-8 py-3 border-l-2 border-r-2 border-gray-300 font-bold text-xl text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-6 py-3 hover:bg-gray-100 font-bold text-lg text-gray-700 transition"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button (disabled when out of stock) */}
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className={`flex-1 px-8 py-4 rounded-lg font-bold transition duration-300 flex items-center justify-center gap-3 text-lg shadow-lg transform ${isAvailable ? 'bg-gradient-to-r from-gray-700 to-black hover:from-gray-900 hover:to-grey-700 text-white hover:scale-105' : 'bg-gray-300 text-gray-700 cursor-not-allowed'}`}
                >
                  <FaShoppingCart /> {isAvailable ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>

              {/* Selected Options Summary */}
              {(selectedSize || selectedColor || Object.values(selectedVariants).some(v => v)) && (
                <div className="bg-gray-100 p-6 rounded-lg border-2 border-blue-300">
                  <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm">✓</span>
                    Your Selection Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSize && (
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-600 font-semibold uppercase">Size</p>
                        <p className="text-lg font-bold text-gray-400">{selectedSize}</p>
                      </div>
                    )}
                    {selectedColor && (
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-600 font-semibold uppercase">Color</p>
                        <p className="text-lg font-bold text-gray-400">{selectedColor}</p>
                      </div>
                    )}
                    {Object.entries(selectedVariants).filter(([_, val]) => val).map(([key, val]) => (
                      <div key={key} className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-600 font-semibold uppercase">{key}</p>
                        <p className="text-lg font-bold text-gray-400">{val}</p>
                      </div>
                    ))}
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Quantity</p>
                      <p className="text-lg font-bold text-gray-400">x{quantity}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg col-span-2">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Total Price</p>
                      <p className="text-2xl font-bold text-gray-400">£{((matchingCombination?.price || product.price) * quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleWishlist}
                  className={`py-3 px-4 rounded-lg font-bold transition duration-300 flex items-center justify-center gap-2 ${isInWishlist
                    ? 'bg-gradient-to-r from-red-500 to-black text-white hover:from-red-600 hover:to-grey-700'
                    : 'bg-black hover:bg-gray-700 text-white'
                    }`}
                >
                  <FaHeart /> {isInWishlist ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={handleShare}
                  className="py-3 px-4 rounded-lg font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 transition duration-300 flex items-center justify-center gap-2"
                >
                  <FaShareAlt /> Share
                </button>
              </div>
            </div>

            {/* Shipping & Returns Info Boxes */}
            <div className="grid grid-cols-1 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              {/* Shipping Info */}
              <div className="flex gap-4 items-start">
                <div className="text-2xl text-gray-900"><FaTruck /></div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Standard Shipping: 3-5 Business Days Standard</p>
                  <p className="text-gray-600 text-xs">Shipping: 1-2 Business Days</p>
                  <p className="text-gray-600 text-xs">Ships within the United Kingdom only. <Link to="/policies/shipping" className="text-gray-600 hover:underline font-semibold">See details →</Link></p>
                </div>
              </div>

              {/* Returns Info */}
              <div className="flex gap-4 items-start border-t pt-4 mt-2">
                <div className="text-2xl text-gray-900"><FaSync /></div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">31 Days Returns Policy.</p>
                  <p className="text-gray-600 text-xs"><Link to="/policies/returns-refund" className="text-gray-600 hover:underline font-semibold">See details →</Link></p>
                </div>
              </div>
            </div>

        
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center hover:border-gray-400 transition">
                <FaTruck className="text-2xl text-gray-900 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">
                  <Link href="/policies/shipping" className="hover:text-gray-400">Free Shipping (UK)</Link>
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center hover:border-gray-400 transition">
                <FaUndoAlt className="text-2xl text-gray-900 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">
                  <Link href="/policies/returns-refund" className="hover:text-gray-400">31 Days Return & Refund</Link>
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center hover:border-gray-400 transition">
                <FaStar className="text-2xl text-gray-900 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">
                  <Link href="/policies/secure-checkout" className="hover:text-gray-400">Secure Checkout</Link>
                </p>
              </div>

            </div>

            {/* Key Benefits (dynamic when available) */}
            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-gray-900">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Why Buy This Product?</h3>
              {product.benefits && typeof product.benefits === 'string' && product.benefits.trim() ? (
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.benefits }}
                />
              ) : product.benefits && Array.isArray(product.benefits) && product.benefits.length > 0 ? (
                <ul className="space-y-2 text-gray-700">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-3"><FaCheck className="text-gray-400" /> {b}</li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-3"><FaCheck className="text-gray-900" /> Premium quality & authentic products</li>
                  <li className="flex items-center gap-3"><FaCheck className="text-gray-900" /> Competitive pricing with great value</li>
                  <li className="flex items-center gap-3"><FaCheck className="text-gray-900" /> Trusted by 100K+ customers</li>
                  <li className="flex items-center gap-3"><FaCheck className="text-gray-900" /> Expert customer support team</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Description & Reviews Tabs */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'description' ? 'bg-gradient-to-r from-gray-700 to-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Product Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'reviews' ? 'bg-gradient-to-r from-gray-700 to-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Reviews ({product.numReviews || product.reviews?.length || 0})
              </button>
            </div>
          </div>

          {activeTab === 'description' ? (
            <div className="p-6">

              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-8"
                dangerouslySetInnerHTML={{ __html: product.description || '' }}
              />
            </div>
          ) : (
            <div className="p-0">
              {/* Reviews Component */}
              <Reviews
                product={product}
                token={token}
                user={user}
                onSubmitReview={submitReview}
                requireReviewApproval={requireReviewApproval}
                API={API}
              />
            </div>
          )}
        </div>

        {/* Related Products Component */}
        {product && (
          <RelatedProducts
            currentProductId={product._id}
            currentCategory={product.category}
            limit={5}
          />
        )}

        {/* Zoom Modal with Mouse-Based Magnification */}
        {showZoomModal && displayImages.length > 0 && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowZoomModal(false)}
          >
            <div
              className="relative w-full max-w-5xl flex items-center justify-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Side: Main Image with Mouse Tracking */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  ref={zoomImageRef}
                  className="relative bg-white rounded-lg overflow-hidden shadow-2xl cursor-crosshair"
                  onMouseMove={(e) => {
                    if (!zoomImageRef.current) return;
                    const rect = zoomImageRef.current.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    setZoomMousePos({ x, y });
                  }}
                  onMouseLeave={() => setZoomMousePos({ x: 0, y: 0 })}
                  style={{ maxWidth: '500px', maxHeight: '500px' }}
                >
                  <img
                    src={getImgSrc(displayImages[zoomImageIndex])}
                    alt={`${product.name} zoom`}
                    className="w-full h-full object-contain"
                  />

                  {/* Magnifying Glass Lens Circle */}
                  <div
                    className="absolute w-20 h-20 border-4 border-yellow-400 rounded-full pointer-events-none shadow-lg"
                    style={{
                      left: `${zoomMousePos.x - 40}px`,
                      top: `${zoomMousePos.y - 40}px`,
                      opacity: zoomMousePos.x > 0 || zoomMousePos.y > 0 ? 1 : 0,
                      transition: 'opacity 0.2s'
                    }}
                  />
                </div>
                {displayImages.length > 1 && (
                  <div className="flex gap-3 m-5 justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
                      }}
                      className="bg-white hover:bg-gray-100 text-black rounded-full p-3 shadow-lg transition"
                      aria-label="Previous image"
                    >
                      <FaArrowLeft size={18} />
                    </button>
                    <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-full flex items-center justify-center min-w-20">
                      <span className="font-semibold">{zoomImageIndex + 1} / {displayImages.length}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomImageIndex((prev) => (prev + 1) % displayImages.length);
                      }}
                      className="bg-white hover:bg-gray-100 text-black rounded-full p-3 shadow-lg transition"
                      aria-label="Next image"
                    >
                      <FaArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>


              {/* Right Side: Magnified View */}
              <div className="flex-1 flex flex-col justify-center items-center gap-4">
                <div
                  className="relative bg-white rounded-lg overflow-hidden shadow-2xl border-4 border-gray-400"
                  style={{ width: '300px', height: '300px' }}
                >
                  <img
                    src={getImgSrc(displayImages[zoomImageIndex])}
                    alt={`${product.name} magnified`}
                    className="absolute w-full h-full object-contain"
                    style={{
                      transform: 'scale(2.5)',
                      transformOrigin: `${(zoomMousePos.x / (zoomImageRef.current?.offsetWidth || 1)) * 100}% ${(zoomMousePos.y / (zoomImageRef.current?.offsetHeight || 1)) * 100}%`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  />

                  {/* Instruction text when not hovering */}
                  {(zoomMousePos.x === 0 && zoomMousePos.y === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-50">
                      <p className="text-gray-600 text-center font-semibold">Move mouse over image to zoom</p>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}

              </div>

              {/* Close button */}
              <button
                onClick={() => setShowZoomModal(false)}
                className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-black rounded-full p-3 shadow-lg transition"
                aria-label="Close zoom"
              >
                <span className="text-xl font-bold">✕</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
