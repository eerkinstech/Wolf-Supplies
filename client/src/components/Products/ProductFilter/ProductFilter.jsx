import React, { useEffect } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../../redux/slices/categorySlice';

const ProductFilter = ({ filters, onFilterChange }) => {
  const dispatch = useDispatch();
  const { categories = [] } = useSelector((state) => state.category || {});

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [categories, dispatch]);
  const priceRanges = [
    { min: 0, max: 50, label: 'Under £50' },
    { min: 50, max: 100, label: '£50 - £100' },
    { min: 100, max: 500, label: '£100 - £500' },
    { min: 500, max: 10000, label: 'Above £500' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b-2 border-gray-200">
        <FaFilter className="text-2xl text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
      </div>

      {/* Search */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-gray-900">Search Products</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition text-lg"
        />
      </div>

      {/* Category Filter */}
      <div className="space-y-4 pb-8 border-b-2 border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Category</h3>
        <div className="space-y-3">
          {(categories && categories.length > 0 ? categories : []).map((category) => (
            <label key={category._id || category.name} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={category.name}
                checked={filters.category === category.name}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                className="w-5 h-5 text-gray-400 rounded focus:ring-2 focus:ring-gray-400 transition duration-300"
              />
              <span className="ml-3 text-gray-700 group-hover:text-gray-400 transition duration-300 font-medium">{category.name}</span>
            </label>
          ))}
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => onFilterChange({ category: '' })}
              className="w-5 h-5 text-gray-400 rounded focus:ring-2 focus:ring-gray-400 transition duration-300"
            />
            <span className="ml-3 text-gray-700 group-hover:text-gray-400 transition duration-300 font-medium">All Categories</span>
          </label>
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-4 pb-8 border-b-2 border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Price Range</h3>
        <div className="space-y-3">
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="price"
                value={JSON.stringify(range)}
                checked={
                  filters.price.min === range.min && filters.price.max === range.max
                }
                onChange={(e) => {
                  const { min, max } = JSON.parse(e.target.value);
                  onFilterChange({ price: { min, max } });
                }}
                className="w-5 h-5 text-gray-400 rounded focus:ring-2 focus:ring-gray-400 transition duration-300"
              />
              <span className="ml-3 text-gray-700 group-hover:text-gray-400 transition duration-300 font-medium">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() =>
          onFilterChange({
            search: '',
            category: '',
            price: { min: 0, max: 10000 },
          })
        }
        className="w-full bg-linear-to-r bg-black hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
      >
        <FaTimes className="text-[10px]" /> Clear All Filters
      </button>
    </div>
  );
};

export default ProductFilter;
