import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout.jsx';
import FeaturedProducts from '../../components/Products/FeaturedProducts/FeaturedProducts.jsx';
import FeaturedCategories from '../../components/Categories/FeaturedCategories/FeaturedCategories.jsx';

const FEATURED_CATEGORIES_KEY = 'shophub_featured_categories';
const FEATURED_PRODUCTS_KEY = 'shophub_featured_products';

const AdminCollectionsPage = () => {
    const dispatch = useDispatch();
    const { categories } = useSelector((s) => s.category);

    const [allCategories, setAllCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'products'

    // Featured Categories State
    const [featuredCategoryNames, setFeaturedCategoryNames] = useState([]);
    const [featuredCategoryLayout, setFeaturedCategoryLayout] = useState('grid'); // 'grid' or 'carousel'
    const [featuredCategoryColumns, setFeaturedCategoryColumns] = useState(5); // 2-6 columns

    // Featured Products State (3 sections)
    const [featuredProductsSections, setFeaturedProductsSections] = useState([
        { title: 'Featured Products 1', category: '', limit: 4, layout: 'grid' },
        { title: 'Featured Products 2', category: '', limit: 4, layout: 'grid' },
        { title: 'Featured Products 3', category: '', limit: 4, layout: 'grid' },
    ]);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchProducts());
    }, [dispatch]);

    useEffect(() => {
        // Recursively flatten all categories (main, sub, and sub-sub)
        const flattenCategories = (cats) => {
            let result = [];
            if (!cats || !Array.isArray(cats)) return result;

            for (const cat of cats) {
                result.push(cat);
                // Recursively add subcategories
                if (cat.subcategories && Array.isArray(cat.subcategories)) {
                    result = result.concat(flattenCategories(cat.subcategories));
                }
            }
            return result;
        };

        const flat = flattenCategories(categories || []);
        setAllCategories(flat || []);
    }, [categories]);

    // Load featured collections from database
    useEffect(() => {
        const loadFeaturedCollections = async () => {
            try {
                const response = await fetch('/api/settings/featured-collections');
                const data = await response.json();
                if (data.featuredCategories) {
                    setFeaturedCategoryNames(data.featuredCategories.categoryNames || []);
                    setFeaturedCategoryLayout(data.featuredCategories.layout || 'grid');
                    setFeaturedCategoryColumns(data.featuredCategories.columns || 5);
                }
                if (data.featuredProducts && Array.isArray(data.featuredProducts) && data.featuredProducts.length > 0) {
                    setFeaturedProductsSections(data.featuredProducts);
                }
            } catch (e) {
                console.error('Error loading featured collections from database', e);
            }
        };
        loadFeaturedCollections();
    }, []);

    // Save Featured Categories to Database
    const handleSaveFeaturedCategories = async () => {
        if (featuredCategoryNames.length === 0) {
            toast.error('Select at least one category');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/featured-collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    featuredCategories: {
                        categoryNames: featuredCategoryNames,
                        layout: featuredCategoryLayout,
                        columns: featuredCategoryColumns,
                    },
                }),
            });
            if (!response.ok) throw new Error('Failed to save');
            toast.success('✅ Featured categories saved to database!');
        } catch (error) {
            console.error('Error saving featured categories:', error);
            toast.error('❌ Failed to save featured categories');
        }
    };

    // Save Featured Products to Database
    const handleSaveFeaturedProducts = async () => {
        const allValid = featuredProductsSections.every((section) => {
            // Category is optional (if empty, show all products)
            // But limit is required
            if (!section.limit || section.limit < 1) {
                return false;
            }
            return true;
        });

        if (!allValid) {
            toast.error('Fill all sections with limit (min 1). Category is optional - leave blank to show all products');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/featured-collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    featuredProducts: featuredProductsSections,
                }),
            });
            if (!response.ok) throw new Error('Failed to save');
            toast.success('✅ Featured products saved to database!');
        } catch (error) {
            console.error('Error saving featured products:', error);
            toast.error('❌ Failed to save featured products');
        }
    };

    // Toggle category selection
    const toggleCategorySelect = (categoryName) => {
        setFeaturedCategoryNames((prev) =>
            prev.includes(categoryName)
                ? prev.filter((n) => n !== categoryName)
                : [...prev, categoryName]
        );
    };

    // Update section
    const updateSection = (index, field, value) => {
        const updated = [...featuredProductsSections];
        updated[index] = { ...updated[index], [field]: value };
        setFeaturedProductsSections(updated);
    };

    return (
        <AdminLayout activeTab="collections">
            <main className="py-8 px-6 bg-white min-h-screen">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Featured Collections</h1>
                            <p className="text-gray-600">Manage which products and categories appear as featured on your storefront</p>
                        </div>
                        <Link to="/admin" className="inline-flex items-center gap-2 bg-white border border-gray-300 px-5 py-2.5 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-t-xl border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`flex-1 px-8 py-4 font-semibold text-center transition border-b-3 ${activeTab === 'categories'
                                ? 'border-gray-400 text-gray-400 bg-black'
                                : 'border-transparent bg-white hover:bg-gray-700 text-black'
                                }`}
                        >
                            📂 Featured Categories
                        </button>
                        <div className="w-px bg-gray-200"></div>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex-1 px-8 py-4 font-semibold text-center transition border-b-3 ${activeTab === 'products'
                                ? 'border-gray-400 text-gray-400 bg-black'
                                : 'border-transparent bg-white hover:bg-gray-700 text-black'
                                }`}
                        >
                            🛍️ Featured Products (3 Sections)
                        </button>
                    </div>
                </div>

                {/* Featured Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="bg-white rounded-b-xl">
                        <div className="p-8">
                            {/* Settings Panel */}
                            <div className="max-w-full space-y-6">
                                {/* Category Selection */}
                                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-xl">📂</span> Select Categories
                                    </h3>
                                    <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto bg-white">
                                        {allCategories.length > 0 ? (
                                            allCategories.map((c) => (
                                                <label key={c._id || c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={featuredCategoryNames.includes(c.name)}
                                                        onChange={() => toggleCategorySelect(c.name)}
                                                        className="w-5 h-5 accent-gray-400"
                                                    />
                                                    <span className="text-gray-800 font-medium">{c.name}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="px-4 py-6 text-gray-900 text-center">No categories available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Layout Selection */}
                                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-xl">📐</span> Display Layout
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition" style={{ borderColor: featuredCategoryLayout === 'grid' ? 'gray-400' : '#d1d5db' }}>
                                            <input
                                                type="radio"
                                                value="grid"
                                                checked={featuredCategoryLayout === 'grid'}
                                                onChange={(e) => setFeaturedCategoryLayout(e.target.value)}
                                                className="w-5 h-5 accent-gray-400"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">Grid View</div>
                                                <div className="text-xs text-gray-600">Display all selected categories in grid</div>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition" style={{ borderColor: featuredCategoryLayout === 'carousel' ? 'gray-400' : '#d1d5db' }}>
                                            <input
                                                type="radio"
                                                value="carousel"
                                                checked={featuredCategoryLayout === 'carousel'}
                                                onChange={(e) => setFeaturedCategoryLayout(e.target.value)}
                                                className="w-5 h-5 accent-gray-400"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">Carousel</div>
                                                <div className="text-xs text-gray-600">5 items visible at once, slide through all selected</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Columns Selection */}
                                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-xl">🔲</span> Number of Columns (Grid Only)
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="2"
                                            max="6"
                                            value={featuredCategoryColumns}
                                            onChange={(e) => setFeaturedCategoryColumns(Number(e.target.value))}
                                            className="flex-1 cursor-pointer"
                                        />
                                        <span className="text-2xl font-bold text-gray-900 min-w-12 text-center bg-white px-4 py-2 rounded-lg border border-gray-300">
                                            {featuredCategoryColumns}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-3">
                                        {featuredCategoryColumns === 2 && '📱 2 columns - Mobile friendly, larger items'}
                                        {featuredCategoryColumns === 3 && '📱 3 columns - Tablet friendly'}
                                        {featuredCategoryColumns === 4 && '🖥️ 4 columns - Desktop view'}
                                        {featuredCategoryColumns === 5 && '🖥️ 5 columns - Standard desktop, many items'}
                                        {featuredCategoryColumns === 6 && '🖥️ 6 columns - Wide layout, compact items'}
                                    </p>
                                </div>

                                {/* Items Summary */}
                                <div className="bg-gray-100 border border-gray-300 rounded-lg p-5">
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span>📋</span> Selected Items
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {featuredCategoryNames.length > 0 ? (
                                            featuredCategoryNames.map((name) => (
                                                <span key={name} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                                    {name}
                                                    <button
                                                        onClick={() => toggleCategorySelect(name)}
                                                        className="hover:text-gray-900"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-700 text-sm">No categories selected yet</span>
                                        )}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-300">
                                        <p className="text-sm text-gray-900">
                                            <strong>{featuredCategoryNames.length} categories selected</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSaveFeaturedCategories}
                                    className="w-full bg-black hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition shadow-lg"
                                >
                                    💾 Save Configuration
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Featured Products Tab */}
                {activeTab === 'products' && (
                    <div className="bg-white rounded-b-xl">
                        <div className="space-y-10 p-8">
                            {/* 3 Sections */}
                            {featuredProductsSections.map((section, idx) => (
                                <div key={idx} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 transition">
                                    {/* Section Header */}
                                    <div className="bg-gray-50 border-b border-gray-200 px-8 py-5">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-800 text-white rounded-full font-bold text-sm">
                                                {idx + 1}
                                            </span>
                                            {section.title || `Section ${idx + 1}`}
                                        </h3>
                                    </div>

                                    {/* Section Content */}
                                    <div className="p-8">
                                        {/* Settings Panel */}
                                        <div className="max-w-full space-y-6">
                                            {/* Title Input */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="text-lg">📝</span> Section Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={(e) => updateSection(idx, 'title', e.target.value)}
                                                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:outline-none font-medium transition"
                                                    placeholder="e.g., Latest Electronics"
                                                />
                                            </div>

                                            {/* Category Selection */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                    <span className="text-lg">📂</span> Category (Optional)
                                                </label>
                                                <p className="text-xs text-gray-600 mb-3 italic">Leave blank to show all products from all categories</p>
                                                <select
                                                    value={section.category}
                                                    onChange={(e) => updateSection(idx, 'category', e.target.value)}
                                                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:outline-none font-medium transition bg-white cursor-pointer"
                                                >
                                                    <option value="">-- All Products --</option>
                                                    {allCategories.map((c) => (
                                                        <option key={c._id || c.id} value={c.name}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Items Count */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="text-lg">🔢</span> Items to Display
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        value={section.limit}
                                                        onChange={(e) => updateSection(idx, 'limit', Number(e.target.value))}
                                                        className="flex-1 border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:outline-none font-bold transition"
                                                    />
                                                    <span className="text-lg font-semibold text-gray-700">items</span>
                                                </div>
                                            </div>

                                            {/* Layout Selection */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="text-lg">📐</span> Display Layout
                                                </label>
                                                <div className="space-y-3">
                                                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition" style={{ borderColor: section.layout === 'grid' ? 'gray-400' : '#d1d5db' }}>
                                                        <input
                                                            type="radio"
                                                            value="grid"
                                                            checked={section.layout === 'grid'}
                                                            onChange={(e) => updateSection(idx, 'layout', e.target.value)}
                                                            className="w-5 h-5 accent-gray-400"
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-gray-900">Grid</div>
                                                            <div className="text-xs text-gray-600">5 columns, all items</div>
                                                        </div>
                                                    </label>
                                                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition" style={{ borderColor: section.layout === 'carousel' ? 'gray-400' : '#d1d5db' }}>
                                                        <input
                                                            type="radio"
                                                            value="carousel"
                                                            checked={section.layout === 'carousel'}
                                                            onChange={(e) => updateSection(idx, 'layout', e.target.value)}
                                                            className="w-5 h-5 accent-gray-400"
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-gray-900">Carousel</div>
                                                            <div className="text-xs text-gray-600">5 visible, slide through</div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Configuration Summary */}
                                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-5">
                                                <h4 className="font-bold text-purple-900 mb-3 text-sm">⚙️ Configuration</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-800">Title:</span>
                                                        <span className="font-semibold text-purple-900">{section.title || 'Untitled'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-800">Category:</span>
                                                        <span className="font-semibold text-purple-900">{section.category || 'Not set'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-800">Count:</span>
                                                        <span className="font-semibold text-purple-900">{section.limit} items</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-800">Layout:</span>
                                                        <span className="font-semibold text-purple-900 uppercase">{section.layout}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Save All Button */}
                            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-8">
                                <button
                                    onClick={handleSaveFeaturedProducts}
                                    className="w-full bg-black hover:bg-gray-700 text-white font-bold py-4 rounded-lg transition shadow-lg text-lg flex items-center justify-center gap-3"
                                >
                                    <span>💾</span> Save All Featured Products Configurations
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </AdminLayout>
    );
};

export default AdminCollectionsPage;
