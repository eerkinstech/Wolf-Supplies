import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../ProductCard/ProductCard';
import { FaChevronRight } from 'react-icons/fa';

const RelatedProducts = ({ currentProductId, currentCategory }) => {
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.product);

  // Filter related products from same category, excluding current product
  const relatedProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.category === currentCategory &&
          product._id !== currentProductId
      )
      .slice(0, limit);
  }, [products, currentCategory, currentProductId, limit]);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-20 py-12 bg-gradient-to-br from-gray-100 via-white to-gray-200 rounded-3xl p-8 md:p-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-1 w-12 bg-gray-800 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-700 uppercase tracking-wider">More Products</h2>
        </div>
        <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Related Products
        </h3>
        <p className="text-xl text-gray-600">
          You might also like these {currentCategory} items
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <div key={product._id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => navigate(`/products?category=${currentCategory}`)}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-900 text-white px-10 py-4 rounded-xl font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg"
        >
          View All {currentCategory} Products
          <FaChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default RelatedProducts;
