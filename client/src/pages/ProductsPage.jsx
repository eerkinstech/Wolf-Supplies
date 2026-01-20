import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setFilter } from '../redux/slices/productSlice';
import ProductCard from '../components/Products/ProductCard/ProductCard';
import ProductFilter from '../components/Products/ProductFilter/ProductFilter';
import { FaSpinner } from 'react-icons/fa';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { products, loading, filters } = useSelector((state) => state.product);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    let result = products;

    if (filters.search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      // Support both new categories array and legacy single category
      result = result.filter((p) => {
        if (Array.isArray(p.categories)) {
          return p.categories.some(c => c._id === filters.category || c.name === filters.category);
        }
        return p.category === filters.category;
      });
    }

    result = result.filter(
      (p) => p.price >= filters.price.min && p.price <= filters.price.max
    );

    setFilteredProducts(result);
  }, [products, filters]);

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-xl text-gray-600">Browse our amazing collection of products</p>
        </div>

        <div className="grid lg:grid-cols-6 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <ProductFilter
                filters={filters}
                onFilterChange={(newFilters) => dispatch(setFilter(newFilters))}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-4 space-y-8">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center">
                  <FaSpinner className="text-6xl text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-xl text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-8 text-lg">
                  Showing <span className="font-bold text-gray-400">{filteredProducts.length}</span> products
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-6">🔍</div>
                <p className="text-2xl text-gray-600 font-semibold mb-2">No products found</p>
                <p className="text-gray-900 text-lg">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
