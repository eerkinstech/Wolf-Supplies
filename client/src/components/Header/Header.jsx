import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { useElementorBuilder } from '../../context/ElementorBuilderContext';
import wolfLogo from '../../assets/Wolf Supplies LTD.png';
import {
    FaShoppingCart, FaUser, FaBars, FaTimes, FaSignOutAlt,
    FaChevronDown, FaSearch, FaPhone, FaHeart,
    FaList, FaUserShield, FaCog, FaEdit, FaEnvelope, FaMicrophone
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Header = ({ hideMenu = false }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');
    const [desktopSearchQuery, setDesktopSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isMobileListening, setIsMobileListening] = useState(false);
    const navigate = useNavigate();
    const { logout, isAuthenticated, user, isAdmin } = useAuth();
    const { toggleEditMode } = useElementorBuilder();
    const { totalQuantity } = useSelector((state) => state.cart);
    const { totalItems: wishlistCount } = useSelector((state) => state.wishlist);
    const { categories } = useSelector((state) => state.category);
    const dispatch = useDispatch();
    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);

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

    const handleDesktopSearchSubmit = (e) => {
        e?.preventDefault();
        const q = desktopSearchQuery?.trim();
        if (q) {
            navigate(`/products?search=${encodeURIComponent(q)}`);
        } else {
            navigate('/products');
        }
    };

    // Voice Search Handler
    const startVoiceSearch = (isMobile = false) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error('Voice search is not supported in your browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        if (isMobile) {
            setIsMobileListening(true);
        } else {
            setIsListening(true);
        }

        recognition.onstart = () => {
            console.log('Voice search started...');
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (isMobile) {
                setMobileSearchQuery(finalTranscript || interimTranscript);
            } else {
                setDesktopSearchQuery(finalTranscript || interimTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Voice search error:', event.error);
            if (event.error !== 'no-speech') {
                toast.error('Error in voice search. Please try again.');
            }
            if (isMobile) {
                setIsMobileListening(false);
            } else {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            if (isMobile) {
                setIsMobileListening(false);
            } else {
                setIsListening(false);
            }
        };

        recognition.start();
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
        <header className="w-full bg-[var(--color-bg-primary)] z-50">
            {/* Top Navigation Bar */}
            <div className="bg-[var(--color-accent-primary)] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                    <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <Link to="/about" className="hover:text-[var(--color-bg-section)] transition duration-300 font-semibold whitespace-nowrap">
                                About Us
                            </Link>
                            <div className="hidden sm:block text-white text-opacity-60">|</div>
                            <Link to="/policies/shipping" className="hidden sm:block hover:text-[var(--color-bg-section)] transition duration-300 font-semibold">
                                Shipping
                            </Link>
                            <div className="hidden sm:block text-white text-opacity-60">|</div>
                            <Link to="/policies/returns-refund" className="hidden md:block hover:text-[var(--color-bg-section)] transition duration-300 font-semibold">
                                Returns Policy
                            </Link>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-5">
                            <a href="mailto:sales@wolfsuppliesltd.co.uk" className="hover:text-[var(--color-bg-section)] transition duration-300 font-semibold whitespace-nowrap flex items-center gap-1.5">
                                <FaEnvelope /> sales@wolfsuppliesltd.co.uk
                            </a>
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <div className="relative group hidden sm:block">
                                        <button className="hover:text-[var(--color-bg-section)] transition duration-300 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                            <FaUser /> {user?.name || 'User'} <FaChevronDown className="text-xs" />
                                        </button>
                                        <div className="absolute right-0 mt-1 w-48 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 z-50">
                                            <div className="px-4 py-2.5 border-b border-[var(--color-border-light)] text-xs text-[var(--color-text-light)]">
                                                {user?.email}
                                            </div>
                                            {isAdmin && (
                                                <>
                                                    <Link to="/admin/dashboard" className="px-4 py-2.5 hover:bg-[var(--color-bg-section)] text-sm flex items-center gap-2">
                                                        <FaUserShield className="text-[var(--color-accent-primary)]" /> Admin Dashboard
                                                    </Link>
                                                    <div className="border-b border-[var(--color-border-light)]"></div>
                                                </>
                                            )}
                                            <Link to="/account" className="px-4 py-2.5 hover:bg-[var(--color-bg-section)] text-sm flex items-center gap-2">
                                                <FaCog /> Account Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-border-light)] text-sm rounded-b-lg flex items-center gap-2 text-[var(--color-text-primary)] font-semibold"
                                            >
                                                <FaSignOutAlt /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="hover:text-[var(--color-bg-section)] transition duration-300 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                    <FaUser /> Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)]">
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
                                <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                                    <img src={wolfLogo} alt="Wolf Supplies LTD" className="h-24 w-auto object-contain" />
                                </Link>
                            </div>

                            {/* Search Bar - Main */}
                            <div className="flex-1 mx-4 md:mx-6 hidden lg:block">
                                <form onSubmit={handleDesktopSearchSubmit} className="relative w-full flex items-center">
                                    <input
                                        ref={desktopSearchRef}
                                        type="text"
                                        value={desktopSearchQuery}
                                        onChange={(e) => setDesktopSearchQuery(e.target.value)}
                                        placeholder="Search for a product or brand"
                                        className="w-full h-12 md:h-14 px-6 rounded-l-full border border-[var(--color-border-light)] placeholder-[var(--color-text-muted)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] transition duration-200 bg-[var(--color-bg-primary)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => startVoiceSearch(false)}
                                        className={`h-12 md:h-14 px-4 flex items-center justify-center transition duration-300 ${isListening ? 'bg-[var(--color-error)] text-white' : 'bg-[var(--color-bg-section)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'}`}
                                        title="Voice Search"
                                        aria-label="Voice search"
                                    >
                                        <FaMicrophone className="text-lg" />
                                    </button>
                                    <button
                                        type="submit"
                                        className="h-12 md:h-14 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white px-5 rounded-r-full flex items-center justify-center shadow-md transition duration-300">
                                        <FaSearch className="text-lg md:text-xl" />
                                    </button>
                                </form>
                            </div>


                            {/* Right Actions */}
                            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
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
                                <Link to="/wishlist" className="relative text-[var(--color-text-light)] hidden lg:block hover:text-[var(--color-accent-primary)] transition duration-300 p-2 hover:bg-[var(--color-bg-section)] rounded-lg">
                                    <FaHeart className="text-lg  md:text-xl" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[var(--color-error)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Cart */}
                                <Link to="/cart" className="relative text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300 p-2 hover:bg-[var(--color-bg-section)] rounded-lg">
                                    <FaShoppingCart className="text-lg md:text-xl" />
                                    {totalQuantity > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[var(--color-error)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                            {totalQuantity}
                                        </span>
                                    )}
                                </Link>

                                {/* Phone - Hidden on Mobile */}
                                <div className="hidden md:flex items-center gap-2 bg-[var(--color-accent-primary)] text-white px-3 md:px-4 py-2 rounded-lg whitespace-nowrap">
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
                        <div className="hidden md:block sticky top-0 w-full bg-[var(--color-bg-primary)]   z-30"
                            onMouseEnter={() => setBrowseOpen(true)}
                            onMouseLeave={() => setBrowseOpen(false)}
                        >
                            <div className="flex items-center gap-4">
                                {/* Shop By Category Button - Left */}
                                <button
                                    className="flex items-center gap-2 px-4 py-3 hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg transition duration-300 font-semibold text-[var(--color-text-primary)] text-sm md:text-base whitespace-nowrap"
                                >
                                    <FaList className="text-base" /> Shop By Category
                                </button>
                                {/* Divider */}
                                <div className="h-6 w-px bg-[var(--color-border-light)]"></div>

                                {/* Secondary Navigation - Top Menu - Right */}
                                <div className="flex items-center gap-1   ">
                                    <Link to="/" className="px-4 py-3 hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg transition duration-300 font-semibold text-[var(--color-text-light)] text-sm md:text-base">
                                        Home
                                    </Link>
                                    <Link to="/about" className="px-4 py-3 hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg transition duration-300 font-semibold text-[var(--color-text-light)] text-sm md:text-base">
                                        About Us
                                    </Link>
                                    <Link to="/products/" className="px-4 py-3 hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg transition duration-300 font-semibold text-[var(--color-text-light)] text-sm md:text-base">
                                        Shop
                                    </Link>
                                    <Link to="/contact" className="px-4 py-3 hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg transition duration-300 font-semibold text-[var(--color-text-light)] text-sm md:text-base">
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
                                                <Link
                                                    key={item.id || `m_${idx}`}
                                                    to={item.url || item.link || '/'}
                                                    onMouseEnter={() => setActiveMenuIndex(idx)}
                                                    className={`block w-full text-left px-6 py-4 border-b border-[var(--color-border-light)] transition duration-150 font-semibold text-base ${activeMenuIndex === idx ? 'bg-[var(--color-bg-section)] text-[var(--color-text-primary)]' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-section)]'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{item.label || item.name}</span>
                                                        <FaChevronDown className="text-xs text-[var(--color-text-light)]" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Right Content - Shows on Hover */}
                                        {activeMenuIndex >= 0 && (
                                            <div className="flex-1 bg-[var(--color-bg-primary)] flex flex-col">
                                                {/* Top Category Tabs */}
                                                <div className="border-b border-[var(--color-border-light)] px-6 py-4 flex gap-6 overflow-x-auto">
                                                    {menuSource.map((item, idx) => (
                                                        <button
                                                            key={item.id || `tab_${idx}`}
                                                            onMouseEnter={() => setActiveMenuIndex(idx)}
                                                            className={`text-sm font-semibold transition duration-150 whitespace-nowrap pb-2 border-b-2 ${activeMenuIndex === idx ? 'text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]' : 'text-[var(--color-text-light)] border-transparent hover:text-[var(--color-text-primary)]'}`}
                                                        >
                                                            {item.label || item.name}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Subcategories Section */}
                                                <div className="flex-1 bg-[var(--color-bg-primary)] overflow-y-auto">
                                                    <div className="space-y-3">
                                                        {menuSource[activeMenuIndex]?.sub && menuSource[activeMenuIndex].sub.length > 0 ? (
                                                            menuSource[activeMenuIndex].sub.map((subItem) => (
                                                                <Link
                                                                    key={subItem.id}
                                                                    to={subItem.link || '#'}
                                                                    className="block px-4 py-2.5 mb-0 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:underline font-semibold text-base transition duration-150"
                                                                >
                                                                    {subItem.name}
                                                                </Link>
                                                            ))
                                                        ) : (
                                                            <div className="flex items-center justify-center py-12">
                                                                <p className="text-[var(--color-text-muted)] text-center">Menu item details</p>
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
                <nav className={`absolute left-0 top-0 bottom-0 w-full sm:w-4/5 bg-[var(--color-bg-primary)] shadow-2xl overflow-auto transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="text-3xl">🛍️</div>
                                <span className="text-lg font-bold text-[var(--color-accent-primary)]">Wolf Supplies</span>
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-2xl p-2 rounded-md hover:bg-[var(--color-bg-section)]">
                                <FaTimes />
                            </button>
                        </div>

                        {/* (mobile search modal moved out of nav - kept placeholder here) */}

                        {/* duplicate inline search removed; mobile search uses modal */}

                        <div className="border-t border-[var(--color-border-light)] pt-4">
                            <Link
                                to="/categories"
                                className="font-bold text-[var(--color-text-primary)] mb-3 text-sm flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-section)] hover:text-[var(--color-accent-primary)] rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FaList className="text-[var(--color-accent-primary)]" /> Browse All Categories
                            </Link>

                            {menuSource.map((item) => (
                                <div key={item.id || item.label || item.name} className="mb-2">
                                    <Link
                                        to={item.url || item.link || '#'}
                                        className="flex items-center gap-2 px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg text-sm font-semibold"
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
                                                    className="px-2 py-1.5 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] text-xs hover:bg-[var(--color-bg-section)] rounded flex items-center gap-1"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <span></span>
                                                    {sub.name}
                                                </Link>
                                            ))}
                                            {item.sub.length > 3 && (
                                                <Link
                                                    to={item.url || item.link || '#'}
                                                    className="block px-2 py-1.5 text-[var(--color-text-primary)] text-xs font-semibold hover:bg-[var(--color-bg-section)] rounded"
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

                        <div className="border-t border-[var(--color-border-light)] pt-4 space-y-2">
                            <Link
                                to="/"
                                className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                to="/products"
                                className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Shop
                            </Link>
                            <Link
                                to="/about"
                                className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About Us
                            </Link>
                            <Link
                                to="/contact"
                                className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contact Us
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin/dashboard"
                                    className="px-3 py-2 text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] rounded-lg font-semibold text-sm flex items-center gap-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <FaUserShield /> Admin Panel
                                </Link>
                            )}
                        </div>

                        <div className="border-t border-[var(--color-border-light)] pt-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-semibold py-2 px-3 text-sm">
                                        <FaUser className="text-[var(--color-accent-primary)]" />
                                        <span>{user?.name || 'User'}</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-light)] px-3 py-1">{user?.email}</p>
                                    <Link
                                        to="/account"
                                        className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm mt-2 flex items-center gap-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FaCog /> Account Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm mt-2 flex items-center gap-2"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white px-4 py-2 rounded-lg font-semibold transition duration-300 text-center text-sm mt-2"
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
                <div className={`absolute left-1/2 top-20 transform -translate-x-1/2 w-11/12 max-w-xl bg-[var(--color-bg-primary)] rounded-lg shadow-2xl p-4 transition-all duration-200 ${mobileSearchOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-6'}`}>
                    <div className="flex items-start gap-2">
                        <form onSubmit={handleMobileSearchSubmit} className="flex-1 w-full">
                            <label id="mobile-search-title" className="sr-only">Search products</label>
                            <div className="flex items-center gap-2">
                                <input
                                    ref={mobileSearchRef}
                                    type="text"
                                    value={mobileSearchQuery}
                                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                                    placeholder="Search products, brands..."
                                    className="flex-1 h-12 px-4 rounded-l-full border border-[var(--color-border-light)] placeholder-[var(--color-text-muted)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] text-sm"
                                />

                                {mobileSearchQuery.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => { setMobileSearchQuery(''); if (mobileSearchRef.current) mobileSearchRef.current.focus(); }}
                                        aria-label="Clear search"
                                        className="text-[var(--color-text-primary)] hover:text-[var(--color-text-light)] p-2 hidden sm:block"
                                    >
                                        ✕
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => startVoiceSearch(true)}
                                    className={`h-12 px-3 flex items-center justify-center transition duration-300 rounded-full ${isMobileListening ? 'bg-[var(--color-error)] text-white' : 'bg-[var(--color-bg-section)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'}`}
                                    title="Voice Search"
                                    aria-label="Voice search"
                                >
                                    <FaMicrophone />
                                </button>

                                <button type="submit" className="h-12 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white px-4 rounded-r-full flex items-center justify-center">
                                    <FaSearch />
                                </button>
                            </div>
                        </form>
                        <button onClick={() => setMobileSearchOpen(false)} aria-label="Close search" className="text-2xl text-[var(--color-text-light)] p-2 hover:bg-[var(--color-bg-section)] rounded-md">
                            <FaTimes />
                        </button>
                    </div>
                </div>
            </div>


        </header>
    );
};
export default Header;

