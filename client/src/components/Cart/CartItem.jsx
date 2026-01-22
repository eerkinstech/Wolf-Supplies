import React from 'react';
import { FaTrash, FaBox, FaTag, FaCheck } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || '';

const getImgSrc = (img) => {
  if (!img) return null;

  // If array, use first usable entry
  if (Array.isArray(img)) {
    const first = img.find((x) => !!x);
    return getImgSrc(first);
  }

  // If object, try common fields
  if (typeof img === 'object') {
    const url = img.url || img.secure_url || img.path || img.src || img.public_id || img.location;
    if (!url) return null;
    return typeof url === 'string' ? (url.startsWith('http') ? url : `${API}${url}`) : null;
  }

  // string
  if (typeof img === 'string') {
    return img.startsWith('http') ? img : `${API}${img}`;
  }

  return null;
};

const CartItem = ({ item, onRemove, onUpdateQuantity, index, isLast }) => {
  return (
    <>
      <div className="p-6 sm:p-8 hover:bg-linear-to-r hover:from-gray-50 hover:to-blue-50 transition duration-300">
        {/* Product Main Info */}
        <div className="flex flex-col sm:flex-row gap-6 mb-4">
          {/* Product Image */}
          <div className="relative w-32 h-32 bg-linear-to-br from-gray-100 to-black-200 rounded-xl flex-shrink-0 overflow-hidden group flex items-center justify-center">
            {getImgSrc(item.image) ? (
              <img
                src={getImgSrc(item.image)}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300 rounded-xl"
              />
            ) : (
              <div className="text-4xl">🛍️</div>
            )}

          </div>

          {/* Product Details */}
          <div className="grow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">{item.name}</h3>

              </div>
              <p className="text-2xl font-bold text-gray-400">£{Number(item.price).toFixed(2)}</p>
            </div>

            {/* Variants Display */}
            {(item.selectedSize || item.selectedColor || (item.selectedVariants && Object.keys(item.selectedVariants).length > 0)) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  {item.selectedSize && (
                    <div className="flex items-center gap-2">
                      <FaBox className="text-gray-700 text-sm" />
                      <span className="text-sm">
                        <span className="font-semibold text-gray-700">Size:</span>
                        <span className="text-gray-600 ml-1">{item.selectedSize}</span>
                      </span>
                    </div>
                  )}
                  {item.selectedColor && (
                    <div className="flex items-center gap-2">
                      <FaTag className="text-pink-600 text-sm" />
                      <span className="text-sm">
                        <span className="font-semibold text-gray-700">Color:</span>
                        <span className="text-gray-600 ml-1">{item.selectedColor}</span>
                      </span>
                    </div>
                  )}
                  {item.selectedVariants && Object.entries(item.selectedVariants).filter(([_, v]) => v).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <FaCheck className="text-gray-400 text-sm" />
                      <span className="text-sm">
                        <span className="font-semibold text-gray-700">{key}:</span>
                        <span className="text-gray-600 ml-1">{value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quantity & Total Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
          {/* Quantity Control */}
          <div className="flex items-center border-2 border-gray-300 rounded-lg bg-white w-fit">
            <button
              onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
              className="px-5 py-2 hover:bg-gray-100 font-bold text-lg text-gray-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={item.quantity <= 1}
            >
              −
            </button>
            <span className="px-8 py-2 border-l-2 border-r-2 border-gray-300 font-bold text-lg text-gray-900 w-16 text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
              className="px-5 py-2 hover:bg-gray-100 font-bold text-lg text-gray-700 transition duration-300"
            >
              +
            </button>
          </div>

          {/* Price Info */}
          <div className="flex items-center justify-between sm:justify-end gap-8">

            <div className="text-right">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="font-bold text-2xl text-gray-400">£{(Number(item.price) * item.quantity).toFixed(2)}</p>
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => {
              try {
                if (typeof onRemove === 'function') onRemove(item._id);
              } catch (err) {
                console.error('CartItem remove handler error', err);
              }
            }}
            className="w-full sm:w-auto px-4 py-2 text-black hover:bg-gray-100 font-semibold flex items-center justify-center gap-2 transition duration-300 rounded-lg border border-gray-400 hover:border-gray-600"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>
      {!isLast && <div className="border-b border-gray-100"></div>}
    </>
  );
};

export { CartItem };
export default CartItem;
