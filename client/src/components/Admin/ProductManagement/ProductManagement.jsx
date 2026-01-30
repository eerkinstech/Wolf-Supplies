import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSpinner,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
// AddProductForm component removed in favor of full-page editor
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../../redux/slices/productSlice';

const API = import.meta.env.VITE_API_URL || '';

const ProductManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products = [], loading } = useSelector((state) => state.product);
  const [localProducts, setLocalProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'draft'
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  // categories removed — no longer fetching category list here

  // Sync products from Redux
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    setLocalProducts(products || []);
  }, [products]);

  const activeCount = (products || []).filter(p => !p.isDraft).length;
  const draftCount = (products || []).filter(p => p.isDraft).length;
  const allCount = (products || []).length;

  const visibleProducts = (localProducts || []).filter(p => {
    const matchesTab = activeTab === 'all' ? true : (activeTab === 'active' ? !p.isDraft : Boolean(p.isDraft));
    const matchesSearch = searchQuery.trim() === '' ||
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // category display logic removed

  // Helper to get price display (with variant range if applicable)
  const getPriceDisplay = (product) => {
    if (!product.variantCombinations || product.variantCombinations.length === 0) {
      return `£${product.price?.toFixed(2) || '0.00'}`;
    }
    // Show price range from variants
    const variantPrices = product.variantCombinations.map(v => v.price || product.price);
    const minPrice = Math.min(...variantPrices);
    return `From £${minPrice.toFixed(2)}`;
  };

  // Helper to get total variant stock
  const getTotalVariantStock = (product) => {
    if (!product.variantCombinations || product.variantCombinations.length === 0) {
      return product.stock || 0;
    }
    return product.variantCombinations.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  // Helper to check if product has variants
  const hasVariants = (product) => {
    return product.variantCombinations && product.variantCombinations.length > 0;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API}/api/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to delete product');
        toast.success('Product deleted successfully');
        dispatch(fetchProducts());
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleToggleDraft = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const product = localProducts.find(p => p._id === id);
      if (!product) return;

      // Toggle draft status
      const newDraftStatus = !product.isDraft;
      const response = await fetch(`${API}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isDraft: newDraftStatus }),
      });

      if (!response.ok) throw new Error('Failed to update product');
      toast.success(newDraftStatus ? 'Moved to drafts' : 'Published successfully');
      dispatch(fetchProducts());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getTotalStock = (variants) => {
    return variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
  };

  const handleOpenModal = (product = null) => {
    // Navigate to the full-page editor for this product
    if (product && product._id) {
      navigate(`/admin/products/edit/${product._id}`);
    } else {
      navigate('/admin/products/add');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <button
          onClick={() => navigate('/admin/products/add')}
          className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-semibold transition duration-300"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Tabs: All / Active / Draft */}
      <div className="mb-6 flex items-center gap-4 justify-between flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All ({allCount})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'active' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'draft' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FaSearch className="text-sm" />
          </div>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              aria-label="Clear search"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {visibleProducts.some(p => p.selected) && (
        <div className="mb-6 bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {visibleProducts.filter(p => p.selected).length} product(s) selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const selectedIds = visibleProducts.filter(p => p.selected).map(p => p._id);
                selectedIds.forEach(id => handleToggleDraft(id));
              }}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition"
            >
              {activeTab === 'active' ? 'Move to Draft' : 'Publish'}
            </button>
            <button
              onClick={() => {
                const selectedIds = visibleProducts.filter(p => p.selected).map(p => p._id);
                if (window.confirm(`Delete ${selectedIds.length} product(s)? This cannot be undone.`)) {
                  selectedIds.forEach(id => handleDelete(id));
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setLocalProducts(localProducts.map(p => ({ ...p, selected: false })))}
              className="px-4 py-2 bg-gray-300 hover:bg-black text-gray-900 rounded-lg text-sm font-semibold transition"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="text-4xl text-gray-700 animate-spin" />
        </div>
      )}

      {/* Products Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={localProducts.length > 0 && localProducts.every(p => p.selected)}
                    onChange={(e) => setLocalProducts(localProducts.map(p => ({ ...p, selected: e.target.checked })))}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleProducts && visibleProducts.length > 0 ? (
                visibleProducts.map((product) => {
                  const rawImg = product.images && product.images.length > 0 ? product.images[0] : (product.image || '');
                  const imgSrc = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API}${rawImg}`) : null;
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition duration-300">
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={product.selected || false}
                          onChange={(e) => setLocalProducts(localProducts.map(p => p._id === product._id ? { ...p, selected: e.target.checked } : p))}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 w-96 text-sm text-gray-900 font-semibold">
                        <div className="flex items-center">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={product.name}
                              loading="lazy"
                              className="w-12 h-12 rounded-md object-cover mr-4"
                              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-md mr-4 flex items-center justify-center text-sm text-gray-400">🖼️</div>
                          )}
                          <div className=" w-64 flex items-center gap-2">
                            <span className="">{product.name}</span>
                            {product.isDraft && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                                Draft
                              </span>
                            )}
                            {!product.isDraft && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <span className="text-gray-700 font-bold">{getPriceDisplay(product)}</span>
                          {hasVariants(product) && (
                            <div className="text-xs text-gray-900 mt-1">
                              {product.variantCombinations.length} variants
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 text-sm py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getTotalVariantStock(product) > 0
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {getTotalVariantStock(product)}
                        </span>
                        {hasVariants(product) && (
                          <span className="text-xs ml-3 text-gray-900 mt-1">
                            Total stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center space-x-3">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="text-gray-700 hover:text-gray-800 transition"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-600">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
