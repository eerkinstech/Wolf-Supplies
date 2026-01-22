import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, syncCart } from '../../../redux/slices/cartSlice';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';

const API = import.meta.env.VITE_API_URL || '';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // Don't render draft products
  if (product.isDraft) {
    return null;
  }

  // Check if product has variants
  const hasVariants = product.variantCombinations && product.variantCombinations.length > 0;

  // Get all product images
  const allImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);

  // Helper to get absolute image URL
  const getImgSrc = (img) => {
    if (!img) return '';
    if (typeof img !== 'string') return '';
    return img.startsWith('http') ? img : `${API}${img}`;
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const { token } = useAuth();
  const cartItems = useSelector((state) => state.cart.items);

  const handleAddToCart = async (e) => {
    e.preventDefault();

    // Normalize image (support multiple possible object fields)
    const rawImage = allImages && allImages.length > 0 ? allImages[0] : '';
    let normalizedImage = '';
    if (typeof rawImage === 'string') normalizedImage = rawImage;
    else if (rawImage && typeof rawImage === 'object') normalizedImage = rawImage.url || rawImage.src || rawImage.path || rawImage.secure_url || rawImage.secureUrl || rawImage.public_url || rawImage.publicUrl || '';

    const cartItem = {
      _id: product._id,
      product: product._id,
      name: product.name,
      image: normalizedImage,
      price: Number(product.price || 0),
      category: product.category,
      discount: product.discount,
      quantity: 1,
      selectedVariants: {},
    };

    dispatch(addToCart(cartItem));
    if (token) {
      // build items array as reducer would have
      const existing = cartItems.find((i) => i._id === cartItem._id);
      let newItems = [];
      if (existing) newItems = cartItems.map((i) => i._id === cartItem._id ? { ...i, quantity: (i.quantity || 0) + 1 } : i);
      else newItems = [...cartItems, cartItem];
      try {
        await dispatch(syncCart(newItems));
      } catch (err) {
        console.error('ProductCard: syncCart failed', err);
        toast.error('Failed to save cart to server');
      }
    }

    toast.success('Added to cart!');
  };

  const productUrl = product.slug || product._id;

  return (
    <Link to={`/product/${productUrl}`}>
      <div className="md:hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col p-2 sm:p-4 rounded-lg bg-white shadow-md md:shadow-none">
        {/* Product Image Container */}
        <div className="w-full h-48 bg-gray-50 rounded-lg overflow-hidden mb-4 flex items-center justify-center border border-gray-200">
          <img
            src={getImgSrc(allImages[currentImageIndex])}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        {/* Product Info */}
        <div className="flex flex-col flex-grow">
          {/* Product Name */}
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm group-hover:text-gray-600 transition duration-300">
            {product.name}
          </h3>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className={`${i < Math.floor(product.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {product.rating ? `${product.rating.toFixed(1)}` : '0'} ({product.reviewCount || 0})
            </span>
          </div>
          {/* Price */}
          <div className="mb-4 flex items-baseline gap-2">
            {hasVariants ? (
              <>
                <span className="text-xs text-gray-600">From</span>
                <span className="text-lg font-bold text-gray-800">£{product.variantCombinations[0].price?.toFixed(2) || product.price?.toFixed(2) || '0.00'}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-800">£{product.price?.toFixed(2) || '0.00'}</span>
            )}
          </div>

          {/* Button - Always visible on mobile, shown on hover on desktop */}
          {hasVariants ? (
            <Link
              to={`/product/${productUrl}`}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded font-bold text-sm transition-all duration-300 text-center mt-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transform md:translate-y-2 md:group-hover:translate-y-0 shadow-md"
            >
              Select Options
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded font-bold text-sm transition-all duration-300 mt-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transform md:translate-y-2 md:group-hover:translate-y-0 shadow-md"
            >
              Shop Now
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
