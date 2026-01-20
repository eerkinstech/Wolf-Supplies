import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { useElementorBuilder } from '../../context/ElementorBuilderContext';
import wolfLogo from '../../assets/Wolf Supplies LTD.png';
import {
    FaShoppingCart, FaUser, FaBars, FaTimes, FaSignOutAlt,
    FaChevronDown, FaSearch, FaPhone, FaHeart,
    FaList, FaUserShield, FaCog, FaEdit, FaEnvelope
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Header = ({ hideMenu = false }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');
    const navigate = useNavigate();
    const { logout, isAuthenticated, user, isAdmin } = useAuth();
    const { toggleEditMode } = useElementorBuilder();
    const { totalQuantity } = useSelector((state) => state.cart);
    const { totalItems: wishlistCount } = useSelector((state) => state.wishlist);
    const { categories } = useSelector((state) => state.category);
    const dispatch = useDispatch();

    // local saved menu from settings (fetched below)
    const [browseMenu, setBrowseMenu] = useState([]);

    // Get only main categories from Redux
    const mainCategories = categories.filter(c => c.level === 'main');

    // Menu source: prefer saved browseMenu from settings, otherwise fall back to categories
    const menuSource = (browseMenu && browseMenu.length > 0) ? browseMenu : mainCategories;
    const [activeMenuIndex, setActiveMenuIndex] = useState(0);
    const [browseOpen, setBrowseOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const handleMobileSearchSubmit = (e) => {
        e?.preventDefault();
        const q = mobileSearchQuery?.trim();
        setMobileSearchOpen(false);
        if (q) {
            navigate(`/products?search=${encodeURIComponent(q)}`);
        } else {
            navigate('/products');
        }
    };

    // Close mobile menu/search on Escape and prevent background scroll when open
    const mobileMenuRef = useRef(null);
    const searchInputRef = useRef(null);
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                if (mobileMenuOpen) setMobileMenuOpen(false);
                if (mobileSearchOpen) setMobileSearchOpen(false);
            }
        };
        document.addEventListener('keydown', onKey);

        // lock scroll when either overlay is open
        if (mobileMenuOpen || mobileSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen, mobileSearchOpen]);

    // Autofocus the mobile search input when opening the modal
    useEffect(() => {
        if (mobileSearchOpen && searchInputRef.current) {
            // small timeout to wait for animation
            setTimeout(() => searchInputRef.current.focus(), 80);
        }
    }, [mobileSearchOpen]);

    // Load saved browse menu from server (falls back to categories if empty)
    useEffect(() => {
        const loadMenu = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API}/api/settings/menu`);
                if (!res.ok) return;
                const data = await res.json();
                if (data && Array.isArray(data.browseMenu)) setBrowseMenu(data.browseMenu);
            } catch (err) {
                console.warn('Could not load browse menu', err);
            }
        };
        loadMenu();
    }, []);

    // Fetch wishlist count if authenticated
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            import('../../redux/slices/wishlistSlice').then(module => {
                if (module.fetchWishlist) dispatch(module.fetchWishlist());
            }).catch(() => { });
        }
    }, [dispatch]);

    // When menuSource changes ensure activeMenuIndex resets to 0 (if available)
    useEffect(() => {
        if (menuSource && menuSource.length > 0) {
            setActiveMenuIndex(0);
        }
    }, [menuSource]);

    return (
        <header className="w-full bg-white z-50">
            {/* Top Navigation Bar */}
            <div className="bg-black text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                    <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <Link to="/about" className="hover:text-gray-200 transition duration-300 font-semibold whitespace-nowrap">
                                About Us
                            </Link>
                            <div className="hidden sm:block text-gray-300">|</div>
                            <Link to="/policies/shipping" className="hidden sm:block hover:text-gray-200 transition duration-300 font-semibold">
                                Shipping
                            </Link>
                            <div className="hidden sm:block text-gray-300">|</div>
                            <Link to="/policies/returns-refund" className="hidden md:block hover:text-gray-200 transition duration-300 font-semibold">
                                Returns Policy
                            </Link>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-5">
                            <a href="mailto:sales@wolfsuppliesltd.co.uk" className="hover:text-gray-200 transition duration-300 font-semibold whitespace-nowrap flex items-center gap-1.5">
                                <FaEnvelope /> sales@wolfsuppliesltd.co.uk
                            </a>
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <div className="relative group hidden sm:block">
                                        <button className="hover:text-gray-200 transition duration-300 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                            <FaUser /> {user?.name || 'User'} <FaChevronDown className="text-xs" />
                                        </button>
                                        <div className="absolute right-0 mt-1 w-48 bg-white text-gray-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 z-50">
                                            <div className="px-4 py-2.5 border-b border-gray-200 text-xs text-gray-600">
                                                {user?.email}
                                            </div>
                                            {isAdmin && (
                                                <>
                                                    <Link to="/admin/dashboard" className="px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center gap-2">
                                                        <FaUserShield className="text-gray-400" /> Admin Dashboard
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            toggleEditMode();
                                                            setMobileMenuOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center gap-2 text-gray-700 font-semibold"
                                                    >
                                                        <FaEdit /> Edit Page
                                                    </button>
                                                    <div className="border-b border-gray-200"></div>
                                                </>
                                            )}
                                            <Link to="/account" className="px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center gap-2">
                                                <FaCog /> Account Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2.5 hover:bg-gray-200 text-sm rounded-b-lg flex items-center gap-2 text-gray-700 font-semibold"
                                            >
                                                <FaSignOutAlt /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="hover:text-gray-200 transition duration-300 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                    <FaUser /> Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto sm:px-2 lg:px-2 pt-3">
                    <div className='px-2 py-4'>
                        <div className="flex items-center justify-between gap-3 md:gap-6">
                            {/* Logo & Menu */}
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={() => { setMobileSearchOpen(false); setMobileMenuOpen(!mobileMenuOpen); }}
                                    className="md:hidden text-2xl text-gray-700 hover:text-gray-400 transition duration-300"
                                    aria-label="Toggle menu"
                                >
                                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                                </button>



                                {/* Logo */}
                                <Link to="/" className="flex items-center gap-2 shrink-0">
                                    <img src={wolfLogo} alt="Wolf Supplies LTD" className="h-24 w-auto object-contain" />
                                </Link>
                            </div>

                            {/* Search Bar - Main */}
                            <div className="flex-1 mx-4 md:mx-6 hidden lg:block">
                                <div className="relative w-full flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Search for a product or brand"
                                        className="w-full h-12 md:h-14 px-6 rounded-l-full border border-gray-200 placeholder-gray-400 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200 bg-white"
                                    />
                                    <button className="h-12 md:h-14 bg-gradient-to-r from-gray-700 to-black hover:from-gray-900 hover:to-grey-700 text-white px-5 rounded-r-full flex items-center justify-center shadow-md -ml-1 transition duration-300">
                                        <FaSearch className="text-lg md:text-xl" />
                                    </button>
                                </div>
                            </div>


                            {/* Right Actions */}
                            <div className="flex items-center gap-3 md:gap-4 shrink-0">
                                {/* Mobile Search Toggle */}
                                <button
                                    onClick={() => { setMobileMenuOpen(false); setMobileSearchOpen(true); setMobileSearchQuery(''); }}
                                    className="md:hidden ml-2 text-lg text-gray-700 hover:text-gray-400 transition duration-300"
                                    aria-label="Open search"
                                >
                                    <FaSearch />
                                </button>

                                {/* Edit Page Button - Only for Admin/Editor
                                {isAdmin && (
                                    <button
                                        onClick={() => toggleEditMode()}
                                        className="text-gray-700 hover:text-gray-900 transition duration-300 p-2 hover:bg-gray-200 rounded-lg"
                                        title="Edit Page"
                                    >
                                        <FaEdit className="text-lg md:text-xl" />
                                    </button>
                                )} */}

                                {/* Wishlist */}
                                <Link to="/wishlist" className="relative text-gray-700 hover:text-gray-900 transition duration-300 p-2 hover:bg-gray-200 rounded-lg">
                                    <FaHeart className="text-lg md:text-xl" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Cart */}
                                <Link to="/cart" className="relative text-gray-700 hover:text-gray-400 transition duration-300 p-2 hover:bg-gray-100 rounded-lg">
                                    <FaShoppingCart className="text-lg md:text-xl" />
                                    {totalQuantity > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                            {totalQuantity}
                                        </span>
                                    )}
                                </Link>

                                {/* Phone - Hidden on Mobile */}
                                <div className="hidden md:flex items-center gap-2 bg-black text-white px-3 md:px-4 py-2 rounded-lg whitespace-nowrap">
                                    <FaPhone className="text-base md:text-lg" />
                                    <span className="font-bold text-sm md:text-base">
                                        <a href="tel:+447398998101">
                                            +447398998101
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Menu - Desktop Only */}
                    {!hideMenu && (
                        <div className="hidden md:block sticky top-0 w-full bg-white   z-30"
                            onMouseEnter={() => setBrowseOpen(true)}
                            onMouseLeave={() => setBrowseOpen(false)}
                        >
                            <div className="flex items-center gap-4">
                                {/* Shop By Category Button - Left */}
                                <button
                                    className="flex items-center gap-2 px-4 py-3 hover:text-gray-400 hover:bg-gray-50 rounded-lg transition duration-300 font-semibold text-gray-900 text-sm md:text-base whitespace-nowrap"
                                >
                                    <FaList className="text-base" /> Shop By Category
                                </button>
                                {/* Divider */}
                                <div className="h-6 w-px bg-gray-300"></div>

                                {/* Secondary Navigation - Top Menu - Right */}
                                <div className="flex items-center gap-1   ">
                                    <Link to="/" className="px-4 py-3 hover:text-gray-400 hover:bg-gray-50 rounded-lg transition duration-300 font-semibold text-gray-700 text-sm md:text-base">
                                        Home
                                    </Link>
                                    <Link to="/about" className="px-4 py-3 hover:text-gray-400 hover:bg-gray-50 rounded-lg transition duration-300 font-semibold text-gray-700 text-sm md:text-base">
                                        About Us
                                    </Link>
                                    <Link to="/products/" className="px-4 py-3 hover:text-gray-400 hover:bg-gray-50 rounded-lg transition duration-300 font-semibold text-gray-700 text-sm md:text-base">
                                        Shop
                                    </Link>
                                    <Link to="/contact" className="px-4 py-3 hover:text-gray-400 hover:bg-gray-50 rounded-lg transition duration-300 font-semibold text-gray-700 text-sm md:text-base">
                                        Contact Us
                                    </Link>
                                </div>
                            </div>
                            {/* Mega Menu */}
                            <div className={`absolute left-0 right-0 top-full transition duration-300 z-40 ${browseOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                                <div className="w-full bg-white shadow-2xl" onMouseLeave={() => setBrowseOpen(false)}>
                                    <div className="flex w-full h-auto">
                                        {/* Left Sidebar - Always Visible */}
                                        <div className="w-72 border-r-4 border-gray-400 max-h-full overflow-y-auto bg-white">
                                            {menuSource.map((item, idx) => (
                                                <button
                                                    key={item.id || `m_${idx}`}
                                                    onMouseEnter={() => setActiveMenuIndex(idx)}
                                                    onClick={() => navigate(item.url || item.link || '#')}
                                                    className={`block w-full text-left px-6 py-4 border-b border-gray-100 transition duration-150 font-semibold text-base ${activeMenuIndex === idx ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{item.label || item.name}</span>
                                                        <FaChevronDown className="text-xs text-gray-400" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Right Content - Shows on Hover */}
                                        {activeMenuIndex >= 0 && (
                                            <div className="flex-1 bg-white flex flex-col">
                                                {/* Top Category Tabs */}
                                                <div className="border-b border-gray-200 px-6 py-4 flex gap-6 overflow-x-auto">
                                                    {menuSource.map((item, idx) => (
                                                        <button
                                                            key={item.id || `tab_${idx}`}
                                                            onMouseEnter={() => setActiveMenuIndex(idx)}
                                                            className={`text-sm font-semibold transition duration-150 whitespace-nowrap pb-2 border-b-2 ${activeMenuIndex === idx ? 'text-gray-400 border-gray-400' : 'text-gray-600 border-transparent hover:text-gray-900'}`}
                                                        >
                                                            {item.label || item.name}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Subcategories Section */}
                                                <div className="flex-1 bg-white overflow-y-auto">
                                                    <div className="space-y-3">
                                                        {menuSource[activeMenuIndex]?.sub && menuSource[activeMenuIndex].sub.length > 0 ? (
                                                            menuSource[activeMenuIndex].sub.map((subItem) => (
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
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile Menu Slide-over */}
            <div
                ref={mobileMenuRef}
                aria-hidden={!mobileMenuOpen}
                className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible'}`}
            >
                {/* Backdrop */}
                <button
                    aria-label="Close menu"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Panel */}
                <nav className={`absolute left-0 top-0 bottom-0 w-full sm:w-4/5 bg-white shadow-2xl overflow-auto transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="text-3xl">🛍️</div>
                                <span className="text-lg font-bold text-gray-400">Wolf Supplies</span>
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-2xl p-2 rounded-md hover:bg-gray-100">
                                <FaTimes />
                            </button>
                        </div>

                        {/* (mobile search modal moved out of nav - kept placeholder here) */}

                        {/* duplicate inline search removed; mobile search uses modal */}

                        <div className="border-t border-gray-200 pt-4">
                            <Link
                                to="/categories"
                                className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:text-gray-700 rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FaList className="text-gray-400" /> Browse All Categories
                            </Link>

                            {menuSource.map((item) => (
                                <div key={item.id || item.label || item.name} className="mb-2">
                                    <Link
                                        to={item.url || item.link || '#'}
                                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-400 hover:bg-gray-50 rounded-lg text-sm font-semibold"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="text-lg"></span>
                                        {item.label || item.name}
                                    </Link>
                                    {item.sub && item.sub.length > 0 && (
                                        <div className="ml-6 space-y-1">
                                            {item.sub.slice(0, 3).map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    to={sub.link || '#'}
                                                    className="px-2 py-1.5 text-gray-600 hover:text-gray-400 text-xs hover:bg-gray-50 rounded flex items-center gap-1"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <span></span>
                                                    {sub.name}
                                                </Link>
                                            ))}
                                            {item.sub.length > 3 && (
                                                <Link
                                                    to={item.url || item.link || '#'}
                                                    className="block px-2 py-1.5 text-gray-700 text-xs font-semibold hover:bg-gray-100 rounded"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    See all ({item.sub.length})
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <Link
                                to="/"
                                className="block px-3 py-2 text-gray-700 hover:text-gray-400 hover:bg-gray-50 rounded-lg font-semibold text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                to="/products"
                                className="block px-3 py-2 text-gray-700 hover:text-gray-400 hover:bg-gray-50 rounded-lg font-semibold text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Shop
                            </Link>
                            <Link
                                to="/about"
                                className="block px-3 py-2 text-gray-700 hover:text-gray-400 hover:bg-gray-50 rounded-lg font-semibold text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About Us
                            </Link>
                            <Link
                                to="/contact"
                                className="block px-3 py-2 text-gray-700 hover:text-gray-400 hover:bg-gray-50 rounded-lg font-semibold text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contact Us
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin/dashboard"
                                    className="px-3 py-2 text-white bg-gray-700 hover:bg-black rounded-lg font-semibold text-sm flex items-center gap-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <FaUserShield /> Admin Panel
                                </Link>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-2 text-gray-700 font-semibold py-2 px-3 text-sm">
                                        <FaUser className="text-gray-400" />
                                        <span>{user?.name || 'User'}</span>
                                    </div>
                                    <p className="text-xs text-gray-900 px-3 py-1">{user?.email}</p>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-black hover:text-gray-700 hover:bg-gray-100 rounded-lg font-semibold text-sm mt-2 flex items-center gap-2"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 text-gray-700 hover:text-gray-400 hover:bg-gray-50 rounded-lg font-semibold text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-lg font-semibold transition duration-300 text-center text-sm mt-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            </div>
            {/* Mobile Search Modal (sibling of mobile menu so fixed positioning works) */}
            <div
                aria-hidden={!mobileSearchOpen}
                role="dialog"
                aria-modal={mobileSearchOpen}
                aria-labelledby="mobile-search-title"
                className={`fixed inset-0 md:hidden transition-all duration-200 ${mobileSearchOpen ? 'visible' : 'invisible'}`}
                style={{ zIndex: 9999 }}
            >
                {/* Backdrop */}
                <button
                    aria-label="Close search"
                    onClick={() => setMobileSearchOpen(false)}
                    className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity ${mobileSearchOpen ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Centered Panel */}
                <div className={`absolute left-1/2 top-20 transform -translate-x-1/2 w-11/12 max-w-xl bg-white rounded-lg shadow-2xl p-4 transition-all duration-200 ${mobileSearchOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-6'}`}>
                    <div className="flex items-start gap-2">
                        <form onSubmit={handleMobileSearchSubmit} className="flex-1 w-full">
                            <label id="mobile-search-title" className="sr-only">Search products</label>
                            <div className="flex items-center">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={mobileSearchQuery}
                                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                                    placeholder="Search products, brands..."
                                    className="w-full h-12 px-4 rounded-l-full border border-gray-200 placeholder-gray-400 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                                />

                                {mobileSearchQuery.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => { setMobileSearchQuery(''); if (searchInputRef.current) searchInputRef.current.focus(); }}
                                        aria-label="Clear search"
                                        className="-ml-10 z-10 text-gray-900 hover:text-gray-700 p-2"
                                    >
                                        ✕
                                    </button>
                                )}

                                <button type="submit" className="h-12 bg-black hover:bg-black text-white px-4 rounded-r-full ml-2 flex items-center justify-center">
                                    <FaSearch />
                                </button>
                            </div>
                        </form>
                        <button onClick={() => setMobileSearchOpen(false)} aria-label="Close search" className="text-2xl text-gray-600 p-2 hover:bg-gray-100 rounded-md">
                            <FaTimes />
                        </button>
                    </div>
                </div>
            </div>


        </header>
    );
};
export default Header;

