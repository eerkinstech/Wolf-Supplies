import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaHamburger } from 'react-icons/fa';

const Layout = ({ children, showMenuSlider = false }) => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [activeMenuPath, setActiveMenuPath] = useState([0]); // Track path for progressive menu
    const [browseOpen, setBrowseOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Validate that all menu items have links (recursively check nested items)
    const validateMenuLinks = (items, path = 'root') => {
        if (!items || !Array.isArray(items)) return;
        items.forEach((item, idx) => {
            const itemPath = `${path}[${idx}]`;
            const hasLink = item.url || item.link;
            const linkValue = item.url || item.link;
            // Recursively check submenu items
            const submenuItems = item.submenu || item.sub || [];
            if (submenuItems.length > 0) {
                validateMenuLinks(submenuItems, itemPath);
            }
        });
    };

    // Load menu from API on component mount
    useEffect(() => {
        const loadMenu = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API}/api/settings/menu`);
                if (!res.ok) return;
                const data = await res.json();
                if (data && Array.isArray(data.browseMenu)) {
                    validateMenuLinks(data.browseMenu);
                    setMenuItems(data.browseMenu);
                }
            } catch (err) {
            }
        };
        loadMenu();
    }, []);

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

    // Recursive function to render nested menus as dropdowns on hover
    const renderNestedMenu = (items, level = 0) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="space-y-0">
                {items.map((item, idx) => {
                    const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);
                    const submenuItems = item.submenu || item.sub || [];

                    return (
                        <div key={item.id || `item_${level}_${idx}`} className="relative group">
                            <Link
                                to={item.url || item.link || '#'}
                                className={`block px-4 py-2 rounded transition duration-150 ${level === 0
                                    ? 'text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] font-semibold text-sm'
                                    : 'text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] text-sm px-3 py-2'
                                    } ${hasSubmenu ? 'flex items-center justify-between' : ''}`}
                            >
                                {item.label || item.name}
                                {hasSubmenu && level === 0 && <FaChevronDown className="text-xs ml-2" />}
                            </Link>

                            {/* Dropdown submenu - only visible on hover */}
                            {hasSubmenu && (
                                <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-lg z-50 min-w-max border border-[var(--color-border-light)]">
                                    {renderNestedMenu(submenuItems, level + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!showMenuSlider) {
        return (
            <>
                {children}
            </>
        );
    }

    // Home Page Layout with Menu Mega Menu (Same as Header)
    return (
        <div className="w-full bg-[var(--color-bg-primary)] pb-10 md:pb-0">
            {/* Top Navigation Bar */}
            <div className="w-full hidden md:block bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)] sticky top-0 z-30">
                <div className="flex items-center gap-4 px-4 py-2 overflow-x-auto">
                    <div className="flex items-center gap-2 font-bold text-[var(--color-text-primary)] text-lg whitespace-nowrap">
                        <FaHamburger /> Shop By Category
                    </div>
                    <div className="h-6 w-px bg-[var(--color-border-light)]"></div>
                    <Link to="/" className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                        Home
                    </Link>
                    <Link to="/about" className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                        About Us
                    </Link>
                    <Link to="/products" className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                        Shop
                    </Link>
                    <Link to="/contact" className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                        Contact Us
                    </Link>
                </div>
            </div>

            {/* Main Content Area with Progressive Menu and Right Slider */}
            <div className="w-full bg-white relative" onMouseLeave={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}>
                <div className="flex w-full h-auto">
                    {/* Left Sidebar - Menu Mega Panel */}
                    <div className="hidden md:flex md:flex-col w-72 border-r-4 border-[var(--color-border-light)] bg-[var(--color-bg-primary)] shadow-lg relative">
                        {/* Menu Items List */}
                        <div className="border-b border-[var(--color-border-light)] overflow-y-auto flex-1">
                            {menuItems.map((item, idx) => {
                                const hasLink = item.url || item.link;
                                const link = item.url || item.link || '#';
                                const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);

                                return (
                                    <Link
                                        key={item.id || `m_${idx}`}
                                        to={link}
                                        onMouseEnter={() => { setBrowseOpen(true); setActiveMenuPath([idx]); }}
                                        onClick={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}
                                        className={`w-full text-left px-6 py-4 border-b border-[var(--color-border-light)] transition duration-150 font-semibold text-base flex items-center justify-between no-underline ${activeMenuPath[0] === idx
                                            ? 'bg-[var(--color-bg-section)] text-[var(--color-text-primary)]'
                                            : 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-section)]'
                                            }`}
                                    >
                                        <span>{item.label || item.name || 'Menu Item'}</span>
                                        {hasSubmenu && (
                                            <FaChevronDown className="text-xs text-[var(--color-text-light)]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Submenu Columns - Progressive Reveal - Absolute Positioned Above Slider */}
                        {browseOpen && (
                            <div className="absolute left-72  top-0 z-50 bg-white overflow-x-auto flex h-96 border border-[var(--color-border-light)] shadow-2xl" style={{ width: 'calc(100vw - 310px)' }}>
                                {/* Dynamic Columns for Nested Menus */}
                                {(() => {
                                    const columns = [];
                                    let currentLevel = menuItems;
                                    let currentPath = [...activeMenuPath];

                                    // Always build the first submenu column
                                    if (currentPath.length > 0) {
                                        const itemIndex = currentPath[0];
                                        if (itemIndex >= 0 && itemIndex < currentLevel.length) {
                                            const currentItem = currentLevel[itemIndex];
                                            const nextLevel = (currentItem?.submenu || currentItem?.sub) || [];

                                            if (nextLevel.length > 0) {
                                                columns.push(
                                                    <div key="col_1" className="w-56 bg-white border-r border-[var(--color-border-light)] overflow-y-auto p-0 flex flex-col flex-shrink-0">
                                                        {nextLevel.map((item, idx) => {
                                                            const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);
                                                            const isActive = idx === currentPath[1];
                                                            return (
                                                                <Link
                                                                    key={item.id || `sub_${idx}`}
                                                                    to={item.url || item.link || '#'}
                                                                    onClick={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}
                                                                    onMouseEnter={() => setActiveMenuPath([currentPath[0], idx])}
                                                                    className={`w-full text-left px-6 py-4 border-b border-[var(--color-border-light)] transition duration-150 font-semibold text-base flex items-center justify-between no-underline ${isActive
                                                                        ? 'bg-[var(--color-bg-section)] text-[var(--color-accent-primary)]'
                                                                        : 'bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-section)] hover:text-[var(--color-accent-primary)]'
                                                                        }`}
                                                                >
                                                                    <span>{item.label || item.name}</span>
                                                                    {hasSubmenu && (
                                                                        <FaChevronDown className="text-xs text-[var(--color-text-light)]" />
                                                                    )}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                                currentLevel = nextLevel;
                                            }
                                        }
                                    }

                                    // Build additional columns for deeper nesting
                                    for (let depth = 1; depth < currentPath.length && currentLevel && currentLevel.length > 0; depth++) {
                                        const itemIndex = currentPath[depth];
                                        if (itemIndex >= 0 && itemIndex < currentLevel.length) {
                                            const currentItem = currentLevel[itemIndex];
                                            const nextLevel = (currentItem?.submenu || currentItem?.sub) || [];

                                            if (nextLevel.length > 0) {
                                                columns.push(
                                                    <div key={`col_${depth + 1}`} className="w-56 bg-white border-r border-[var(--color-border-light)] overflow-y-auto p-0 flex flex-col flex-shrink-0">
                                                        {nextLevel.map((item, idx) => {
                                                            const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);
                                                            const isActive = idx === currentPath[depth + 1];
                                                            return (
                                                                <Link
                                                                    key={item.id || `item_${depth}_${idx}`}
                                                                    to={item.url || item.link || '#'}
                                                                    onClick={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}
                                                                    onMouseEnter={() => setActiveMenuPath([...currentPath.slice(0, depth + 1), idx])}
                                                                    className={`w-full text-left px-6 py-4 border-b border-[var(--color-border-light)] transition duration-150 font-semibold text-base flex items-center justify-between no-underline ${isActive
                                                                        ? 'bg-[var(--color-bg-section)] text-[var(--color-accent-primary)]'
                                                                        : 'bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-section)] hover:text-[var(--color-accent-primary)]'
                                                                        }`}
                                                                >
                                                                    <span>{item.label || item.name}</span>
                                                                    {hasSubmenu && (
                                                                        <FaChevronDown className="text-xs text-[var(--color-text-light)]" />
                                                                    )}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                                currentLevel = nextLevel;
                                            }
                                        }
                                    }

                                    return columns;
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Right Side - Slider + Overlaid Menu */}
                    <div className="flex-1 bg-[var(--color-bg-primary)] relative h-96">
                        {/* Slider Container */}
                        <div className="w-full h-full relative overflow-hidden ">
                            {slides.map((slide, idx) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-transform duration-700 ease-in-out ${idx === currentSlide 
                                        ? 'translate-x-0' 
                                        : idx < currentSlide 
                                        ? '-translate-x-full'
                                        : 'translate-x-full'
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
                                        <div className="flex-1 text-white z-10 sm:ml-12 ml-4">
                                            {/* <div className="text-6xl mb-4">{slide.icon}</div> */}
                                            <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                                            <p className="text-lg mb-8 leading-relaxed max-w-md">{slide.description}</p>
                                            <Link
                                                to={slide.buttonLink}
                                                className="inline-block bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white font-bold px-8 py-3 rounded-lg transition duration-300 shadow-lg"
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
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[var(--color-bg-primary)] bg-opacity-70 hover:bg-opacity-100 text-[var(--color-accent-primary)] p-2 rounded-full z-20 transition duration-300"
                                aria-label="Previous slide"
                            >
                                <FaChevronLeft className="sm:text-lg text-sm"/>
                            </button>

                            <button
                                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[var(--color-bg-primary)] bg-opacity-70 hover:bg-opacity-100 text-[var(--color-accent-primary)] p-2 rounded-full z-20 transition duration-300"
                                aria-label="Next slide"
                            >
                                <FaChevronRight className="sm:text-lg text-sm"/>
                            </button>

                            {/* Slide Dots */}
                            {/* <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide
                                            ? 'bg-[var(--color-accent-primary)] w-8'
                                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                            }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div> */}
                        </div>

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