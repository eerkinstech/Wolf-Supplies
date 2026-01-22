import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../../redux/slices/productSlice';
import ProductCard from '../ProductCard/ProductCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const FeaturedProducts = ({
    category = '',
    limit = 8,
    title = 'Featured Products',
    layout = 'grid', // 'grid' or 'carousel'
    columns = 5,
    spacing = 'md',
    imageBorderRadius = 'md',
    titleFontSize = 'lg',
    descFontSize = 'sm',
    editorContent,
    editorStyle
}) => {
    // allow editor overrides
    if (editorContent) {
        title = editorContent.title || title;
        category = editorContent.category || category;
        limit = editorContent.limit || limit;
        layout = editorContent.layout || layout;
        columns = editorContent.columns || columns;
        spacing = editorContent.spacing || spacing;
        imageBorderRadius = editorContent.imageBorderRadius || imageBorderRadius;
        titleFontSize = editorContent.titleFontSize || titleFontSize;
        descFontSize = editorContent.descFontSize || descFontSize;
    }
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [screenSize, setScreenSize] = useState('lg');
    const { products, loading } = useSelector((state) => state.product);

    // Map spacing values to Tailwind classes
    const getSpacingClass = (spacingValue) => {
        const spacingMap = {
            'sm': 'gap-2',
            'md': 'gap-4',
            'lg': 'gap-6',
            'xl': 'gap-8'
        };
        return spacingMap[spacingValue] || 'gap-4';
    };

    // Map border radius values
    const getBorderRadiusClass = (radiusValue) => {
        const radiusMap = {
            'none': 'rounded-none',
            'sm': 'rounded-sm',
            'md': 'rounded-md',
            'lg': 'rounded-lg',
            'full': 'rounded-full'
        };
        return radiusMap[radiusValue] || 'rounded-md';
    };

    // Map font sizes
    const getFontSizeClass = (sizeValue) => {
        const sizeMap = {
            'xs': 'text-xs',
            'sm': 'text-sm',
            'base': 'text-base',
            'lg': 'text-lg',
            'xl': 'text-xl',
            '2xl': 'text-2xl'
        };
        return sizeMap[sizeValue] || 'text-base';
    };

    // Get grid columns class
    const getColumnsClass = (col) => {
        const colMap = {
            2: 'lg:grid-cols-2',
            3: 'lg:grid-cols-3',
            4: 'lg:grid-cols-4',
            5: 'lg:grid-cols-4',
            6: 'lg:grid-cols-6'
        };
        return colMap[col] || 'lg:grid-cols-4';
    };

    // Determine items per slide based on screen size
    const getItemsPerSlide = () => {
        if (screenSize === 'sm') return 1;
        if (screenSize === 'md') return 2;
        return 5; // lg and xl
    };

    const ITEMS_PER_SLIDE = getItemsPerSlide();

    // Monitor screen size
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScreenSize('sm');
            } else if (width < 1024) {
                setScreenSize('md');
            } else {
                setScreenSize('lg');
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Fetch products if not already loaded
        if (products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, products.length]);

    useEffect(() => {
        // Filter products by category - no limit applied here
        // Grid mode shows all, carousel mode will handle showing 5 at a time
        if (products && products.length > 0) {
            let filtered = products;

            // Filter by category if provided
            if (category && category.trim()) {
                filtered = filtered.filter((product) => {
                    // Handle both old single category and new categories array format
                    if (product.categories && Array.isArray(product.categories)) {
                        return product.categories.some(
                            (cat) =>
                                (typeof cat === 'string' ? cat : cat.name || cat.slug)
                                    .toLowerCase() === category.toLowerCase()
                        );
                    } else if (product.category) {
                        return product.category.toLowerCase() === category.toLowerCase();
                    }
                    return false;
                });
            }

            // Only update state if filtered products actually changed
            setFilteredProducts((prev) => {
                // Check if arrays are different before updating
                if (prev.length !== filtered.length) return filtered;
                if (prev.length === 0) return filtered;
                // Quick check if it's the same data
                const prevIds = prev.map(p => p._id).join(',');
                const filteredIds = filtered.map(p => p._id).join(',');
                return prevIds === filteredIds ? prev : filtered;
            });
        }
    }, [products, category]);

    // Carousel navigation - slides by 1 item
    const handlePrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            Math.min(prev + 1, Math.max(0, filteredProducts.length - ITEMS_PER_SLIDE))
        );
    };

    if (loading && products.length === 0) {
        return (
            <section className="py-4 px-4  bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 flex items-center justify-between">
                        <h2 className="text-5xl md:text-6xl font-bold text-[#2e2e2e] mb-4">{title}</h2>
                        {category && (
                            <button
                                onClick={() => navigate(`/products?category=${category}`)}
                                className="px-8 py-3 bg-black rounded-lg text-white font-bold text-sm uppercase tracking-wider hover:bg-gray-900 transition duration-300"
                            >
                                Shop All
                            </button>
                        )}
                    </div>
                    {layout === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
                            {[...Array(limit)].map((_, index) => (
                                <div key={index} className="bg-gradient-to-br from-gray-200 to-black-300 rounded-3xl h-96 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-gray-200 to-black-300 rounded-3xl h-96 animate-pulse"></div>
                    )}
                </div>
            </section>
        );
    }

    if (filteredProducts.length === 0) {
        return (
            <section className="py-4 px-4  bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 flex items-center justify-between">
                        <h2 className="text-5xl md:text-6xl font-bold text-[#2e2e2e] mb-4">{title}</h2>
                        {category && (
                            <button
                                onClick={() => navigate(`/products?category=${category}`)}
                                className="px-8 py-3 bg-black text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-gray-900 transition duration-300"
                            >
                                Shop All
                            </button>
                        )}
                    </div>
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 text-xl font-medium">
                            {category ? `No products found in ${category}` : 'No products available'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-4 px-4  bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h2 className="text-5xl md:text-6xl font-bold text-[#2e2e2e] mb-4">{title}</h2>

                    </div>
                    <button
                        onClick={() => navigate(category ? `/products?category=${category}` : '/products')}
                        className="px-8 py-3 bg-[#1e40af] text-white font-bold rounded-lg text-sm uppercase tracking-wider hover:bg-gray-900 transition duration-300"
                    >
                        Shop All
                    </button>
                </div>

                {layout === 'grid' ? (
                    // Grid Layout
                    <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${getColumnsClass(columns)} gap-1 sm:gap-2 md:gap-4 lg:gap-8`}>
                        {filteredProducts.slice(0, limit).map((product) => (
                            <div key={product._id} className="transform hover:scale-105 transition duration-300">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Carousel Layout - 5 items with overlay chevrons
                    <div className="relative py-6">
                        {/* Left Chevron - Overlay */}
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition duration-300 shadow-xl hover:shadow-2xl hover:scale-110 z-20"
                            aria-label="Previous products"
                        >
                            <FaChevronLeft className="text-lg" />
                        </button>

                        {/* Grid Container - Full Width */}
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateX(-${currentIndex * (100 / Math.min(filteredProducts.length, limit))}%)`,
                                    width: `${(Math.min(filteredProducts.length, limit) / ITEMS_PER_SLIDE) * 100}%`,
                                }}
                            >
                                {filteredProducts.slice(0, limit).map((product) => (
                                    <div key={product._id} className="transform hover:scale-105 my-4 transition duration-300 flex-shrink-0 px-2 md:px-3" style={{ width: `${100 / Math.min(filteredProducts.length, limit)}%` }}>
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Chevron - Overlay */}
                        <button
                            onClick={handleNext}
                            disabled={currentIndex >= Math.min(filteredProducts.length, limit) - ITEMS_PER_SLIDE}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition duration-300 shadow-xl hover:shadow-2xl hover:scale-110 z-20"
                            aria-label="Next products"
                        >
                            <FaChevronRight className="text-lg" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;
