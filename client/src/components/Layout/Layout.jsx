import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaHamburger } from 'react-icons/fa';

const Layout = ({ children, showMenuSlider = false }) => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [activeMenuIndex, setActiveMenuIndex] = useState(-1);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Slider data with 4 slides
    const slides = [
        {
            id: 1,
            title: 'Premium Safety Equipment',
            description: 'Discover our wide range of high-quality safety equipment designed to keep you protected.',
            buttonText: 'Shop Now',
            buttonLink: '/products',
            bgImage: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&h=600&fit=crop',
            icon: '🦺'
        },
        {
            id: 2,
            title: 'Professional Tools & Gear',
            description: 'Everything you need for your professional work with durability and reliability.',
            buttonText: 'Explore Tools',
            buttonLink: '/products?category=tools',
            bgImage: 'https://images.unsplash.com/photo-1761062176693-74ea7c9f1278?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            icon: '🔧'
        },
        {
            id: 3,
            title: 'Protective Clothing',
            description: 'Stay safe with our comprehensive collection of protective wear and apparel.',
            buttonText: 'View Collection',
            buttonLink: '/products?category=clothing',
            bgImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=600&fit=crop',
            icon: '👔'
        },
        {
            id: 4,
            title: 'Exclusive Offers',
            description: 'Limited time deals on premium products. Don\'t miss out on amazing savings!',
            buttonText: 'See Deals',
            buttonLink: '/products?featured=deals',
            bgImage: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1400&h=600&fit=crop',
            icon: '🎁'
        }
    ];

    // Auto-rotate slides every 5 seconds
    useEffect(() => {
        const slideTimer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(slideTimer);
    }, []);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch('/api/settings/menu');
                const data = await response.json();
                setMenuItems(data.browseMenu || []);
            } catch (error) {
                console.error('Error fetching menu:', error);
            }
        };
        fetchMenu();
    }, []);

    if (!showMenuSlider) {
        return <>{children}</>;
    }

    // Home Page Layout with Menu Mega Menu (Same as Header)
    return (
        <div className="w-full bg-white pb-10 md:pb-0">
            {/* Top Navigation Bar */}
            <div className="w-full hidden md:block bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center gap-4 px-4 py-2 overflow-x-auto">
                    <div className="flex items-center gap-2 font-bold text-gray-900 text-lg whitespace-nowrap">
                        <FaHamburger /> Shop By Category
                    </div>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <Link to="/" className="px-4 py-2 hover:text-gray-400 font-semibold text-gray-700 whitespace-nowrap">
                        Home
                    </Link>
                    <Link to="/about" className="px-4 py-2 hover:text-gray-400 font-semibold text-gray-700 whitespace-nowrap">
                        About Us
                    </Link>
                    <Link to="/products" className="px-4 py-2 hover:text-gray-400 font-semibold text-gray-700 whitespace-nowrap">
                        Shop
                    </Link>
                    <Link to="/contact" className="px-4 py-2 hover:text-gray-400 font-semibold text-gray-700 whitespace-nowrap">
                        Contact Us
                    </Link>
                </div>
            </div>

            {/* Main Content Area with Left Menu and Right Slider */}
            <div className="w-full bg-white relative" onMouseLeave={() => setActiveMenuIndex(-1)}>
                <div className="flex w-full h-auto">
                    {/* Left Sidebar - Always Visible on Desktop, Hidden on Mobile */}
                    <div className="hidden md:block w-72 border-r-4 border-gray-400 max-h-full overflow-y-auto bg-white shadow-lg">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={item.id || `m_${idx}`}
                                to={item.url || item.link || '/'}
                                onMouseEnter={() => setActiveMenuIndex(idx)}
                                onMouseLeave={() => setActiveMenuIndex(-1)}
                                className={`block w-full text-left px-6 py-4 border-b border-gray-300 transition duration-150 font-semibold text-base ${activeMenuIndex === idx ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{item.label || item.name || 'Menu Item'}</span>
                                    <FaChevronDown className="text-xs text-gray-400" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Right Side - Slider + Overlaid Menu */}
                    <div className="flex-1 bg-white relative h-96">
                        {/* Slider Container */}
                        <div className="w-full h-full relative overflow-hidden ">
                            {slides.map((slide, idx) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    style={{
                                        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${slide.bgImage}')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'right center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                >
                                    {/* Slide Content */}
                                    <div className="flex items-center justify-between h-full px-6 relative">
                                        {/* Left Content */}
                                        <div className="flex-1 text-white z-10">
                                            <div className="text-6xl mb-4">{slide.icon}</div>
                                            <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                                            <p className="text-lg mb-8 leading-relaxed max-w-md">{slide.description}</p>
                                            <Link
                                                to={slide.buttonLink}
                                                className="inline-block bg-gradient-to-r from-gray-700 to-black hover:from-gray-900 hover:to-grey-700 text-white font-bold px-8 py-3 rounded-lg transition duration-300 shadow-lg transform hover:scale-105"
                                            >
                                                {slide.buttonText}
                                            </Link>
                                        </div>


                                    </div>
                                </div>
                            ))}

                            {/* Navigation Arrows */}
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-800 p-3 rounded-full z-20 transition duration-300"
                                aria-label="Previous slide"
                            >
                                <FaChevronLeft className="text-xl" />
                            </button>

                            <button
                                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-800 p-3 rounded-full z-20 transition duration-300"
                                aria-label="Next slide"
                            >
                                <FaChevronRight className="text-xl" />
                            </button>

                            {/* Slide Dots */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide
                                            ? 'bg-white w-8'
                                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                            }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Menu Content - Overlaid with Z-index */}
                        {activeMenuIndex >= 0 && (
                            <div className="absolute inset-0 bg-white shadow-2xl z-50 flex flex-col">
                                {/* Top Category Tabs */}
                                <div className="border-b border-gray-900 px-6 py-4 flex gap-6 overflow-x-auto">
                                    {menuItems.map((item, idx) => (
                                        <button
                                            key={item.id || `tab_${idx}`}
                                            onMouseEnter={() => setActiveMenuIndex(idx)}
                                            className={`text-sm font-semibold transition duration-150 whitespace-nowrap pb-2 border-b-2 ${activeMenuIndex === idx ? 'text-gray-400 border-gray-400' : 'text-gray-600 border-transparent hover:text-gray-900'}`}
                                        >
                                            {item.label || item.name || 'Menu Item'}
                                        </button>
                                    ))}
                                </div>

                                {/* Subcategories Section */}
                                <div className="flex-1 bg-white overflow-y-auto p-2">
                                    <div className="space-y-3">
                                        {menuItems[activeMenuIndex]?.sub && menuItems[activeMenuIndex].sub.length > 0 ? (
                                            menuItems[activeMenuIndex].sub.map((subItem) => (
                                                <Link
                                                    key={subItem.id}
                                                    to={subItem.link || '#'}
                                                    className="block px-4 py-2.5 mb-0 text-gray-700 hover:text-gray-400 hover:underline font-semibold text-base transition duration-150"
                                                >
                                                    {subItem.name}
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-center py-12">
                                                <p className="text-gray-400 text-center">Menu item details</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="w-full">
                {children}
            </main>

            
        </div>
    );
};

export default Layout;