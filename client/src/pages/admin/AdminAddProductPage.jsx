import React, { useState } from 'react';
import { FaTimes, FaCloudUploadAlt, FaCheck, FaSearch, FaChevronDown, FaArrowLeft, FaChevronRight, FaPlus, FaTrashAlt, FaMinus, FaTags } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';

const API = import.meta.env.VITE_API_URL || '';

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth || {});
  const token = authState.token || localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    comparePrice: '',
    slug: '',
    stock: '',
    categories: [],
    description: '',
    benefitsText: '',
    images: [],
    options: [],
    variants: [],
    isDraft: false,
  });

  const GALLERY_VISIBLE = 7;

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [groupBy, setGroupBy] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [optionCollapsed, setOptionCollapsed] = useState({});
  const [groupBulkInputs, setGroupBulkInputs] = useState({});
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAllImagesModal, setShowAllImagesModal] = useState(false);
  const [showVariantImageModal, setShowVariantImageModal] = useState(false);
  const [selectedVariantForImage, setSelectedVariantForImage] = useState(null);
  const [showGroupImageModal, setShowGroupImageModal] = useState(false);
  const [selectedGroupForImage, setSelectedGroupForImage] = useState(null);
  const [priorityGroup, setPriorityGroup] = useState(null);

  // Edit mode detection (move early so `id` is available for initial state)
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Track original form data for discard functionality on edit
  const [originalFormData, setOriginalFormData] = useState(null);
  const isInitialLoadRef = React.useRef(true);

  // Multiple undo stack for deleted variants
  const [deletedVariantsStack, setDeletedVariantsStack] = useState([]);
  const [showUndoStack, setShowUndoStack] = useState([]);
  const undoTimersRef = React.useRef({}); // Track timeouts by variant ID



  // If editing, fetch product and populate form
  React.useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API}/api/products/${id}`);
        const prod = res.data;

        // Handle benefits - could be HTML string, array, or undefined
        let benefitsText = '';
        if (typeof prod.benefits === 'string') {
          // Already HTML from rich text editor
          benefitsText = prod.benefits;
        } else if (Array.isArray(prod.benefits) && prod.benefits.length > 0) {
          // Old format: array of strings - convert to HTML with bullet points
          benefitsText = `<ul>${prod.benefits.map(b => `<li>${b}</li>`).join('')}</ul>`;
        }

        setFormData((prev) => ({
          ...prev,
          name: prod.name || '',
          price: prod.price || '',
          comparePrice: prod.originalPrice || '',
          slug: prod.slug || '',
          stock: prod.stock || '',
          categories: prod.categories ? prod.categories.map((c) => (c._id ? c._id : c)) : [],
          description: prod.description || '',
          whyBuyText: prod.whyBuyText || '',
          benefitsText: benefitsText,
          images: Array.isArray(prod.images) ? prod.images : (prod.images ? [prod.images] : []),
          options: prod.variants || [],
          variants: (prod.variantCombinations || []).map((vc, idx) => ({
            id: vc._id || `variant-${idx}`,
            optionValues: vc.variantValues || {},
            sku: vc.sku || '',
            price: vc.price || '',
            stock: vc.stock || 0,
            image: vc.image || '',
          })),
        }));
      } catch (err) {
        console.error('Failed to load product for editing', err);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch categories on mount
  React.useEffect(() => {
    fetchCategories();
  }, []);

  // Set groupBy to first option when options change
  React.useEffect(() => {
    if (formData.options && formData.options.length > 0) {
      const firstOption = formData.options.find(opt => opt.name);
      if (firstOption && firstOption.name) {
        setGroupBy(firstOption.name);
      }
    }
  }, [formData.options]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/api/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Build payload used by submit and autosave
  const buildPayload = () => {
    const images = Array.isArray(formData.images) ? formData.images : [];
    const variantsTypes = (formData.options || []).map((o) => ({ name: o.name, values: o.values }));
    const variantCombinations = (formData.variants || []).map((v) => ({
      variantValues: v.optionValues || {},
      sku: v.sku || '',
      price: v.price ? parseFloat(v.price) : (formData.price ? parseFloat(formData.price) : 0),
      stock: v.stock ? parseInt(v.stock) : 0,
      image: v.image || '',
    }));

    const generateSlug = (str) =>
      String(str || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

    return {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || '',
      price: formData.price ? parseFloat(formData.price) : 0,
      originalPrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      images,
      variants: variantsTypes,
      variantCombinations,
      categories: formData.categories || [],
      benefits: formData.benefitsText || '',
    };
  };

  // Store original data when loading existing product for discard functionality
  React.useEffect(() => {
    if (id && formData.name) {
      setOriginalFormData(JSON.parse(JSON.stringify(formData)));
    }
  }, [id]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalFormData && !formData.name) {
      // New product with no data
      return false;
    }
    if (!originalFormData && formData.name) {
      // New product with data
      return true;
    }
    if (originalFormData && JSON.stringify(originalFormData) !== JSON.stringify(formData)) {
      // Existing product with changes
      return true;
    }
    return false;
  };

  // Validate: Compare Price must be greater than Price
  const comparePriceError = (() => {
    try {
      const p = formData.price === '' || formData.price === null ? NaN : parseFloat(formData.price);
      const cp = formData.comparePrice === '' || formData.comparePrice === null ? NaN : parseFloat(formData.comparePrice);
      if (!isNaN(cp) && !isNaN(p)) {
        if (cp <= p) return 'Compare price must be greater than Price';
      }
      return '';
    } catch (e) {
      return '';
    }
  })();

  // Prevent page navigation if there are unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, originalFormData]);

  // Prevent React Router navigation if there are unsaved changes
  const handleNavigation = (callback) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave without saving or discarding?'
      );
      if (confirmed) {
        callback();
      }
    } else {
      callback();
    }
  };

  // Helper: Build a map of all category IDs (including subcategories) to their names
  const getCategoryNameMap = () => {
    const map = {};
    const traverse = (items) => {
      if (!items) return;
      const list = Array.isArray(items) ? items : Object.values(items);
      for (const item of list) {
        if (item && item._id && item.name) {
          map[item._id] = item.name;
        }
        if (item && item.subcategories) {
          traverse(item.subcategories);
        }
      }
    };
    traverse(categories);
    return map;
  };

  const normalizeKey = (k) => String(k ?? '—').trim();

  const formatOptionValues = (optionValues = {}) => {
    try {
      const entries = Object.entries(optionValues || {});
      if (groupBy && Object.prototype.hasOwnProperty.call(optionValues || {}, groupBy)) {
        const first = [[groupBy, optionValues[groupBy]]];
        const rest = entries.filter(([k]) => k !== groupBy);
        return [...first, ...rest].map(([k, v]) => `${k}: ${v}`).join(' / ');
      }

      // If options order is available, use it to present values consistently
      if (formData.options && formData.options.length > 0) {
        const order = formData.options.map((o) => o.name).filter(Boolean);
        const sorted = entries.slice().sort((a, b) => {
          const ai = order.indexOf(a[0]);
          const bi = order.indexOf(b[0]);
          const aPos = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
          const bPos = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
          if (aPos === bPos) return String(a[0]).localeCompare(String(b[0]));
          return aPos - bPos;
        });
        return sorted.map(([k, v]) => `${k}: ${v}`).join(' / ');
      }

      return entries.map(([k, v]) => `${k}: ${v}`).join(' / ');
    } catch (e) {
      return '';
    }
  };

  const toggleGroup = (grp) => {
    // Toggle collapsed state
    setCollapsedGroups((prev) => ({ ...prev, [grp]: !prev[grp] }));
  };

  const toggleOptionCollapse = (key) => setOptionCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const handleGroupInputChange = (grp, field, value) => {
    const key = normalizeKey(grp);
    setGroupBulkInputs((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  };

  const applyGroupField = (grp, field, value) => {
    const key = normalizeKey(grp);
    const val = value !== undefined ? value : groupBulkInputs?.[key]?.[field];
    if (val === undefined || val === null || val === '') return;

    let parsedVal = val;
    if (field === 'price') {
      const p = parseFloat(val);
      if (isNaN(p)) return;
      parsedVal = p;
    } else if (field === 'stock') {
      const s = parseInt(val);
      if (isNaN(s)) return;
      parsedVal = s;
    }

    const updatedVariants = formData.variants.map((v) => {
      const k = normalizeKey(v.optionValues && v.optionValues[groupBy]);
      if (k !== key) return v;
      return { ...v, [field]: parsedVal };
    });

    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { name: '', values: [] }],
    });
  };

  // Update option name and keep variant keys in sync
  const handleUpdateOptionName = (idx, name) => {
    const oldName = (formData.options[idx] && formData.options[idx].name) || '';
    const options = formData.options.map((o, i) => (i === idx ? { ...o, name } : o));

    // If the name changed, rename keys in variant.optionValues
    if (oldName !== name) {
      const updatedVariants = (formData.variants || []).map((v) => {
        const ov = { ...(v.optionValues || {}) };
        if (oldName && Object.prototype.hasOwnProperty.call(ov, oldName)) {
          const val = ov[oldName];
          delete ov[oldName];
          if (name) ov[name] = val;
        }
        return { ...v, optionValues: ov };
      });
      setFormData({ ...formData, options, variants: updatedVariants });
    } else {
      setFormData({ ...formData, options });
    }
  };

  // Remove an option and strip its values from variants
  const handleRemoveOption = (idx) => {
    const opt = formData.options[idx];
    const name = opt?.name;
    const options = formData.options.filter((_, i) => i !== idx);

    const updatedVariants = (formData.variants || []).map((v) => {
      if (!name) return v;
      const ov = { ...(v.optionValues || {}) };
      if (Object.prototype.hasOwnProperty.call(ov, name)) {
        delete ov[name];
      }
      return { ...v, optionValues: ov };
    });

    setFormData({ ...formData, options, variants: updatedVariants });
  };

  // Add a value to an option (no duplicates)
  const handleAddOptionValue = (optIdx, value) => {
    const val = String(value || '').trim();
    if (!val) return;
    setFormData((prev) => {
      const options = (prev.options || []).map((o, i) => {
        if (i !== optIdx) return o;
        const values = Array.isArray(o.values) ? [...o.values] : [];
        if (values.includes(val)) return { ...o, values };
        return { ...o, values: [...values, val] };
      });
      return { ...prev, options };
    });
  };

  // Remove a value from an option
  const handleRemoveOptionValue = (optIdx, valueIdx) => {
    setFormData((prev) => {
      const options = (prev.options || []).map((o, i) => {
        if (i !== optIdx) return o;
        const values = Array.isArray(o.values) ? o.values.filter((_, vi) => vi !== valueIdx) : [];
        return { ...o, values };
      });
      return { ...prev, options };
    });
  };

  // Generate variant combinations from current options (cartesian product)
  const generateVariantsFromOptions = () => {
    const opts = (formData.options || []).filter((o) => o.name && Array.isArray(o.values) && o.values.length > 0);
    if (opts.length === 0) {
      setFormData((prev) => ({ ...prev, variants: [] }));
      return;
    }

    const cartesian = (arrays) => arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [[]]);
    const arrays = opts.map((o) => o.values);
    const combos = cartesian(arrays);

    const variants = combos.map((combo, idx) => {
      const optionValues = {};
      combo.forEach((val, i) => {
        optionValues[opts[i].name] = val;
      });
      return {
        id: `variant-${Date.now()}-${idx}`,
        optionValues,
        sku: '',
        price: formData.price || '',
        stock: 0,
        image: '',
      };
    });

    setFormData((prev) => ({ ...prev, variants }));
    setVariantsOpen(true);
    toast.success('Variants generated');
  };

  // handleSubmit now supports publishing (publish = true) or saving as draft (publish = false)
  const handleSubmit = async (e, publish = true) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (comparePriceError) {
      setError(comparePriceError);
      if (typeof toast === 'function') toast.error(comparePriceError);
      return;
    }

    setLoading(true);
    try {
      // Build images array from unified `images` field
      const images = Array.isArray(formData.images) ? formData.images : [];

      // Map option types to `variants` (name + values) expected by server
      const variantsTypes = (formData.options || []).map((o) => ({ name: o.name, values: o.values }));

      // Map each variant to variantCombination schema expected by server
      const variantCombinations = (formData.variants || []).map((v) => ({
        variantValues: v.optionValues || {},
        sku: v.sku || '',
        price: v.price ? parseFloat(v.price) : (formData.price ? parseFloat(formData.price) : 0),
        stock: v.stock ? parseInt(v.stock) : 0,
        image: v.image || '',
      }));

      // Generate slug from name if not provided
      const generateSlug = (str) =>
        String(str || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-');

      const payload = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || '',
        price: formData.price ? parseFloat(formData.price) : 0,
        originalPrice: formData.comparePrice && formData.comparePrice.trim() !== '' ? parseFloat(formData.comparePrice) : null,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        images,
        variants: variantsTypes,
        variantCombinations,
        categories: formData.categories || [],
        benefits: formData.benefitsText || '',
        isDraft: publish ? false : true,
      };

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (isEditing) {
        // Update existing product
        const res = await axios.put(`${API}/api/products/${id}`, payload, { headers });
        toast.success(publish ? 'Product saved successfully!' : 'Product saved as draft');

        // Refresh the product data from server to ensure consistency
        const refreshRes = await axios.get(`${API}/api/products/${id}`);
        const refreshedProd = refreshRes.data;

        // Rebuild formData from refreshed product
        let refreshedBenefitsText = '';
        if (typeof refreshedProd.benefits === 'string') {
          refreshedBenefitsText = refreshedProd.benefits;
        } else if (Array.isArray(refreshedProd.benefits) && refreshedProd.benefits.length > 0) {
          refreshedBenefitsText = `<ul>${refreshedProd.benefits.map(b => `<li>${b}</li>`).join('')}</ul>`;
        }

        const refreshedFormData = {
          name: refreshedProd.name || '',
          price: refreshedProd.price || '',
          comparePrice: refreshedProd.originalPrice || '',
          slug: refreshedProd.slug || '',
          stock: refreshedProd.stock || '',
          categories: refreshedProd.categories ? refreshedProd.categories.map((c) => (c._id ? c._id : c)) : [],
          description: refreshedProd.description || '',
          benefitsText: refreshedBenefitsText,
          images: Array.isArray(refreshedProd.images) ? refreshedProd.images : (refreshedProd.images ? [refreshedProd.images] : []),
          options: refreshedProd.variants || [],
          variants: (refreshedProd.variantCombinations || []).map((vc, idx) => ({
            id: vc._id || `variant-${idx}`,
            optionValues: vc.variantValues || {},
            sku: vc.sku || '',
            price: vc.price || '',
            stock: vc.stock || 0,
            image: vc.image || '',
          })),
          isDraft: refreshedProd.isDraft || false,
        };

        setFormData(refreshedFormData);
        setOriginalFormData(JSON.parse(JSON.stringify(refreshedFormData)));
      } else {
        // Create new product
        const res = await axios.post(`${API}/api/products`, payload, { headers });
        const created = res.data;
        if (publish) {
          toast.success('Product published successfully!');
          // Clear form on successful creation
          setFormData({
            name: '',
            price: '',
            comparePrice: '',
            slug: '',
            stock: '',
            categories: [],
            description: '',
            benefitsText: '',
            images: [],
            options: [],
            variants: [],
          });
          setOriginalFormData(null);
          // Redirect after publish
          setTimeout(() => navigate('/admin/products'), 1200);
        } else {
          // If saved as draft, navigate to edit page for continued editing
          toast.success('Draft created. Redirecting to editor...');
          setTimeout(() => navigate(`/admin/products/edit/${created._id}`), 800);
        }
      }
    } catch (err) {
      console.error('Error response:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.message || 'Error creating/updating product';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          id: `variant-${Date.now()}`,
          name: `Variant ${formData.variants.length + 1}`,
          optionValues: {},
          sku: '',
          price: formData.price || '',
          stock: 0,
          image: '',
        },
      ],
    });
  };

  const handleUpdateVariant = (id, updates) => {
    const updated = formData.variants.map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );
    setFormData({ ...formData, variants: updated });
  };

  const handleDeleteVariant = (id) => {
    // Deprecated: replaced by undo-capable delete below
    setFormData({
      ...formData,
      variants: formData.variants.filter((v) => v.id !== id),
    });
  };

  // Replace delete with undo-capable function (support multiple undos)
  const handleDeleteVariantWithUndo = (id, origIndex) => {
    const variant = formData.variants.find((v) => v.id === id);
    if (!variant) return;

    // Determine which group this variant belongs to
    const groupValue = variant.optionValues && variant.optionValues[groupBy];
    const groupKey = groupValue || '—';

    // Add to undo stack with group info
    const newDeletedItem = { variant, index: origIndex, timestamp: Date.now(), id, groupKey };
    setDeletedVariantsStack((prev) => [...prev, newDeletedItem]);
    setShowUndoStack((prev) => [...prev, true]);

    // Auto-dismiss after 8 seconds - store timeout keyed by variant ID
    const timeoutId = setTimeout(() => {
      setShowUndoStack((prev) => {
        const lastIdx = prev.length - 1;
        return prev.filter((_, i) => i !== lastIdx);
      });
      setDeletedVariantsStack((prev) => {
        const lastIdx = prev.length - 1;
        return prev.filter((_, i) => i !== lastIdx);
      });
      delete undoTimersRef.current[id];
    }, 5400000); // 1.5 hours

    undoTimersRef.current[id] = timeoutId;

    // Remove variant from form
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  };

  // Undo the most recent deleted variant
  const handleUndoDelete = (index) => {
    if (index < 0 || index >= deletedVariantsStack.length) return;

    const { variant, id } = deletedVariantsStack[index];
    const insertAt = Math.max(0, Math.min(variant.index, formData.variants.length));

    // Clear the auto-dismiss timeout for this variant
    if (undoTimersRef.current[id]) {
      clearTimeout(undoTimersRef.current[id]);
      delete undoTimersRef.current[id];
    }

    setFormData((prev) => {
      const arr = Array.isArray(prev.variants) ? [...prev.variants] : [];
      arr.splice(insertAt, 0, variant);
      return { ...prev, variants: arr };
    });

    // Remove from undo stack
    setDeletedVariantsStack((prev) => prev.filter((_, i) => i !== index));
    setShowUndoStack((prev) => prev.filter((_, i) => i !== index));

    toast('Variant restored', { icon: '↩️' });
  };

  // Helper: Upload image to server and get URL
  const uploadImageToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API}/api/upload`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      return res.data.url; // Returns /uploads/filename
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleAddImages = (imageData) => {
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), imageData],
    }));
  };

  const handleRemoveImage = (idx) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== idx),
    });
  };

  const handleReorderImages = (from, to) => {
    if (from === to) return;
    const imgs = Array.isArray(formData.images) ? [...formData.images] : [];
    if (from < 0 || from >= imgs.length) return;
    const [item] = imgs.splice(from, 1);
    imgs.splice(Math.max(0, Math.min(to, imgs.length)), 0, item);
    setFormData({ ...formData, images: imgs });
  };

  const getTotalStock = (variants) => {
    return variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
  };

  // Helper to ensure image URLs are absolute (prepend API base if needed)
  const getImgSrc = (img) => {
    if (!img) return '';
    try {
      if (typeof img !== 'string') return '';
      return img.startsWith('http') ? img : `${API}${img}`;
    } catch (e) {
      return '';
    }
  };



  // Category Modal Component
  const CategoryModal = ({ show, onClose }) => {
    const [localSelected, setLocalSelected] = React.useState(formData.categories || []);

    React.useEffect(() => setLocalSelected(formData.categories || []), [formData.categories, show]);

    const toggle = (id) => {
      setLocalSelected((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      );
    };

    const flatten = (items, depth = 0) => {
      // Normalize items to an array. Support:
      // - arrays of categories
      // - objects where values are categories (maps)
      // - a single category object
      if (!items) return [];
      let list = [];
      if (Array.isArray(items)) list = items;
      else if (typeof items === 'object') list = Object.values(items);
      else return [];

      const out = [];
      for (const it of list) {
        if (!it || !it._id) continue;
        out.push({
          _id: it._id,
          name: it.name,
          parent: it.parent,
          _depth: depth,
        });

        // subcategories may be an array or an object map; recurse safely
        if (it.subcategories && (Array.isArray(it.subcategories) || typeof it.subcategories === 'object')) {
          out.push(...flatten(it.subcategories, depth + 1));
        }
      }

      return out;
    };

    if (!show) return null;

    const flat = flatten(categories || []);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-xl w-[min(900px,95%)] max-h-[95vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-3">
            <div className="flex items-center gap-3">
              <FaTags className="text-xl text-gray-700" />
              <div>
                <h3 className="text-lg font-semibold">Select Categories</h3>
                <p className="text-xs text-gray-900">Choose which categories this product should belong to</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                aria-label="Close categories modal"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="search"
              placeholder="Search categories..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
              onChange={(e) => {
                // lightweight client-side filter (visual only)
                const q = e.target.value.trim().toLowerCase();
                // Add a data attribute used by CSS/DOM filtering will be applied by browser
                // Keep functionality unchanged; this is purely presentational
                document.querySelectorAll('[data-cat-name]').forEach((el) => {
                  const name = el.getAttribute('data-cat-name') || '';
                  el.style.display = name.toLowerCase().includes(q) ? '' : 'none';
                });
              }}
            />
          </div>

          <div className="grid gap-2">
            {flat && flat.length > 0 ? (
              flat.map((cat) => (
                <label
                  key={`cat-${cat._id}`}
                  data-cat-name={cat.name}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-white border border-gray-100 rounded-lg cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={localSelected.includes(cat._id)}
                    onChange={() => toggle(cat._id)}
                    className="w-4 h-4 cursor-pointer text-gray-700"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-800 font-medium">{cat.name}</div>
                    {cat._depth ? <div className="text-xs text-gray-400">{Array(cat._depth).fill('· ').join('')}</div> : null}
                  </div>
                </label>
              ))
            ) : (
              <p className="text-gray-900 text-sm py-4">No categories available</p>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, categories: localSelected });
                onClose();
              }}
              className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-black"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // All Images Modal Component
  const AllImagesModal = ({ show, onClose }) => {
    if (!show) return null;

    const allGalleryImages = (formData.images || []).slice(1); // Skip main image

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-2xl w-[min(900px,95%)] max-h-[85vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">All Gallery Images ({allGalleryImages.length})</h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {allGalleryImages.map((img, idx) => {
              const actualIdx = idx + 1; // Actual index in formData.images
              return (
                <div
                  key={actualIdx}
                  className="relative group rounded-lg overflow-hidden bg-gray-100 cursor-grab border border-gray-200 h-40"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', String(actualIdx));
                  }}
                  onDoubleClick={() => {
                    handleReorderImages(actualIdx, 0);
                    onClose();
                  }}
                >
                  <img src={getImgSrc(img)} alt={`Gallery ${actualIdx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="text-center text-white">
                      <p className="text-xs font-semibold">Double-click to set as main</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(actualIdx)}
                    className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    aria-label="Remove image"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 text-gray-900 hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Variant Image Selection Modal Component
  const VariantImageModal = ({ show, onClose }) => {
    if (!show || !selectedVariantForImage) return null;

    const allImages = formData.images || [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-2xl w-[min(900px,95%)] max-h-[85vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">Select Image for Variant</h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {allImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  handleUpdateVariant(selectedVariantForImage.id, { image: img });
                  onClose();
                  setSelectedVariantForImage(null);
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'copy';
                  e.dataTransfer.setData('text/plain', img);
                }}
                className="relative group rounded-lg overflow-hidden bg-gray-100 cursor-pointer border-2 border-gray-200 h-40 hover:border-gray-800 transition"
              >
                <img src={getImgSrc(img)} alt={`Product ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-center text-white">
                    <p className="text-sm font-semibold">Click to select<br />or drag</p>
                  </div>
                </div>
                {selectedVariantForImage?.image === img && (
                  <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold">
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 text-gray-900 hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Group Image Selection Modal Component
  const GroupImageModal = ({ show, onClose }) => {
    if (!show || !selectedGroupForImage) return null;

    const allImages = formData.images || [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-2xl w-[min(900px,95%)] max-h-[85vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">Select Image for Group: {selectedGroupForImage}</h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {allImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  handleGroupInputChange(selectedGroupForImage, 'image', img);
                  applyGroupField(selectedGroupForImage, 'image', img);
                  onClose();
                  setSelectedGroupForImage(null);
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'copy';
                  e.dataTransfer.setData('text/plain', img);
                }}
                onDragEnd={(e) => {
                  e.preventDefault();
                }}
                className="relative group rounded-lg overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing border-2 border-gray-200 h-40 hover:border-gray-800 transition"
              >
                <img src={getImgSrc(img)} alt={`Product ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-center text-white">
                    <p className="text-sm font-semibold">Click to select<br />or drag to variant</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 text-gray-900 hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => handleNavigation(() => navigate('/admin/products'))}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft /> Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
            <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>

            {/* Draft status badge + toggle */}
            <div className="ml-auto flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${formData.isDraft ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-800'}`}
                title={formData.isDraft ? 'Draft (unsaved until you Save Draft)' : 'Published'}
              >
                {formData.isDraft ? 'Draft' : 'Published'}
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isDraft)}
                  onChange={(e) => setFormData({ ...formData, isDraft: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="select-none">Draft</span>
              </label>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-400 text-gray-800 rounded">
            {error}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-900">£</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Compare Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-900">£</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.comparePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, comparePrice: e.target.value })
                      }
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 outline-none ${comparePriceError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-gray-800'}`}
                      placeholder="0.00"
                    />
                    {comparePriceError && (
                      <p className="text-xs text-gray-700 mt-1">{comparePriceError}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                  placeholder="product-url-slug"
                />
                <p className="text-xs text-gray-900 mt-1">Auto-generated if empty</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-900">
                    Categories
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full border border-gray-300 shadow-sm hover:shadow"
                    aria-label="Select categories"
                  >
                    <FaTags className="text-gray-700" />
                    <span className="font-medium">Select Categories</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.categories || []).map((catId) => {
                    const categoryNameMap = getCategoryNameMap();
                    const categoryName = categoryNameMap[catId] || catId;
                    return (
                      <span
                        key={`chip-${catId}`}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-full text-sm font-semibold shadow-sm"
                      >
                        <span className="text-gray-700 text-xs">{categoryName && categoryName[0]}</span>
                        <span className="text-indigo-800">{categoryName}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              categories: (formData.categories || []).filter(
                                (c) => c !== catId
                              ),
                            })
                          }
                          className="text-gray-900 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                          aria-label={`Remove category ${categoryName}`}
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) =>
                    setFormData({ ...formData, description: html })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Why Buy This Product
                </label>
                <RichTextEditor
                  value={formData.benefitsText}
                  onChange={(html) =>
                    setFormData({ ...formData, benefitsText: html })
                  }
                />
                <p className="text-xs text-gray-900 mt-2">Use the editor to format your benefits with headings, bullets, and bold text. These will be displayed beautifully on the product page.</p>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Media</h2>
            <div className="grid grid-cols-5 gap-3">
              {/* Main Image - Left Side, Spans 2 Rows */}
              <div className="col-span-2 row-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Main Image</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 w-full h-64 flex items-center justify-center relative"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const idx = e.dataTransfer.getData('text/plain');
                    if (idx) {
                      handleReorderImages(Number(idx), 0);
                    }
                  }}
                >
                  {formData.images && formData.images[0] ? (
                    <div className="relative w-full h-full">
                      <img
                        src={getImgSrc(formData.images[0])}
                        alt="Main"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(0)}
                        className="absolute top-2 right-2 bg-gray-700 text-white p-1.5 rounded-full hover:bg-gray-800"
                        aria-label="Remove main image"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            Array.from(files).forEach(async (file) => {
                              const imageUrl = await uploadImageToServer(file);
                              if (imageUrl) {
                                handleAddImages(imageUrl);
                              }
                            });
                          }
                        }}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-2 text-gray-600">
                        <FaCloudUploadAlt className="text-3xl text-gray-700" />
                        <span className="text-xs font-semibold text-center">Drop or click to add images</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Gallery Images - Right Side, 2 Columns x 2 Rows */}
              <div className="col-span-3">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Gallery images</label>

                {(() => {
                  const imgs = formData.images || [];
                  const topFour = imgs.slice(1, 5); // Show images 1-4 (skip main at 0)
                  const bottomTwo = imgs.slice(5, 7); // Show images 5-6
                  const remaining = Math.max(0, imgs.length - 7);

                  return (
                    <div className="space-y-3">
                      {/* Top row - 4 images */}
                      <div className="grid grid-cols-4 gap-3 h-32">
                        {topFour.map((img, idx) => {
                          const actualIdx = idx + 1;
                          return (
                            <div
                              key={actualIdx}
                              className="relative group rounded-lg overflow-hidden bg-gray-100 cursor-grab border border-gray-200"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', String(actualIdx));
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const from = Number(e.dataTransfer.getData('text/plain'));
                                if (!isNaN(from)) handleReorderImages(from, actualIdx);
                              }}
                              onDoubleClick={() => handleReorderImages(actualIdx, 0)}
                            >
                              <img src={getImgSrc(img)} alt={`Gallery ${actualIdx}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(actualIdx)}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                aria-label="Remove image"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom row - 2 images + buttons */}
                      <div className="grid grid-cols-4 gap-3 h-32">
                        {bottomTwo.map((img, idx) => {
                          const actualIdx = idx + 5;
                          return (
                            <div
                              key={actualIdx}
                              className="relative group rounded-lg overflow-hidden bg-gray-100 cursor-grab border border-gray-200"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', String(actualIdx));
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const from = Number(e.dataTransfer.getData('text/plain'));
                                if (!isNaN(from)) handleReorderImages(from, actualIdx);
                              }}
                              onDoubleClick={() => handleReorderImages(actualIdx, 0)}
                            >
                              <img src={getImgSrc(img)} alt={`Gallery ${actualIdx}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(actualIdx)}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                aria-label="Remove image"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </div>
                          );
                        })}

                        {/* +More Images button or Add New Images button */}
                        {remaining > 0 ? (
                          <button
                            type="button"
                            onClick={() => setShowAllImagesModal(true)}
                            className="relative rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-800 transition cursor-pointer"
                          >
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-700">+{remaining}</div>
                              <div className="text-xs text-gray-600 mt-1">More Images</div>
                            </div>
                          </button>
                        ) : (
                          <label className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-800 transition bg-white">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                  Array.from(files).forEach(async (file) => {
                                    const imageUrl = await uploadImageToServer(file);
                                    if (imageUrl) {
                                      handleAddImages(imageUrl);
                                    }
                                  });
                                }
                              }}
                              className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-600">
                              <span className="text-2xl">+</span>
                              <span className="text-xs font-semibold text-center">Add New Images</span>
                            </div>
                          </label>
                        )}

                        <label className="inline-flex items-center gap-3 px-5 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-800 cursor-pointer bg-white">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                Array.from(files).forEach(async (file) => {
                                  const imageUrl = await uploadImageToServer(file);
                                  if (imageUrl) {
                                    handleAddImages(imageUrl);
                                  }
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <span className="text-gray-700 text-center font-semibold">+ Add More Images</span>
                        </label>

                      </div>
                    </div>
                  );
                })()}

              </div>

            </div>
          </div>

          {/* Variants Section */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Variants & Options</h2>

            {/* Options Panel */}
            <div className="bg-gray-50 border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setOptionsOpen((s) => !s)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`transform transition-transform ${optionsOpen ? 'rotate-90' : ''
                      }`}
                  >
                    <FaChevronRight />
                  </span>
                  <h3 className="text-lg font-bold">Options</h3>
                </button>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-black"
                  aria-label="Add option"
                >
                  <FaPlus className="text-sm" />
                  <span className="hidden sm:inline-block">Add Option</span>
                </button>
              </div>

              {optionsOpen && formData.options.length === 0 && (
                <p className="text-sm text-gray-900 mb-3">
                  Add an option (e.g., Size, Color) then add its values.
                </p>
              )}

              {optionsOpen && (
                <div className="space-y-3">
                  {formData.options.map((opt, idx) => {
                    const optKey = opt.name || `opt-${idx}`;
                    const isOptOpen = !!optionCollapsed[optKey]; // true = open, false/undefined = closed by default
                    return (
                      <div key={idx} className="bg-white border rounded p-3">
                        <div className="flex items-center justify-between ">
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              type="button"
                              onClick={() => toggleOptionCollapse(optKey)}
                              className="p-1"
                            >
                              <FaChevronDown
                                className={`transition-transform ${isOptOpen ? 'rotate-0' : '-rotate-90'
                                  }`}
                              />
                            </button>
                            <input
                              type="text"
                              value={opt.name}
                              onChange={(e) =>
                                handleUpdateOptionName(idx, e.target.value)
                              }
                              placeholder="Option name (e.g., Size)"
                              className="px-3 py-2 border rounded flex-1"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition"
                            aria-label="Remove option"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>

                        {isOptOpen && (
                          <>
                            <div className="flex gap-2 items-center mb-2">
                              <input
                                type="text"
                                placeholder={`Add ${opt.name || 'value'}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddOptionValue(idx, e.target.value.trim());
                                    e.target.value = '';
                                  }
                                }}
                                className="flex-1 px-3 py-2 border rounded"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const input = e.target
                                    .closest('.flex')
                                    ?.querySelector('input');
                                  if (input && input.value) {
                                    handleAddOptionValue(idx, input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-black"
                              >
                                Add Value
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {opt.values.map((v, vi) => (
                                <span
                                  key={vi}
                                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-2"
                                >
                                  {v}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionValue(idx, vi)}
                                    className="text-gray-700 hover:text-gray-900 font-bold p-0.5 rounded-full hover:bg-gray-100 transition"
                                    aria-label={`Remove value ${v}`}
                                  >
                                    <FaMinus className="text-sm" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {optionsOpen && formData.options.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    generateVariantsFromOptions();
                    setVariantsOpen(true);
                  }}
                  className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-black"
                >
                  Generate Variants
                </button>
              )}
            </div>

            {/* Variants Panel */}
            {formData.variants.length > 0 && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setVariantsOpen((s) => !s)}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`transform transition-transform ${variantsOpen ? 'rotate-90' : ''
                        }`}
                    >
                      <FaChevronRight />
                    </span>
                    <h3 className="text-lg font-bold">
                      Variants ({formData.variants.length})
                    </h3>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddVariant();
                      setVariantsOpen(true);
                    }}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black"
                  >
                    Add Variant
                  </button>
                </div>

                {variantsOpen && (
                  <>
                    {/* Search and Group Controls */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search variants..."
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Group by</label>
                        <select
                          value={groupBy}
                          onChange={(e) => setGroupBy(e.target.value)}
                          className="px-3 py-2 border rounded-lg"
                        >
                          {formData.options.map((opt) =>
                            opt.name ? (
                              <option key={opt.name} value={opt.name}>
                                {opt.name}
                              </option>
                            ) : null
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Variants Grouped View */}
                    <div className="overflow-x-auto">
                      <div className="space-y-4">
                        {(() => {
                          // Build groups keyed by selected option value
                          const groups = {};
                          const opts = formData.variants || [];
                          const search = (searchTerm || '').trim().toLowerCase();
                          opts.forEach((v) => {
                            // If a search term is active, filter variants by SKU, name, or formatted option values
                            if (search) {
                              const hay = `${v.sku || ''} ${v.name || ''} ${formatOptionValues(v.optionValues) || ''}`.toLowerCase();
                              if (!hay.includes(search)) return;
                            }
                            const key = (v.optionValues && v.optionValues[groupBy]) || '—';
                            if (!groups[key]) groups[key] = [];
                            groups[key].push(v);
                          });

                          // Sort groups by name
                          let ordered = Object.keys(groups).sort((a, b) => String(a).localeCompare(String(b)));

                          // If a priority group is selected, ensure it appears first
                          if (priorityGroup && groups[priorityGroup] && ordered.includes(priorityGroup)) {
                            ordered = [priorityGroup, ...ordered.filter((k) => k !== priorityGroup)];
                          }

                          return ordered.map((grp) => {
                            const variantsInGroup = groups[grp];
                            const isGroupOpen = !!collapsedGroups[grp]; // true = open, false/undefined = closed by default
                            const key = normalizeKey(grp);
                            return (
                              <div key={`group-${key}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => toggleGroup(grp)}
                                      className={`p-2 ${isGroupOpen ? 'rotate-90' : ''}`}
                                      aria-expanded={isGroupOpen}
                                    >
                                      <FaChevronRight />
                                    </button>
                                    <div>
                                      <div className="text-lg font-bold">{grp}</div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-900">{variantsInGroup.length} variant(s)</span>
                                        <span className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">Group</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-gray-600 font-semibold">Price:</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Price"
                                        value={(groupBulkInputs?.[key]?.price) ?? ''}
                                        onChange={(e) => {
                                          handleGroupInputChange(grp, 'price', e.target.value);
                                          applyGroupField(grp, 'price', e.target.value);
                                        }}
                                        className="w-24 px-2 py-1 border rounded text-sm"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-gray-600 font-semibold">Stock:</label>
                                      <input
                                        type="number"
                                        placeholder="Stock"
                                        value={(groupBulkInputs?.[key]?.stock) ?? ''}
                                        onChange={(e) => {
                                          handleGroupInputChange(grp, 'stock', e.target.value);
                                          applyGroupField(grp, 'stock', e.target.value);
                                        }}
                                        className="w-20 px-2 py-1 border rounded text-sm"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <label
                                        className="flex flex-col items-center gap-2 cursor-pointer group relative h-10 px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 transition"
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.add('opacity-75', 'ring-2', 'ring-gray-600');
                                        }}
                                        onDragLeave={(e) => {
                                          e.currentTarget.classList.remove('opacity-75', 'ring-2', 'ring-gray-600');
                                        }}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.remove('opacity-75', 'ring-2', 'ring-gray-600');

                                          // Try to get image data from gallery drag
                                          const imageData = e.dataTransfer.getData('text/plain');
                                          if (imageData && (imageData.startsWith('/') || imageData.startsWith('http'))) {
                                            // Store the uploaded image URL directly
                                            handleGroupInputChange(grp, 'image', imageData);
                                            applyGroupField(grp, 'image', imageData);
                                          } else if (imageData && imageData.startsWith('data:')) {
                                            // If it's already a data URL, use it as-is
                                            handleGroupInputChange(grp, 'image', imageData);
                                            applyGroupField(grp, 'image', imageData);
                                          } else {
                                            // Fallback: try to read file if dragging from file system - upload to server
                                            const files = e.dataTransfer.files;
                                            if (files && files[0]) {
                                              const file = files[0];
                                              uploadImageToServer(file).then((url) => {
                                                if (url) {
                                                  handleGroupInputChange(grp, 'image', url);
                                                  applyGroupField(grp, 'image', url);
                                                }
                                              });
                                            }
                                          }
                                        }}
                                        onClick={() => {
                                          setSelectedGroupForImage(grp);
                                          setShowGroupImageModal(true);
                                        }}
                                      >
                                        <span className="text-xs text-gray-700 hover:underline font-semibold">Gallery & Drag</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {isGroupOpen && (
                                  <div className="grid grid-cols-2 gap-3">
                                    {/* Undo deleted variants from this group */}
                                    {deletedVariantsStack.map((deletedItem, idx) =>
                                      deletedItem.groupKey === key && showUndoStack[idx] ? (
                                        <div key={`undo-${deletedItem.timestamp}`} className="col-span-2 bg-gray-100 border border-gray-300 rounded-lg p-3 flex items-center justify-between">
                                          <div className="text-sm text-gray-800 font-medium">
                                            Variant <span className="font-semibold">{formatOptionValues(deletedItem.variant.optionValues)}</span> deleted
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleUndoDelete(idx)}
                                            className="px-4 py-1.5 bg-gray-800 hover:bg-black text-white rounded text-sm font-semibold transition"
                                          >
                                            ↩️ Undo
                                          </button>
                                        </div>
                                      ) : null
                                    )}
                                    {variantsInGroup.map((variant) => {
                                      const origIndex = formData.variants.findIndex((v) => v.id === variant.id);
                                      return (
                                        <div key={variant.id} className="relative border border-gray-200 rounded-lg p-3 bg-white flex gap-3 h-full shadow-sm hover:shadow-md transition">
                                          {/* Left: Option values and 3 columns (SKU, Price, Stock) */}
                                          <div className="flex-1 flex flex-col gap-2">
                                            {/* Header: Option values */}
                                            <div className="text-sm text-gray-600 font-medium">{formatOptionValues(variant.optionValues)}</div>

                                            {/* 3 columns: SKU, Price, Stock */}
                                            <div className="grid grid-cols-3 gap-2">
                                              <div>
                                                <label className="text-xs text-gray-900 font-semibold">SKU</label>
                                                <input
                                                  type="text"
                                                  value={variant.sku || ''}
                                                  onChange={(e) => handleUpdateVariant(variant.id, { sku: e.target.value })}
                                                  placeholder="SKU"
                                                  className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-xs text-gray-900 font-semibold">Price</label>
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  value={variant.price || ''}
                                                  onChange={(e) => handleUpdateVariant(variant.id, { price: e.target.value })}
                                                  placeholder="Price"
                                                  className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-xs text-gray-900 font-semibold">Stock</label>
                                                <input
                                                  type="number"
                                                  value={variant.stock || 0}
                                                  onChange={(e) => handleUpdateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })}
                                                  placeholder="Stock"
                                                  className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                          {/* Right: Image area with drag/gallery option */}
                                          <div className="flex flex-col gap-2 w-32">
                                            <label
                                              className="flex flex-col gap-2 cursor-pointer group relative h-24"
                                              onDragOver={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.add('opacity-75', 'ring-2', 'ring-gray-600');
                                              }}
                                              onDragLeave={(e) => {
                                                e.currentTarget.classList.remove('opacity-75', 'ring-2', 'ring-gray-600');
                                              }}
                                              onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('opacity-75', 'ring-2', 'ring-gray-600');

                                                // Try to get image data from gallery drag
                                                const imageData = e.dataTransfer.getData('text/plain');
                                                if (imageData && (imageData.startsWith('/') || imageData.startsWith('http'))) {
                                                  // Store the uploaded image URL directly
                                                  handleUpdateVariant(variant.id, { image: imageData });
                                                } else if (imageData && imageData.startsWith('data:')) {
                                                  // If it's already a data URL, use it as-is
                                                  handleUpdateVariant(variant.id, { image: imageData });
                                                } else {
                                                  // Fallback: try to read file if dragging from file system - but this would need upload
                                                  const files = e.dataTransfer.files;
                                                  if (files && files[0]) {
                                                    const file = files[0];
                                                    // Upload the file to server instead of converting to data URL
                                                    uploadImageToServer(file).then((url) => {
                                                      if (url) {
                                                        handleUpdateVariant(variant.id, { image: url });
                                                      }
                                                    });
                                                  }
                                                }
                                              }}
                                              onClick={() => {
                                                setSelectedVariantForImage(variant);
                                                setShowVariantImageModal(true);
                                              }}
                                            >

                                              {variant.image ? (
                                                <img src={getImgSrc(variant.image)} alt="v" className="w-full h-full object-cover rounded border border-gray-300 group-hover:opacity-75 transition" onError={(e) => { e.target.style.display = 'none'; }} />
                                              ) : (
                                                <div className="w-full h-full bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-900 group-hover:bg-gray-50 group-hover:border-blue-400 transition text-center px-1">
                                                  Drag or Gallery
                                                </div>
                                              )}
                                            </label>
                                          </div>

                                          {/* Delete button - top right */}
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteVariantWithUndo(variant.id, origIndex)}
                                            className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
                                            aria-label="Delete variant"
                                          >
                                            <FaTrashAlt className="text-sm" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => {
                if (isEditing && originalFormData) {
                  // Discard changes on edit - restore original data
                  setFormData(originalFormData);
                  toast('Changes discarded', {
                    icon: '↩️',
                  });
                } else {
                  // Cancel on create - go back to products with unsaved changes check
                  handleNavigation(() => navigate('/admin/products'));
                }
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              {isEditing ? 'Discard' : 'Cancel'}
            </button>
            {formData.isDraft ? (
              <button
                type="button"
                onClick={() => handleSubmit(null, false)}
                disabled={loading || Boolean(comparePriceError)}
                className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                <FaCheck /> {loading ? (isEditing ? 'Saving...' : 'Saving...') : (isEditing ? 'Save Draft' : 'Save Draft')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || Boolean(comparePriceError)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-black text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                <FaCheck /> {loading ? (isEditing ? 'Saving...' : 'Publishing...') : (isEditing ? 'Save' : 'Publish')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category Modal */}
      <CategoryModal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} />

      {/* All Images Modal */}
      <AllImagesModal show={showAllImagesModal} onClose={() => setShowAllImagesModal(false)} />

      {/* Variant Image Selection Modal */}
      <VariantImageModal show={showVariantImageModal} onClose={() => {
        setShowVariantImageModal(false);
        setSelectedVariantForImage(null);
      }} />

      {/* Group Image Selection Modal */}
      <GroupImageModal show={showGroupImageModal} onClose={() => {
        setShowGroupImageModal(false);
        setSelectedGroupForImage(null);
      }} />

    </div>
  );
};

export default AdminAddProductPage;
