import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoryBySlug } from '../redux/slices/categorySlice';
import { fetchProducts, setFilter } from '../redux/slices/productSlice';
import ProductCard from '../components/Products/ProductCard/ProductCard';
import ProductFilter from '../components/Products/ProductFilter/ProductFilter';
import CategoryCard from '../components/Categories/CategoryCard/CategoryCard';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories, selectedCategory, loading, error } = useSelector((state) => state.category);
  const { products, filters } = useSelector((state) => state.product);

  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [subcategories, setSubcategories] = React.useState([]);

  useEffect(() => {
    // Reset filter state and fetch category and products on mount/slug change
    setFilteredProducts([]);
    setSubcategories([]);
    dispatch(fetchCategoryBySlug(slug));
    dispatch(fetchProducts());
    window.scrollTo(0, 0);
  }, [slug, dispatch]);

  // Get subcategories for current category
  useEffect(() => {
    if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
      // The backend now populates subcategories directly, so use them as-is
      const subs = Array.isArray(selectedCategory.subcategories)
        ? selectedCategory.subcategories
        : categories.filter(c => selectedCategory.subcategories.includes(c._id));
      setSubcategories(subs);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(setFilter({ category: selectedCategory.name }));
    }
  }, [selectedCategory, dispatch]);

  useEffect(() => {
    let result = products;

    // Filter by categories array (support for multiple categories)
    if (selectedCategory) {
      result = result.filter((p) => {
        // Check if product has categories array (new format)
        if (Array.isArray(p.categories)) {
          return p.categories.some(c => c._id === selectedCategory._id);
        }
        // Fallback: support legacy single category field
        return p.category === selectedCategory._id || p.category === selectedCategory.name;
      });
    }

    // Apply other filters
    if (filters.search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    result = result.filter(
      (p) => p.price >= filters.price.min && p.price <= filters.price.max
    );

    setFilteredProducts(result);
  }, [products, filters, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-black-100 py-16 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-black-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-semibold mb-8 transition duration-300"
          >
            <FaArrowLeft /> Back to Categories
          </button>
          <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-6">⚠️</div>
            <p className="text-2xl text-red-600 font-semibold mb-2">Category Not Found</p>
            <p className="text-gray-900 text-lg">The category you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category Banner */}
      <div className="relative h-80 md:h-96 overflow-hidden bg-gradient-to-br from-gray-700 to-grey-700">
        {selectedCategory.image && (
          <img
            src={selectedCategory.image}
            alt={selectedCategory.name}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedCategory.color || 'from-gray-700/70 to-grey-700/70'}`}></div>

        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <div className="text-6xl md:text-7xl mb-6">{selectedCategory.icon}</div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{selectedCategory.name}</h1>
              <p className="text-white text-opacity-95 text-lg md:text-xl max-w-3xl leading-relaxed">{selectedCategory.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-semibold transition duration-300 transform hover:-translate-x-1"
          >
            <FaArrowLeft /> Back to Categories
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* CASE 1: If subcategories exist - Show ONLY subcategories */}
          {subcategories.length > 0 ? (
            <div className="mb-16">
              <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                  {selectedCategory.parent ? 'Sub-Subcategories' : 'Subcategories'}
                </h2>
                <p className="text-gray-600 text-lg">Browse all {selectedCategory.parent ? 'sub-subcategories' : 'subcategories'} under <span className="font-semibold text-gray-400">{selectedCategory.name}</span></p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {subcategories.map((subcat) => (
                  <CategoryCard key={subcat._id} category={subcat} />
                ))}
              </div>
            </div>
          ) : // CASE 2: No subcategories - Show products if they exist
            filteredProducts.length > 0 ? (
              <div>
                <div className="mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                    {selectedCategory.level === 'main'
                      ? `All ${selectedCategory.name} Products`
                      : `${selectedCategory.name} Products`}
                  </h2>
                  <p className="text-gray-600 text-lg">Showing <span className="font-semibold text-gray-400">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="grid lg:grid-cols-6 gap-10">
                  {/* Sidebar */}
                  <div className="lg:col-span-2">
                    <div className="sticky top-32">
                      <ProductFilter
                        filters={filters}
                        onFilterChange={(newFilters) => dispatch(setFilter(newFilters))}
                      />
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="lg:col-span-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // CASE 3: No subcategories AND no products - Show Nothing Found
              <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-6">📭</div>
                <p className="text-2xl text-gray-600 font-semibold mb-2">Nothing Found</p>
                <p className="text-gray-900 text-lg mb-8">This category has no subcategories or products yet</p>
                <button
                  onClick={() => navigate('/categories')}
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 font-semibold transition duration-300"
                >
                  <FaArrowLeft /> Back to Categories
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Related Categories Section */}
      {selectedCategory.level === 'main' && (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore More Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories
                .filter((cat) => cat.level === 'main' && cat._id !== selectedCategory._id)
                .slice(0, 4)
                .map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => navigate(`/category/${cat.slug}`)}
                    className={`bg-gradient-to-br ${cat.color} rounded-xl p-6 text-white text-center hover:shadow-lg transition duration-300 transform hover:scale-105`}
                  >
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <p className="font-bold text-lg">{cat.name}</p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailPage;
