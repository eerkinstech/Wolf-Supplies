import React, { useState, useEffect } from 'react';
import {
    FaCheck,
    FaTimes,
    FaSpinner,
    FaStar,
    FaRegStar,
    FaStarHalfAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

const ReviewManagement = () => {
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'by-product' | 'filter-all' | 'filter-approved' | 'filter-pending'
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [approvedCount, setApprovedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [requireApproval, setRequireApproval] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'approved' | 'pending'
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');

    // Fetch global settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API}/api/settings`);
                if (!response.ok) throw new Error('Failed to fetch settings');
                const data = await response.json();
                setRequireApproval(data.requireReviewApproval !== false);
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, []);

    // Fetch all products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API}/api/products`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data.products || []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchProducts();
    }, []);

    // Fetch all reviews from all products
    useEffect(() => {
        const fetchAllReviews = async () => {
            setLoading(true);
            try {
                const allReviews = [];
                let approved = 0;
                let pending = 0;

                for (const product of products) {
                    if (product.reviews && product.reviews.length > 0) {
                        // Fetch full product data to get user details populated from backend
                        const productResponse = await fetch(`${API}/api/products/${product._id}`);
                        const fullProduct = await productResponse.json();

                        for (let idx = 0; idx < fullProduct.reviews.length; idx++) {
                            const review = fullProduct.reviews[idx];

                            // Push review and keep its index within the product's reviews array
                            allReviews.push({
                                ...review,
                                productId: product._id,
                                productName: product.name,
                                reviewIndex: idx,
                            });
                        }
                    }
                }

                // Ensure each review.user is populated with { email, name } — fallback to /api/users/:id if backend didn't populate
                const enriched = await Promise.all(
                    allReviews.map(async (r) => {
                        try {
                            if (r.user && typeof r.user !== 'object') {
                                const uRes = await fetch(`${API}/api/users/${r.user}`);
                                if (uRes.ok) {
                                    const uData = await uRes.json();
                                    // If backend returns user object inside { user } or raw, handle both
                                    r.user = uData.user || uData;
                                }
                            } else if (r.user && typeof r.user === 'object' && !r.user.email && r.user._id) {
                                const uRes = await fetch(`${API}/api/users/${r.user._id}`);
                                if (uRes.ok) {
                                    const uData = await uRes.json();
                                    r.user = uData.user || uData;
                                }
                            }
                        } catch (err) {
                            console.error('Failed to enrich user for review:', err);
                        }
                        return r;
                    })
                );

                // Recompute counts from enriched list
                const approvedCountCalc = enriched.reduce((sum, rv) => (rv.isApproved ? sum + 1 : sum), 0);
                const pendingCountCalc = enriched.reduce((sum, rv) => (!rv.isApproved ? sum + 1 : sum), 0);

                setReviews(enriched);
                setApprovedCount(approvedCountCalc);
                setPendingCount(pendingCountCalc);
                setTotalCount(enriched.length);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
                toast.error('Failed to fetch reviews');
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'all' && products.length > 0) {
            fetchAllReviews();
        }
    }, [activeTab, products]);

    // Fetch reviews for selected product
    useEffect(() => {
        const fetchProductReviews = async () => {
            if (!selectedProduct) {
                setReviews([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${API}/api/products/${selectedProduct}`);
                if (!response.ok) throw new Error('Failed to fetch product');
                const product = await response.json();

                if (product.reviews && product.reviews.length > 0) {
                    // attach product-level reviewIndex and ensure user is populated
                    const mapped = product.reviews.map((review, idx) => ({
                        ...review,
                        productId: product._id,
                        productName: product.name,
                        reviewIndex: idx,
                    }));

                    const enriched = await Promise.all(
                        mapped.map(async (r) => {
                            try {
                                if (r.user && typeof r.user !== 'object') {
                                    const uRes = await fetch(`${API}/api/users/${r.user}`);
                                    if (uRes.ok) {
                                        const uData = await uRes.json();
                                        r.user = uData.user || uData;
                                    }
                                } else if (r.user && typeof r.user === 'object' && !r.user.email && r.user._id) {
                                    const uRes = await fetch(`${API}/api/users/${r.user._id}`);
                                    if (uRes.ok) {
                                        const uData = await uRes.json();
                                        r.user = uData.user || uData;
                                    }
                                }
                            } catch (err) {
                                console.error('Failed to enrich user for review:', err);
                            }
                            return r;
                        })
                    );

                    setReviews(enriched);
                } else {
                    setReviews([]);
                }
            } catch (error) {
                toast.error('Failed to fetch product reviews');
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'by-product' && selectedProduct) {
            fetchProductReviews();
        }
    }, [activeTab, selectedProduct]);

    // Approve/disapprove review
    const toggleApproval = async (productId, reviewIndex) => {
        try {
            // Find local aggregated index for this product-level review index
            const localIdx = reviews.findIndex(r => r.productId === productId && r.reviewIndex === reviewIndex);
            const currentIsApproved = localIdx !== -1 ? !!reviews[localIdx].isApproved : null;
            const isApprovedToSet = currentIsApproved === null ? true : !currentIsApproved;

            const response = await fetch(`${API}/api/products/${productId}/reviews/${reviewIndex}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isApproved: isApprovedToSet,
                }),
            });

            if (!response.ok) throw new Error('Failed to update review');

            // Update reviews locally using the previously computed localIdx
            if (localIdx !== -1) {
                const updatedReviews = [...reviews];
                updatedReviews[localIdx].isApproved = !!isApprovedToSet;
                setReviews(updatedReviews);

                toast.success(updatedReviews[localIdx].isApproved ? 'Review approved' : 'Review disapproved');

                // Refresh counts
                if (activeTab === 'all') {
                    setApprovedCount(
                        updatedReviews.reduce((sum, r) => (r.isApproved ? sum + 1 : sum), 0)
                    );
                    setPendingCount(
                        updatedReviews.reduce((sum, r) => (!r.isApproved ? sum + 1 : sum), 0)
                    );
                }
            } else {
                // If we couldn't find the review in local list, refresh from server
                if (activeTab === 'all') {
                    // trigger a refetch by toggling activeTab briefly
                    setActiveTab('');
                    setTimeout(() => setActiveTab('all'), 50);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Delete review
    const deleteReview = async (productId, reviewIndex) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await fetch(`${API}/api/products/${productId}/reviews/${reviewIndex}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete review');

            // Remove the deleted review from local state by matching productId + reviewIndex
            const updatedReviews = reviews.filter(r => !(r.productId === productId && r.reviewIndex === reviewIndex));
            setReviews(updatedReviews);
            toast.success('Review deleted');

            // Refresh counts
            if (activeTab === 'all') {
                setApprovedCount(
                    updatedReviews.reduce((sum, r) => (r.isApproved ? sum + 1 : sum), 0)
                );
                setPendingCount(
                    updatedReviews.reduce((sum, r) => (!r.isApproved ? sum + 1 : sum), 0)
                );
                setTotalCount(updatedReviews.length);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Update global settings
    const toggleRequireApproval = async () => {
        setSavingSettings(true);
        try {
            const response = await fetch(`${API}/api/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    requireReviewApproval: !requireApproval,
                }),
            });

            if (!response.ok) throw new Error('Failed to update settings');
            setRequireApproval(!requireApproval);
            toast.success(
                !requireApproval
                    ? 'Reviews will now require approval before showing'
                    : 'Reviews will now show immediately without approval'
            );
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSavingSettings(false);
        }
    };

    // Render stars
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else if (rating >= i - 0.5) {
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-yellow-400" />);
            }
        }
        return stars;
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Review Management</h1>

                {/* Global Settings */}
                <div className="rounded-lg shadow-lg p-6 mb-8" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-accent-primary)', borderLeftWidth: '4px' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Review Approval Setting</h2>
                            <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                                {requireApproval
                                    ? 'Reviews require admin approval before appearing on product pages'
                                    : 'Reviews appear immediately without requiring approval'}
                            </p>
                        </div>
                        <button
                            onClick={toggleRequireApproval}
                            disabled={savingSettings}
                            className={`px-6 py-3 rounded-lg font-semibold transition ${savingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ backgroundColor: requireApproval ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)', color: 'white' }}
                            onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = 'var(--color-accent-light)')}
                            onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = requireApproval ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)')}
                        >
                            {savingSettings ? 'Saving...' : requireApproval ? 'Approval Required' : 'No Approval Required'}
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                {activeTab === 'all' && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-accent-primary)', borderLeftWidth: '4px' }}>
                            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-light)' }}>Total Reviews</p>
                            <p className="text-3xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>{totalCount}</p>
                        </div>
                        <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-accent-light)', borderLeftWidth: '4px' }}>
                            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-light)' }}>Verified</p>
                            <p className="text-3xl font-bold" style={{ color: 'var(--color-accent-light)' }}>{approvedCount}</p>
                        </div>
                        <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-text-secondary)', borderLeftWidth: '4px' }}>
                            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-light)' }}>Pending</p>
                            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>{pendingCount}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="mb-8 flex gap-4">
                <button
                    onClick={() => {
                        setActiveTab('all');
                        setSelectedProduct(null);
                        setFilterTab('all');
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition`}
                    style={{ backgroundColor: activeTab === 'all' ? 'var(--color-accent-primary)' : 'var(--color-bg-section)', color: activeTab === 'all' ? 'white' : 'var(--color-text-primary)' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = activeTab === 'all' ? 'var(--color-accent-light)' : 'var(--color-border-light)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = activeTab === 'all' ? 'var(--color-accent-primary)' : 'var(--color-bg-section)'}
                >
                    All Reviews
                </button>
                <button
                    onClick={() => setActiveTab('by-product')}
                    className={`px-6 py-3 rounded-lg font-semibold transition`}
                    style={{ backgroundColor: activeTab === 'by-product' ? 'var(--color-accent-primary)' : 'var(--color-bg-section)', color: activeTab === 'by-product' ? 'white' : 'var(--color-text-primary)' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = activeTab === 'by-product' ? 'var(--color-accent-light)' : 'var(--color-border-light)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = activeTab === 'by-product' ? 'var(--color-accent-primary)' : 'var(--color-bg-section)'}
                >
                    Reviews by Product
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reviews by name, email, product or text..."
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition"
                    style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light)'}
                />
            </div>

            {/* Filter Tabs (shown only when viewing All Reviews) */}
            {activeTab === 'all' && (
                <div className="mb-8 flex gap-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                    <button
                        onClick={() => setFilterTab('all')}
                        className={`px-4 py-3 font-semibold border-b-2 transition`}
                        style={{ borderColor: filterTab === 'all' ? 'var(--color-accent-primary)' : 'transparent', color: filterTab === 'all' ? 'var(--color-accent-primary)' : 'var(--color-text-light)' }}
                    >
                        All ({totalCount})
                    </button>
                    <button
                        onClick={() => setFilterTab('approved')}
                        className={`px-4 py-3 font-semibold border-b-2 transition`}
                        style={{ borderColor: filterTab === 'approved' ? 'var(--color-accent-light)' : 'transparent', color: filterTab === 'approved' ? 'var(--color-accent-light)' : 'var(--color-text-light)' }}
                    >
                        Verified ({approvedCount})
                    </button>
                    <button
                        onClick={() => setFilterTab('pending')}
                        className={`px-4 py-3 font-semibold border-b-2 transition`}
                        style={{ borderColor: filterTab === 'pending' ? 'var(--color-text-secondary)' : 'transparent', color: filterTab === 'pending' ? 'var(--color-text-secondary)' : 'var(--color-text-light)' }}
                    >
                        Pending ({pendingCount})
                    </button>
                </div>
            )}

            {/* Product Selector (for by-product tab) */}
            {activeTab === 'by-product' && (
                <div className="mb-8">
                    <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                        Select Product
                    </label>
                    <select
                        value={selectedProduct || ''}
                        onChange={(e) => setSelectedProduct(e.target.value || null)}
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition"
                        style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light)'}
                    >
                        <option value="">-- Choose a product --</option>
                        {products.map((product) => (
                            <option key={product._id} value={product._id}>
                                {product.name} ({product.reviews?.length || 0} reviews)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <FaSpinner className="text-4xl animate-spin" style={{ color: 'var(--color-accent-primary)' }} />
                </div>
            )}

            {/* Reviews List */}
            {!loading && (
                <div className="space-y-6">
                    {(() => {
                        // Filter reviews based on active filter tab and search term
                        let filteredReviews = reviews;
                        if (activeTab === 'all') {
                            if (filterTab === 'approved') {
                                filteredReviews = reviews.filter(r => r.isApproved);
                            } else if (filterTab === 'pending') {
                                filteredReviews = reviews.filter(r => !r.isApproved);
                            }
                        }

                        // Apply search filter (match name, email, productName, comment)
                        if (searchTerm && searchTerm.trim() !== '') {
                            const q = searchTerm.trim().toLowerCase();
                            filteredReviews = filteredReviews.filter(r => {
                                const email = (r.email || (r.user && (typeof r.user === 'object' ? r.user.email : r.user)) || '').toString().toLowerCase();
                                const name = (r.name || (r.user && (typeof r.user === 'object' ? r.user.name : '')) || '').toString().toLowerCase();
                                const productName = (r.productName || '').toString().toLowerCase();
                                const comment = (r.comment || '').toString().toLowerCase();
                                return email.includes(q) || name.includes(q) || productName.includes(q) || comment.includes(q);
                            });
                        }

                        return filteredReviews.length > 0 ? (
                            filteredReviews.map((review, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-lg shadow-lg p-6`}
                                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: review.isApproved ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', borderLeftWidth: '4px' }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{review.name}</h3>
                                                {review.isApproved && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-accent-primary)' }}>
                                                        ✓ Verified
                                                    </span>
                                                )}
                                                {!review.isApproved && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-secondary)' }}>
                                                        ⏳ Pending
                                                    </span>
                                                )}
                                            </div>
                                            {activeTab === 'all' && (
                                                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-light)' }}>
                                                    Product: <span style={{ color: 'var(--color-accent-primary)' }}>{review.productName}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <div className="flex gap-1 mb-2 justify-end">
                                                {renderStars(review.rating).map((star, i) => (
                                                    <span key={i} className="text-lg">
                                                        {star}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                                                {new Date(review.createdAt || review.updatedAt || Date.now()).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <p className="mb-6 leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{review.comment}</p>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4" style={{ borderColor: 'var(--color-border-light)', borderTopWidth: '1px' }}>
                                        <div className="text-sm">
                                            <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Email: </span>
                                            <span style={{ color: 'var(--color-text-primary)' }}>{review.email || (review.user && typeof review.user === 'object' ? review.user.email : review.user) || 'Guest'}</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => toggleApproval(review.productId, review.reviewIndex)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${review.isApproved
                                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {review.isApproved ? (
                                                    <>
                                                        <FaTimes /> Unverify
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaCheck /> Verify
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => deleteReview(review.productId, review.reviewIndex)}
                                                className="px-4 py-2 rounded-lg font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                                <div className="text-5xl mb-4">📋</div>
                                <p className="text-xl text-gray-600 font-semibold mb-2">No reviews found</p>
                                <p className="text-gray-900">
                                    {activeTab === 'by-product' && selectedProduct
                                        ? 'This product has no reviews yet'
                                        : filterTab === 'approved'
                                            ? 'No approved reviews yet'
                                            : filterTab === 'pending'
                                                ? 'No pending reviews'
                                                : 'No reviews to manage'}
                                </p>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default ReviewManagement;
