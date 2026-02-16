import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import useMetaTags from '../hooks/useMetaTags';
import { fetchProducts, setFilter } from '../redux/slices/productSlice';
import ProductCard from '../components/Products/ProductCard/ProductCard';
import ProductFilter from '../components/Products/ProductFilter/ProductFilter';


const ProductsPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { products, loading, filters } = useSelector((state) => state.product);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Set up meta tags for SEO
  useMetaTags({
    title: 'Shop All Products | Wolf Supplies LTD',
    description: 'Browse our complete range of quality products. Fast UK delivery, competitive prices, and excellent customer service.',
    keywords: 'products, shop, buy, online store, quality, affordable',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  // Extract search query from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    setSearchQuery(q);

    // Update the search filter in Redux
    if (q) {
      dispatch(setFilter({ ...filters, search: q }));
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Calculate the maximum price from all products (for filter display)
  const maxPriceFromProducts = useMemo(() => {
    if (!products || products.length === 0) return 100;

    let maxPrice = 0;
    products.forEach((p) => {
      // Check base price
      if (p.price > maxPrice) {
        maxPrice = p.price;
      }
      // Check variant prices
      if (p.variantCombinations && p.variantCombinations.length > 0) {
        p.variantCombinations.forEach((vc) => {
          const vcPrice = vc.price || p.price;
          if (vcPrice > maxPrice) {
            maxPrice = vcPrice;
          }
        });
      }
    });

    return maxPrice || 100;
  }, [products]);

  // Separate and organize products: exact matches first, then partial matches, then others
  useEffect(() => {
    let result = products;
    const searchTerm = filters.search?.toLowerCase() || '';

    // Filter out draft products - only show active/published products
    result = result.filter(p => !p.isDraft);

    // Categorize products
    let exactMatches = [];
    let partialMatches = [];
    let otherProducts = [];

    result.forEach((p) => {
      const productName = p.name.toLowerCase();
      const productCategory = Array.isArray(p.categories)
        ? p.categories.map(c => (c.name || c).toLowerCase()).join(' ')
        : (p.category || '').toLowerCase();

      // Check if product matches search
      const searchMatches = searchTerm && (
        productName.includes(searchTerm) ||
        productCategory.includes(searchTerm)
      );

      // Categorize search results
      if (searchMatches) {
        if (productName.startsWith(searchTerm)) {
          exactMatches.push(p);
        } else {
          partialMatches.push(p);
        }
      } else {
        otherProducts.push(p);
      }
    });

    // Start with search results (exact + partial), then other products
    let organizingResult = [...exactMatches, ...partialMatches, ...otherProducts];

    // Apply category filter
    if (filters.category) {
      organizingResult = organizingResult.filter((p) => {
        if (Array.isArray(p.categories)) {
          return p.categories.some(c => c._id === filters.category || c.name === filters.category);
        }
        return p.category === filters.category;
      });
    }

    // Apply stock filter (check both variant and non-variant products)
    if (filters.availability && filters.availability.length > 0) {
      organizingResult = organizingResult.filter((p) => {
        // Check if product has variants
        const hasVariants = p.variants && p.variants.length > 0;
        let isInStock;

        if (hasVariants) {
          // For variant products, check if any variant combination has stock
          const hasStock = p.variantCombinations && p.variantCombinations.some(vc => vc.stock > 0);
          isInStock = hasStock;
        } else {
          // For non-variant products, check basic stock
          isInStock = p.stock > 0;
        }

        // Check if the product's stock status matches the selected filters
        if (filters.availability.includes('in_stock') && isInStock) return true;
        if (filters.availability.includes('out_of_stock') && !isInStock) return true;
        return false;
      });
    }

    // Apply price filter
    // For products with variants: check lowest variant price (ignore blank base price)
    // For products without variants: check base price
    organizingResult = organizingResult.filter((p) => {
      const hasVariants = p.variants && p.variants.length > 0;

      if (hasVariants && p.variantCombinations && p.variantCombinations.length > 0) {
        // For variant products: get the lowest available price from variants
        let lowestVariantPrice = null;
        for (const vc of p.variantCombinations) {
          if (vc.price && vc.price > 0) {
            if (lowestVariantPrice === null || vc.price < lowestVariantPrice) {
              lowestVariantPrice = vc.price;
            }
          }
        }

        // Use variant price if available, otherwise use base price
        const priceToCheck = lowestVariantPrice !== null ? lowestVariantPrice : p.price;
        return priceToCheck >= filters.price.min && priceToCheck <= filters.price.max;
      }

      // For non-variant products, check base price
      return p.price >= filters.price.min && p.price <= filters.price.max;
      return basePriceInRange;
    });

    setFilteredProducts(organizingResult);
  }, [products, filters]);

  const hasSearchResults = searchQuery && filteredProducts.length > 0;
  const exactMatchCount = useMemo(() => {
    if (!searchQuery) return 0;
    return filteredProducts.filter(p =>
      p.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    ).length;
  }, [filteredProducts, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-4">Our Products</h1>
          {searchQuery ? (
            <div className="space-y-2">
              <p className="text-xl text-[var(--color-text-light)]">
                Search results for: <span className="font-bold text-[var(--color-text-primary)]">"{searchQuery}"</span>
              </p>
              {hasSearchResults && (
                <p className="text-sm text-green-600 font-semibold">
                  ✓ Found {filteredProducts.length} matching product{filteredProducts.length !== 1 ? 's' : ''} (Showing best matches first)
                </p>
              )}
            </div>
          ) : (
            <p className="text-xl text-[var(--color-text-light)]">Browse our amazing collection of products</p>
          )}
        </div>

        <div className="grid lg:grid-cols-6 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <ProductFilter
                filters={filters}
                maxPrice={maxPriceFromProducts}
                onFilterChange={(newFilters) => dispatch(setFilter(newFilters))}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-4 space-y-8">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center">
                  <i className="fas fa-spinner animate-spin" style={{ fontSize: '64px', color: 'var(--color-text-light)', display: 'block', marginBottom: '16px' }}></i>
                  <p className="text-xl text-[var(--color-text-light)]">Loading products...</p>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div>
                {/* Results Summary */}
                <div className="mb-8 p-4 bg-gradient-to-r from-[var(--color-bg-section)] to-[var(--color-bg-section)] rounded-lg border border-[var(--color-border-light)]">
                  <p className="text-[var(--color-text-light)]">
                    Showing <span className="font-bold text-[var(--color-text-primary)]">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
                    {searchQuery && (
                      <span> matching "<span className="font-bold text-[var(--color-accent-primary)]">{searchQuery}</span>"</span>
                    )}
                  </p>
                  {searchQuery && exactMatchCount > 0 && (
                    <p className="text-sm text-green-700 mt-2">
                      💡 {exactMatchCount} exact match{exactMatchCount !== 1 ? 'es' : ''} shown first
                    </p>
                  )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 bg-gradient-to-br from-[var(--color-bg-section)] to-[var(--color-bg-section)] rounded-2xl shadow-lg border border-[var(--color-border-light)]">
                <div className="text-6xl mb-6">🔍</div>
                <p className="text-2xl text-[var(--color-text-light)] font-semibold mb-2">No products found</p>
                {searchQuery ? (
                  <div>
                    <p className="text-[var(--color-text-light)] text-lg mb-4">
                      We couldn't find any products matching "<span className="font-bold">{searchQuery}</span>"
                    </p>
                    <button
                      onClick={() => {
                        dispatch(setFilter({ ...filters, search: '' }));
                        setSearchQuery('');
                      }}
                      className="inline-block px-6 py-2 bg-[var(--color-accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-accent-light)] transition duration-300"
                    >
                      View All Products
                    </button>
                  </div>
                ) : (
                  <p className="text-[var(--color-text-light)] text-lg">Try adjusting your filters</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
