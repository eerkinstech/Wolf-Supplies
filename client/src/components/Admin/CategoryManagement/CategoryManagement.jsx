import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaCloudUploadAlt, FaTimes, FaBox, FaLayerGroup, FaSpinner } from 'react-icons/fa';
import CategoryProducts from './CategoryProducts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../../redux/slices/categorySlice';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Extract CategoryModal as separate component to prevent re-render on formData change
const CategoryModal = ({ showModal, onClose, title, formData, setFormData, handleAddCategory, handleImageUpload, editingCategory }) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-900 hover:text-gray-700 transition duration-300 p-1 hover:bg-gray-200 rounded-lg"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Category Image</label>
                        <label className="flex items-center justify-center px-4 py-4 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer hover:border-gray-800 hover:bg-indigo-50 transition duration-300 bg-gray-50">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-600">
                                <FaCloudUploadAlt className="text-3xl text-gray-700" />
                                <span className="text-sm font-semibold">Click to upload</span>
                                <span className="text-xs text-gray-900">PNG, JPG up to 10MB</span>
                            </div>
                        </label>
                        {formData.image && (
                            <div className="mt-4">
                                <p className="text-xs text-gray-600 font-semibold mb-2">Current Image Preview:</p>
                                <div className="relative inline-block">
                                    <img
                                        src={formData.image.startsWith('http') ? formData.image : `${API}${formData.image}`}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-300 shadow-md"
                                        onError={(e) => {
                                            console.error('Image failed to load:', formData.image);
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23999%22%3EFailed to load%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: null })}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-300 shadow-lg"
                                        title="Remove image"
                                    >
                                        <FaTimes className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition duration-300"
                            placeholder="Enter category name"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition duration-300"
                            placeholder="Enter category description"
                        />
                    </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={() => {
                            onClose();
                            setFormData({ name: '', description: '', image: null, productCount: 0 });
                        }}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddCategory}
                        className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black transition duration-300 flex items-center justify-center gap-2 shadow-md"
                    >
                        <FaPlus /> {editingCategory ? 'Update' : 'Add'} Category
                    </button>
                </div>
            </div>
        </div>
    );
};

// Extract SubcategoryModal as separate component
const SubcategoryModal = ({ showModal, onClose, title, formData, setFormData, handleAddSubcategory, handleImageUpload, editingCategory }) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-grey-100">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-900 hover:text-gray-700 transition duration-300 p-1 hover:bg-gray-200 rounded-lg"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Subcategory Image</label>
                        <label className="flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition duration-300 bg-gray-50">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-600">
                                <FaCloudUploadAlt className="text-3xl text-gray-400" />
                                <span className="text-sm font-semibold">Click to upload</span>
                                <span className="text-xs text-gray-900">PNG, JPG up to 10MB</span>
                            </div>
                        </label>
                        {formData.image && (
                            <div className="mt-4">
                                <p className="text-xs text-gray-600 font-semibold mb-2">Current Image Preview:</p>
                                <div className="relative inline-block">
                                    <img
                                        src={formData.image.startsWith('http') ? formData.image : `${API}${formData.image}`}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                                        onError={(e) => {
                                            console.error('Image failed to load:', formData.image);
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23999%22%3EFailed to load%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: null })}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-300 shadow-lg"
                                        title="Remove image"
                                    >
                                        <FaTimes className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subcategory Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition duration-300"
                            placeholder="Enter subcategory name"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition duration-300"
                            placeholder="Enter subcategory description"
                        />
                    </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={() => {
                            onClose();
                            setFormData({ name: '', description: '', image: null, productCount: 0 });
                        }}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddSubcategory}
                        className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-black transition duration-300 flex items-center justify-center gap-2 shadow-md"
                    >
                        <FaPlus /> {editingCategory ? 'Update' : 'Add'} Subcategory
                    </button>
                </div>
            </div>
        </div>
    );
};

