import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, setSearchQuery, clearSearchQuery } from '../redux/slices/categorySlice';
import CategoryCard from '../components/Categories/CategoryCard/CategoryCard';
import CategoryFilter from '../components/Categories/CategoryFilter/CategoryFilter';
import { FaSpinner } from 'react-icons/fa';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories, loading, error, searchQuery } = useSelector((state) => state.category);
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Flatten all categories including nested subcategories
    const flattenCategories = (items) => {
      let flattened = [];
      items.forEach((item) => {
        flattened.push(item);
        // If item has subcategories array, flatten them too
        if (item.subcategories && Array.isArray(item.subcategories) && item.subcategories.length > 0) {
          flattened = flattened.concat(flattenCategories(item.subcategories));
        }
      });
      return flattened;
    };

    let result = flattenCategories(categories);

    if (searchQuery) {
      // If searching, filter the flattened list
      result = result.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCategories(result);
  }, [categories, searchQuery]);

  const handleSearchChange = (value) => {
    dispatch(setSearchQuery(value));
  };

  const handleClearSearch = () => {
    dispatch(clearSearchQuery());
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-4">
            Shop by Category
          </h1>
          <p className="text-xl text-[var(--color-text-light)] max-w-2xl">
            Explore our wide range of products organized by category. Find exactly what you're looking for.
          </p>
        </div>

        {/* Search Filter */}
        <CategoryFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
        />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <FaSpinner className="text-6xl text-[var(--color-text-light)] animate-spin mx-auto mb-4" />
              <p className="text-xl text-[var(--color-text-light)]">Loading categories...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-[var(--color-bg-primary)] rounded-2xl shadow-lg">
            <div className="text-6xl mb-6">⚠️</div>
            <p className="text-2xl text-red-600 font-semibold mb-2">Error Loading Categories</p>
            <p className="text-[var(--color-text-primary)] text-lg">{error}</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div>
            <p className="text-[var(--color-text-light)] mb-8 text-lg">
              Showing <span className="font-bold text-[var(--color-accent-primary)]">{filteredCategories.length}</span> categor{filteredCategories.length === 1 ? 'y' : 'ies'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {filteredCategories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-[var(--color-bg-primary)] rounded-2xl shadow-lg">
            <div className="text-6xl mb-6">🔍</div>
            <p className="text-2xl text-[var(--color-text-light)] font-semibold mb-2">No categories found</p>
            <p className="text-[var(--color-text-primary)] text-lg">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