// Recursive component for rendering nested categories at any depth
const NestedCategoryRows = ({
    category,
    depth = 0,
    onToggle,
    onEdit,
    onDelete,
    onAddSubcategory,
    onEditMain,
    parentId = null
}) => {
    const indent = depth * 32;
    const colorSchemes = [
        { bg: 'bg-indigo-50', border: 'border-indigo-400', text: 'text-gray-700', gradient: 'from-indigo-400 to-indigo-600' },
        { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-400', gradient: 'from-gray-700 to-black-400' },
        { bg: 'bg-gray-100', border: 'border-blue-400', text: 'text-gray-700', gradient: 'from-blue-400 to-blue-600' },
        { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-600', gradient: 'from-purple-400 to-purple-600' },
        { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-600', gradient: 'from-pink-400 to-pink-600' },
        { bg: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-600', gradient: 'from-cyan-400 to-cyan-600' },
    ];
    const colors = colorSchemes[depth % colorSchemes.length];

    // Toggle function for this specific category
    const toggleThis = () => {
        onToggle(category._id);
    };

    // Use different edit handler based on depth
    const handleEdit = () => {
        if (depth === 0 && onEditMain) {
            // Main category - use main category editor
            onEditMain(category);
        } else {
            // Subcategory - use subcategory editor
            onEdit(parentId, category);
        }
    };

    return (
        <>
            <tr className={`hover:${colors.bg} transition duration-300 ${depth > 0 ? `${colors.bg} border-l-4 ${colors.border}` : 'bg-white'}`}>
                <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3" style={{ marginLeft: `${indent}px` }}>
                        {/* Always show chevron for expansion */}
                        <button
                            onClick={toggleThis}
                            className={`${colors.text} hover:opacity-100 opacity-75 p-1 transition duration-300`}
                            title={category.expandedSubcategories ? 'Collapse' : 'Expand'}
                        >
                            {category.expandedSubcategories ? <FaChevronDown /> : <FaChevronRight />}
                        </button>
                        {category.image ? (
                            <img
                                src={category.image.startsWith('http') ? category.image : `${API}${category.image}`}
                                alt={category.name}
                                className="w-10 h-10 object-cover rounded-lg border-2 border-gray-300"
                                onError={(e) => {
                                    console.error('Category image failed to load:', category.image);
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                                {category.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                {depth === 0 && <FaLayerGroup className={`${colors.text} text-xs`} />}
                                {depth > 0 && <FaBox className={`${colors.text} text-xs`} />}
                                {category.name}
                            </h4>
                            {category.description && (
                                <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 ${colors.bg} ${colors.text} rounded-full font-semibold text-sm`}>
                        {category.productCount || 0}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="bg-gray-800 hover:bg-black text-white p-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                            title="Edit"
                        >
                            <FaEdit className="text-sm" />
                        </button>
                        <button
                            onClick={() => onDelete(parentId, category._id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                            title="Delete"
                        >
                            <FaTrash className="text-sm" />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Render subcategories recursively */}
            {category.expandedSubcategories && category.subcategories && category.subcategories.length > 0 && (
                category.subcategories.map((subcategory) => (
                    <NestedCategoryRows
                        key={subcategory._id}
                        category={subcategory}
                        depth={depth + 1}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddSubcategory={onAddSubcategory}
                        onEditMain={onEditMain}
                        parentId={category._id}
                    />
                ))
            )}

            {/* Add subcategory button */}
            {category.expandedSubcategories && (
                <tr className={`${colors.bg} border-l-4 ${colors.border}`}>
                    <td colSpan="4" className="px-6 py-4">
                        <button
                            onClick={() => onAddSubcategory(category._id)}
                            className={`w-full text-left px-4 py-2 ${colors.bg} hover:opacity-80 ${colors.text} rounded-lg font-semibold transition duration-300 flex items-center gap-2 justify-center`}
                            style={{ marginLeft: `${indent}px` }}
                        >
                            <FaPlus /> Add Sub-Category to {category.name}
                        </button>
                    </td>
                </tr>
            )}
        </>
    );
};

const CategoryManagement = () => {
    const dispatch = useDispatch();
    const { categories: reduxCategories = [], loading } = useSelector((state) => state.category);
    const [categories, setCategories] = useState([]);

    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showCategoryProducts, setShowCategoryProducts] = useState(false);
    const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState(null);
    const [categoryToExpand, setCategoryToExpand] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name-asc'); // name-asc, name-desc, date-newest, date-oldest, products-max, products-min
    const [viewMode, setViewMode] = useState('menu'); // 'plain' or 'menu'

    // Sync categories from Redux
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        const initializeExpandedState = (items) => {
            return (items || []).map(item => ({
                ...item,
                expandedSubcategories: categoryToExpand === item._id ? true : false,
                subcategories: initializeExpandedState(item.subcategories),
            }));
        };

        setCategories(reduxCategories.map(cat => ({
            ...cat,
            expandedSubcategories: categoryToExpand === cat._id ? true : false,
            subcategories: initializeExpandedState(cat.subcategories),
        })) || []);
    }, [reduxCategories, categoryToExpand]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
    });

    // ==================== Category Management ====================
    const handleAddCategory = async () => {
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: formData.name,
                description: formData.description,
                slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
                image: formData.image,
            };

            if (editingCategory) {
                // Update category
                const response = await fetch(`${API}/api/categories/${editingCategory._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) throw new Error('Failed to update category');
                toast.success('Category updated successfully');
            } else {
                // Add new category
                const response = await fetch(`${API}/api/categories`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) throw new Error('Failed to create category');
                toast.success('Category created successfully');
            }
            setEditingCategory(null);
            dispatch(fetchCategories());
        } catch (error) {
            toast.error(error.message);
        }

        setFormData({ name: '', description: '', image: null });
        setShowAddCategoryModal(false);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            image: category.image,
        });
        setShowAddCategoryModal(true);
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API}/api/categories/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to delete category');
                toast.success('Category deleted successfully');
                dispatch(fetchCategories());
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const toggleSubcategories = (categoryId) => {
        setCategories(
            categories.map((cat) =>
                cat._id === categoryId
                    ? { ...cat, expandedSubcategories: !cat.expandedSubcategories }
                    : cat
            )
        );
    };

    const toggleSubSubcategories = (categoryId, subcategoryId) => {
        setCategories(
            categories.map((cat) =>
                cat._id === categoryId
                    ? {
                        ...cat,
                        subcategories: cat.subcategories.map((sub) =>
                            sub._id === subcategoryId
                                ? { ...sub, expandedSubcategories: !sub.expandedSubcategories }
                                : sub
                        ),
                    }
                    : cat
            )
        );
    };

    // Toggle subcategories at any depth recursively
    const toggleSubcategoryAtDepth = (targetId, currentCategories) => {
        return currentCategories.map((item) => {
            if (item._id === targetId) {
                return { ...item, expandedSubcategories: !item.expandedSubcategories };
            }
            if (item.subcategories && item.subcategories.length > 0) {
                return {
                    ...item,
                    subcategories: toggleSubcategoryAtDepth(targetId, item.subcategories),
                };
            }
            return item;
        });
    };

    // ==================== Subcategory Management ====================
    const handleAddSubcategory = async () => {
        if (!formData.name.trim()) {
            toast.error('Subcategory name is required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const endpoint = editingCategory
                ? `${API}/api/categories/${editingCategory._id}`
                : `${API}/api/categories`;

            const method = editingCategory ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                description: formData.description,
                slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
                image: formData.image,
                ...(editingCategory ? {} : { parent: selectedCategoryId }),
            };

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save subcategory');
            }

            toast.success(editingCategory ? 'Subcategory updated successfully' : 'Subcategory added successfully');
            setFormData({ name: '', description: '', image: null });
            setShowAddSubcategoryModal(false);
            setEditingCategory(null);

            // Set category to expand after fetching
            if (selectedCategoryId) {
                setCategoryToExpand(selectedCategoryId);
            }

            // Refresh categories from backend with a small delay to ensure server has updated
            setTimeout(() => {
                dispatch(fetchCategories());
            }, 300);
        } catch (error) {
            toast.error(error.message || 'Error saving subcategory');
        }
    };

    const handleEditSubcategory = (categoryId, subcategory) => {
        setSelectedCategoryId(categoryId);
        setEditingCategory(subcategory);
        setFormData({
            name: subcategory.name,
            description: subcategory.description,
            image: subcategory.image,
            productCount: subcategory.productCount,
        });
        setShowAddSubcategoryModal(true);
    };

    const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
        if (window.confirm('Are you sure you want to delete this subcategory?')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Authentication token not found');
                    return;
                }

                const response = await fetch(`${API}/api/categories/${subcategoryId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete subcategory');
                }

                toast.success('Subcategory deleted successfully');

                // Refresh categories from backend
                dispatch(fetchCategories());
            } catch (error) {
                toast.error(error.message || 'Error deleting subcategory');
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            try {
                const formDataToSend = new FormData();
                formDataToSend.append('image', file);

                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await axios.post(`${API}/api/upload`, formDataToSend, {
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Store the image URL from server - use callback to ensure state updates correctly
                setFormData((prevFormData) => {
                    const updatedFormData = { ...prevFormData, image: res.data.url };
                    return updatedFormData;
                });
                toast.success('Image uploaded successfully');
            } catch (err) {
                console.error('Image upload failed:', err);
                toast.error('Failed to upload image. Please try again.');
            }
        }
    };

    const openAddCategoryModal = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '', image: null });
        setShowAddCategoryModal(true);
    };

    const openAddSubcategoryModal = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setEditingCategory(null);
        setFormData({ name: '', description: '', image: null });
        setShowAddSubcategoryModal(true);
    };

    const handleViewCategoryProducts = (category) => {
        setSelectedCategoryForProducts(category);
        setShowCategoryProducts(true);
    };

    // Helper function to recursively toggle any category at any depth
    const recursiveToggle = (targetId, catArray) => {
        return catArray.map(cat => {
            if (cat._id === targetId) {
                return { ...cat, expandedSubcategories: !cat.expandedSubcategories };
            }
            if (cat.subcategories && cat.subcategories.length > 0) {
                return {
                    ...cat,
                    subcategories: recursiveToggle(targetId, cat.subcategories)
                };
            }
            return cat;
        });
    };

    // Count total categories (main + all subcategories recursively)
    const countTotalCategories = (catArray) => {
        return catArray.reduce((total, cat) => {
            let count = 1; // Count this category
            if (cat.subcategories && cat.subcategories.length > 0) {
                count += countTotalCategories(cat.subcategories);
            }
            return total + count;
        }, 0);
    };

    // Flatten all categories (main + all subcategories) for searching
    const flattenCategories = (catArray) => {
        let flattened = [];
        catArray.forEach(cat => {
            flattened.push(cat);
            if (cat.subcategories && cat.subcategories.length > 0) {
                flattened = flattened.concat(flattenCategories(cat.subcategories));
            }
        });
        return flattened;
    };

    // Filter and sort categories
    const getFilteredAndSortedCategories = () => {
        const allCategories = categories;
        let filtered = allCategories;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = allCategories.filter(cat =>
                cat.name.toLowerCase().includes(query) ||
                (cat.description && cat.description.toLowerCase().includes(query))
            );
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'date-newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'date-oldest':
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                case 'products-max':
                    return (b.productCount || 0) - (a.productCount || 0);
                case 'products-min':
                    return (a.productCount || 0) - (b.productCount || 0);
                default:
                    return 0;
            }
        });

        return sorted;
    };

    // Get all flattened categories for plain view (main + all subcategories)
    const getFlattenedCategoriesForPlainView = () => {
        const allCategories = categories;
        let filtered = allCategories;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const flattened = flattenCategories(allCategories);
            filtered = flattened.filter(cat =>
                cat.name.toLowerCase().includes(query) ||
                (cat.description && cat.description.toLowerCase().includes(query))
            );
        } else {
            filtered = flattenCategories(allCategories);
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'date-newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'date-oldest':
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                case 'products-max':
                    return (b.productCount || 0) - (a.productCount || 0);
                case 'products-min':
                    return (a.productCount || 0) - (b.productCount || 0);
                default:
                    return 0;
            }
        });

        return sorted;
    };

    // Helper to get depth of a category (how many levels deep it is)
    const getCategoryDepth = (catId, catArray, currentDepth = 0) => {
        for (let cat of catArray) {
            if (cat._id === catId) return currentDepth;
            if (cat.subcategories && cat.subcategories.length > 0) {
                const depth = getCategoryDepth(catId, cat.subcategories, currentDepth + 1);
                if (depth !== -1) return depth;
            }
        }
        return -1;
    };

    const totalCategoriesCount = countTotalCategories(categories);
    const filteredCategories = getFilteredAndSortedCategories();
    const flattenedCategories = getFlattenedCategoriesForPlainView();

    return (
            <>
            <div className="flex-1  overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Categories & Subcategories</h1>
                            <p className="text-gray-600 mt-2">Manage your product categories with subcategories and products</p>
                        </div>
                        <button
                            onClick={openAddCategoryModal}
                            className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center gap-2 shadow-lg"
                        >
                            <FaPlus /> Add Category
                        </button>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm font-semibold uppercase">Total Categories</p>
                                    <p className="text-xs text-indigo-200 mt-1">(Main + All Sub)</p>
                                </div>
                                <p className="text-3xl font-bold">{totalCategoriesCount}</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-500 to-black-400 rounded-xl shadow-lg p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-100 text-sm font-semibold uppercase">Displaying</p>
                                    <p className="text-xs text-gray-200 mt-1">Filtered Results</p>
                                </div>
                                <p className="text-3xl font-bold">{filteredCategories.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Sort Controls */}
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold min-w-[200px]"
                        >
                            <option value="name-asc">Sort: Name (A to Z)</option>
                            <option value="name-desc">Sort: Name (Z to A)</option>
                            <option value="date-newest">Sort: Date (Newest)</option>
                            <option value="date-oldest">Sort: Date (Oldest)</option>
                            <option value="products-max">Sort: Products (Maximum)</option>
                            <option value="products-min">Sort: Products (Minimum)</option>
                        </select>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-black transition-colors font-semibold"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setViewMode('plain')}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition duration-300 ${viewMode === 'plain'
                                ? 'bg-gray-800 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Plain Category
                        </button>
                        <button
                            onClick={() => setViewMode('menu')}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition duration-300 ${viewMode === 'menu'
                                ? 'bg-gray-800 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Menu Category
                        </button>
                    </div>

                    {/* Main Table Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">All Categories</h2>
                                <span className="text-sm text-gray-600 font-semibold">{categories.length} categories</span>
                            </div>
                        </div>

                        {/* Categories List */}
                        <div className="overflow-x-auto">
                            {(viewMode === 'plain' ? flattenedCategories : filteredCategories).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-6">
                                    <FaLayerGroup className="text-6xl text-gray-400 mb-4" />
                                    <p className="text-gray-900 text-lg mb-4">
                                        {searchQuery ? 'No categories match your search' : 'No categories yet'}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold transition duration-300 inline-flex items-center gap-2 shadow-lg"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                    {!searchQuery && (
                                        <button
                                            onClick={openAddCategoryModal}
                                            className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold transition duration-300 inline-flex items-center gap-2 shadow-lg"
                                        >
                                            <FaPlus /> Create Your First Category
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                <input type="checkbox" className="rounded" />
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Products</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {viewMode === 'plain' ? (
                                            // Plain Category View - Show all categories (main + all subcategories) in flat list
                                            flattenedCategories.map((category) => {
                                                const depth = getCategoryDepth(category._id, categories);
                                                const isMain = depth === 0;
                                                const colorSchemes = [
                                                    { bg: 'bg-indigo-50', border: 'border-l-4 border-indigo-400', tag: 'Main' },
                                                    { bg: 'bg-gray-50', border: 'border-l-4 border-gray-400', tag: 'Sub' },
                                                    { bg: 'bg-gray-100', border: 'border-l-4 border-blue-400', tag: 'Sub-Sub' },
                                                    { bg: 'bg-purple-50', border: 'border-l-4 border-purple-400', tag: 'Sub³' },
                                                ];
                                                const colors = colorSchemes[Math.min(depth, colorSchemes.length - 1)];

                                                return (
                                                    <tr key={category._id} className={`${colors.bg} ${colors.border} hover:opacity-80 transition duration-300`}>
                                                        <td className="px-6 py-4">
                                                            <input type="checkbox" className="rounded" />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {category.image ? (
                                                                    <img
                                                                        src={category.image.startsWith('http') ? category.image : `${API}${category.image}`}
                                                                        alt={category.name}
                                                                        className="w-10 h-10 object-cover rounded-lg border-2 border-gray-300"
                                                                        onError={(e) => {
                                                                            console.error('Category image failed to load:', category.image);
                                                                            e.target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                                        {category.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-semibold text-gray-800 text-sm">
                                                                            {category.name}
                                                                        </h4>
                                                                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${isMain
                                                                            ? 'bg-indigo-200 text-indigo-800'
                                                                            : depth === 1
                                                                                ? 'bg-gray-200 text-gray-800'
                                                                                : depth === 2
                                                                                    ? 'bg-gray-300 text-gray-800'
                                                                                    : 'bg-purple-200 text-purple-800'
                                                                            }`}>
                                                                            {colors.tag}
                                                                        </span>
                                                                    </div>
                                                                    {category.description && (
                                                                        <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-block px-3 py-1 bg-indigo-50 text-gray-700 rounded-full font-semibold text-sm">
                                                                {category.productCount || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCategory(category);
                                                                        setFormData({
                                                                            name: category.name,
                                                                            description: category.description,
                                                                            image: category.image,
                                                                        });
                                                                        setShowAddCategoryModal(true);
                                                                    }}
                                                                    className="bg-gray-800 hover:bg-black text-white p-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                                                                    title="Edit"
                                                                >
                                                                    <FaEdit className="text-sm" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCategory(category._id)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                                                                    title="Delete"
                                                                >
                                                                    <FaTrash className="text-sm" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            // Menu Category View - Show nested structure with subcategories
                                            filteredCategories.map((category) => (
                                                <NestedCategoryRows
                                                    key={category._id}
                                                    category={category}
                                                    depth={0}
                                                    onToggle={(targetId) => setCategories(recursiveToggle(targetId, categories))}
                                                    onEdit={handleEditSubcategory}
                                                    onDelete={handleDeleteSubcategory}
                                                    onAddSubcategory={openAddSubcategoryModal}
                                                    onEditMain={handleEditCategory}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CategoryModal
                showModal={showAddCategoryModal}
                onClose={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', image: null });
                }}
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
                formData={formData}
                setFormData={setFormData}
                handleAddCategory={handleAddCategory}
                handleImageUpload={handleImageUpload}
                editingCategory={editingCategory}
            />

            <SubcategoryModal
                showModal={showAddSubcategoryModal}
                onClose={() => {
                    setShowAddSubcategoryModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', image: null });
                }}
                title={editingCategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                formData={formData}
                setFormData={setFormData}
                handleAddSubcategory={handleAddSubcategory}
                handleImageUpload={handleImageUpload}
                editingCategory={editingCategory}
            />

            {/* Category Products Modal */}
            {showCategoryProducts && selectedCategoryForProducts && (
                <CategoryProducts
                    categoryId={selectedCategoryForProducts.id}
                    categoryName={selectedCategoryForProducts.name}
                    categoryImage={selectedCategoryForProducts.image}
                    productCount={selectedCategoryForProducts.productCount}
                    onClose={() => {
                        setShowCategoryProducts(false);
                        setSelectedCategoryForProducts(null);
                    }}
                    onEditProduct={(product) => {
                    }}
                />
            )}
            </>
        
    );
};

export default CategoryManagement;
