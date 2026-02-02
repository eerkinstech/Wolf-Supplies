import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';

const AdminMenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isCreatingMain, setIsCreatingMain] = useState(false);
    const [mainText, setMainText] = useState('');
    const [mainLink, setMainLink] = useState('');
    const [addingSubFor, setAddingSubFor] = useState(null);
    const [addingSubText, setAddingSubText] = useState('');
    const [addingSubLink, setAddingSubLink] = useState('');
    const [expanded, setExpanded] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [editLink, setEditLink] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const [mainSelectorFor, setMainSelectorFor] = useState(null);
    const [subSelectorFor, setSubSelectorFor] = useState(null);

    const [selectorModal, setSelectorModal] = useState(null);
    const [categoriesList, setCategoriesList] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [pagesList, setPagesList] = useState([]);
    const [policiesList, setPoliciesList] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [loadingSelector, setLoadingSelector] = useState(false);
    const [editingForLink, setEditingForLink] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [faqsList, setFaqsList] = useState([]);
    const [paymentOptionsList, setPaymentOptionsList] = useState([]);

    const startCreateMain = () => {
        setIsCreatingMain(true);
        setMainText('');
        setMainLink('');
    };

    const cancelCreateMain = () => {
        setIsCreatingMain(false);
        setMainText('');
        setMainLink('');
    };

    const confirmCreateMain = () => {
        if (!mainText.trim()) {
            toast.error('Please enter a title');
            return;
        }
        const id = `main_${Date.now()}`;
        const newItem = {
            id,
            label: mainText.trim(),
            name: mainText.trim(),
            url: mainLink.trim() || '#',
            link: mainLink.trim() || '#',
            submenu: []
        };
        setMenuItems((s) => [...s, newItem]);
        toast.success('Main menu item added');
        cancelCreateMain();
        setExpanded((e) => ({ ...e, [id]: true }));
    };

    const startAddSub = (parentId) => {
        setAddingSubFor(parentId);
        setAddingSubText('');
        setAddingSubLink('');
    };

    const cancelAddSub = () => {
        setAddingSubFor(null);
        setAddingSubText('');
        setAddingSubLink('');
    };

    const findAndUpdateItemById = (items, targetId, updateFn) => {
        return items.map((item) => {
            if (item.id === targetId) {
                return updateFn(item);
            }
            const submenuItems = item.submenu || item.sub || [];
            if (submenuItems && submenuItems.length > 0) {
                return {
                    ...item,
                    submenu: findAndUpdateItemById(submenuItems, targetId, updateFn),
                    ...(item.sub && { sub: findAndUpdateItemById(item.sub, targetId, updateFn) })
                };
            }
            return item;
        });
    };

    const confirmAddSub = (parentId) => {
        if (!parentId) return;
        setMenuItems((prev) => {
            const updated = findAndUpdateItemById(prev, parentId, (item) => {
                const submenuItems = item.submenu || [];
                const newSub = {
                    id: `sub_${Date.now()}`,
                    label: addingSubText || 'Submenu',
                    name: addingSubText || 'Submenu',
                    url: addingSubLink || '#',
                    link: addingSubLink || '#',
                    submenu: []
                };
                return { ...item, submenu: [...submenuItems, newSub] };
            });
            return updated;
        });
        toast.success('Submenu added');
        cancelAddSub();
    };

    const removeFromMenu = (id) => {
        const removeItemById = (items, targetId) => {
            return items
                .filter((m) => m.id !== targetId)
                .map((m) => {
                    const submenuItems = m.submenu || m.sub || [];
                    return {
                        ...m,
                        submenu: submenuItems ? removeItemById(submenuItems, targetId) : submenuItems,
                        ...(m.sub && { sub: m.sub ? removeItemById(m.sub, targetId) : m.sub })
                    };
                });
        };
        setMenuItems((s) => removeItemById(s, id));
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditLabel(item.label || item.name);
        setEditLink(item.url || item.link || '#');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditLabel('');
        setEditLink('');
    };

    const confirmEdit = (itemId) => {
        if (!editLabel.trim()) {
            toast.error('Label cannot be empty');
            return;
        }
        setMenuItems((prev) =>
            findAndUpdateItemById(prev, itemId, (item) => ({
                ...item,
                label: editLabel.trim(),
                name: editLabel.trim(),
                url: editLink.trim() || '#',
                link: editLink.trim() || '#'
            }))
        );
        toast.success('Menu item updated');
        cancelEdit();
    };

    const toggleExpand = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

    const openSelector = async (type) => {
        setSelectorModal(type);
        setSelectedItems(new Set());
        setSearchTerm('');
        setLoadingSelector(true);

        try {
            const API = import.meta.env.VITE_API_URL || '';

            if (type === 'categories') {
                const res = await fetch(`${API}/api/categories?all=true`);
                const data = await res.json();
                setCategoriesList(data || []);
            } else if (type === 'products') {
                const res = await fetch(`${API}/api/products?limit=100`);
                const data = await res.json();
                setProductsList(data.products || data || []);
            } else if (type === 'pages') {
                // Hardcoded pages
                setPagesList([
                    { _id: 'about', name: 'About', slug: 'about', url: '/about' },
                    { _id: 'shop', name: 'Shop', slug: 'shop', url: '/shop' },
                    { _id: 'categories', name: 'Categories', slug: 'categories', url: '/categories' },
                    { _id: 'contact', name: 'Contact', slug: 'contact', url: '/contact' },
                    { _id: 'faqs', name: 'FAQs', slug: 'faqs', url: '/policies/faq' },
                    { _id: 'payment-options', name: 'Payment Options', slug: 'payment-options', url: '/payment-options' },
                ]);
            } else if (type === 'policies') {
                // Hardcoded policies
                setPoliciesList([
                    { _id: 'privacy', name: 'Privacy Policy', slug: 'privacy', url: '/privacy' },
                    { _id: 'terms', name: 'Terms & Conditions', slug: 'terms', url: '/terms' },
                    { _id: 'return-refund', name: 'Return & Refund Policy', slug: 'return-refund', url: '/return-refund' },
                    { _id: 'shipping', name: 'Shipping Policy', slug: 'shipping', url: '/shipping' },
                ]);
            }
        } catch (err) {
            toast.error(`Failed to load ${type}`);
        } finally {
            setLoadingSelector(false);
        }
    };

    const toggleItemSelection = (id) => {
        if (editingForLink || subSelectorFor || mainSelectorFor) {
            setSelectedItems(new Set([id]));
        } else {
            const newSet = new Set(selectedItems);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            setSelectedItems(newSet);
        }
    };

    const getFilteredList = () => {
        const term = searchTerm.toLowerCase();
        if (selectorModal === 'categories') {
            return categoriesList.filter(c => (c.name || c.title || '').toLowerCase().includes(term));
        } else if (selectorModal === 'products') {
            return productsList.filter(p => (p.name || p.title || '').toLowerCase().includes(term));
        } else if (selectorModal === 'pages') {
            return pagesList.filter(p => (p.name || p.title || '').toLowerCase().includes(term));
        } else if (selectorModal === 'policies') {
            return policiesList.filter(p => (p.name || p.title || '').toLowerCase().includes(term));
        }
        return [];
    };

    const confirmSelection = () => {
        if (selectedItems.size === 0) {
            toast.error('Please select at least one item');
            return;
        }

        let itemsToAdd = [];

        if (selectorModal === 'categories') {
            itemsToAdd = categoriesList.filter(c => selectedItems.has(c._id || c.id));
        } else if (selectorModal === 'products') {
            itemsToAdd = productsList.filter(p => selectedItems.has(p._id || p.id));
        } else if (selectorModal === 'pages') {
            itemsToAdd = pagesList.filter(p => selectedItems.has(p._id || p.id));
        } else if (selectorModal === 'policies') {
            itemsToAdd = policiesList.filter(p => selectedItems.has(p._id || p.id));
        }

        if (editingForLink && itemsToAdd.length > 0) {
            const item = itemsToAdd[0];
            const url = item.url || (selectorModal === 'categories' ? `/category/${item.slug || item._id}`
                : selectorModal === 'products' ? `/product/${item.slug || item._id}`
                    : selectorModal === 'pages' ? `/${item.slug || item._id}`
                        : `/policies/${item.slug || item._id}`);
            setEditLink(url);
            toast.success(`Link set to: ${url}`);
            setSelectorModal(null);
            setSelectedItems(new Set());
            setEditingForLink(null);
            return;
        }

        if (mainSelectorFor && itemsToAdd.length > 0) {
            const item = itemsToAdd[0];
            const url = item.url || (selectorModal === 'categories' ? `/category/${item.slug || item._id}`
                : selectorModal === 'products' ? `/product/${item.slug || item._id}`
                    : selectorModal === 'pages' ? `/${item.slug || item._id}`
                        : `/policies/${item.slug || item._id}`);
            setMainText(item.name || item.title);
            setMainLink(url);
            toast.success(`Selected: ${item.name || item.title}`);
            setSelectorModal(null);
            setSelectedItems(new Set());
            setMainSelectorFor(null);
            return;
        }

        if (subSelectorFor && itemsToAdd.length > 0) {
            const item = itemsToAdd[0];
            const url = item.url || (selectorModal === 'categories' ? `/category/${item.slug || item._id}`
                : selectorModal === 'products' ? `/product/${item.slug || item._id}`
                    : selectorModal === 'pages' ? `/${item.slug || item._id}`
                        : `/policies/${item.slug || item._id}`);
            setAddingSubText(item.name || item.title);
            setAddingSubLink(url);
            toast.success(`Selected: ${item.name || item.title}`);
            setSelectorModal(null);
            setSelectedItems(new Set());
            setSubSelectorFor(null);
            return;
        }

        itemsToAdd.forEach((item) => {
            const id = `main_${Date.now()}_${Math.random()}`;
            const url = item.url || (selectorModal === 'categories' ? `/category/${item.slug || item._id}`
                : selectorModal === 'products' ? `/product/${item.slug || item._id}`
                    : selectorModal === 'pages' ? `/${item.slug || item._id}`
                        : `/policies/${item.slug || item._id}`);

            const newItem = {
                id,
                label: item.name || item.title,
                name: item.name || item.title,
                url,
                link: url,
                submenu: []
            };

            setMenuItems((prev) => [...prev, newItem]);
            setExpanded((e) => ({ ...e, [id]: true }));
        });

        toast.success(`Added ${itemsToAdd.length} item(s) to menu`);
        setSelectorModal(null);
        setSelectedItems(new Set());
    };

    const quickAddMenuItem = (label, url) => {
        const id = `main_${Date.now()}`;
        const newItem = {
            id,
            label,
            name: label,
            url,
            link: url,
            submenu: []
        };
        setMenuItems((s) => [...s, newItem]);
        toast.success(`Added "${label}" to menu`);
        setExpanded((e) => ({ ...e, [id]: true }));
    };

    const handleMainDragStart = (e, index, level = 0, parentPath = []) => {
        e.stopPropagation();
        setDraggedItem({ index, level, parentPath });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleMainDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleMainDragLeave = () => {
        setDragOverId(null);
    };

    const handleMainDrop = (e, targetIndex, level = 0, parentPath = []) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedItem) {
            setDraggedItem(null);
            setDragOverId(null);
            return;
        }

        const draggedLevel = draggedItem.level;
        const draggedPath = draggedItem.parentPath;
        if (draggedLevel === level && JSON.stringify(draggedPath) === JSON.stringify(parentPath)) {
            if (draggedItem.index === targetIndex) {
                setDraggedItem(null);
                setDragOverId(null);
                return;
            }
            if (level === 0) {
                setMenuItems((prev) => {
                    const newItems = [...prev];
                    const item = newItems[draggedItem.index];
                    newItems.splice(draggedItem.index, 1);
                    newItems.splice(targetIndex, 0, item);
                    return newItems;
                });
            } else {
                setMenuItems((prev) => {
                    return reorderAtPath(prev, parentPath, draggedItem.index, targetIndex);
                });
            }
        } else {
        }

        setDraggedItem(null);
        setDragOverId(null);
    };

    const reorderAtPath = (items, path, fromIndex, toIndex) => {
        if (path.length === 0) {
            const newItems = [...items];
            const item = newItems[fromIndex];
            newItems.splice(fromIndex, 1);
            newItems.splice(toIndex, 0, item);
            return newItems;
        }

        const [firstIndex, ...restPath] = path;
        return items.map((item, idx) => {
            if (idx === firstIndex) {
                const submenuItems = item.submenu || item.sub || [];
                const reorderedSubmenu = reorderAtPath(submenuItems, restPath, fromIndex, toIndex);
                return {
                    ...item,
                    submenu: reorderedSubmenu,
                    ...(item.sub && { sub: reorderedSubmenu })
                };
            }
            return item;
        });
    };

    const renderMenuItem = (item, itemIndex, parentPath = [], level = 0) => {
        const itemId = `${parentPath.join('-')}-${itemIndex}`;
        const isExpanded = expanded[itemId];
        const isDragging = draggedItem && draggedItem.index === itemIndex && draggedItem.level === level && JSON.stringify(draggedItem.parentPath) === JSON.stringify(parentPath);

        const levelColors = [
            { bg: 'var(--color-bg-primary)', border: 'var(--color-border-light)', text: 'var(--color-text-primary)', accent: 'var(--color-accent-primary)' },
            { bg: '#f8f9fa', border: 'var(--color-border-light)', text: 'var(--color-text-primary)', accent: 'var(--color-accent-primary)' },
            { bg: '#f0f1f3', border: 'var(--color-border-light)', text: 'var(--color-text-primary)', accent: 'var(--color-accent-primary)' },
            { bg: '#e8e9eb', border: 'var(--color-border-light)', text: 'var(--color-text-primary)', accent: 'var(--color-accent-primary)' },
        ];

        const currentLevelColor = levelColors[Math.min(level, levelColors.length - 1)];
        const isEditingThis = editingId === item.id;

        return (
            <li
                key={item.id}
                draggable
                onDragStart={(e) => handleMainDragStart(e, itemIndex, level, parentPath)}
                onDragOver={handleMainDragOver}
                onDragLeave={handleMainDragLeave}
                onDrop={(e) => handleMainDrop(e, itemIndex, level, parentPath)}
                className={`border-2 rounded-lg transition-all ${isDragging ? 'opacity-40 ring-2 ring-yellow-400' : ''} ${dragOverId === item.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                    borderColor: currentLevelColor.border,
                    backgroundColor: currentLevelColor.bg,
                    marginLeft: `${level * 20}px`,
                    boxShadow: level > 0 ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'grab'
                }}
                onDragEnter={() => setDragOverId(item.id)}
            >
                {isEditingThis ? (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-light)' }}>Label</label>
                                <input
                                    value={editLabel}
                                    onChange={(e) => setEditLabel(e.target.value)}
                                    placeholder="Menu item label"
                                    className="w-full border-2 px-3 py-2 rounded text-sm"
                                    style={{ borderColor: 'var(--color-border-light)' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-light)' }}>Link</label>
                                <div className="flex gap-1 flex-wrap">
                                    <input
                                        value={editLink}
                                        onChange={(e) => setEditLink(e.target.value)}
                                        placeholder="Link or URL"
                                        className="flex-1 border-2 px-3 py-2 rounded text-sm"
                                        style={{ borderColor: 'var(--color-border-light)' }}
                                    />
                                    <button
                                        onClick={() => { setEditingForLink(item.id); openSelector('categories'); }}
                                        className="px-2 py-2 rounded text-xs font-medium text-white"
                                        style={{ backgroundColor: '#6366f1' }}
                                        title="Select from categories"
                                    >
                                        📁
                                    </button>
                                    <button
                                        onClick={() => { setEditingForLink(item.id); openSelector('products'); }}
                                        className="px-2 py-2 rounded text-xs font-medium text-white"
                                        style={{ backgroundColor: '#8b5cf6' }}
                                        title="Select from products"
                                    >
                                        🛍️
                                    </button>
                                    <button
                                        onClick={() => { setEditingForLink(item.id); openSelector('pages'); }}
                                        className="px-2 py-2 rounded text-xs font-medium text-white"
                                        style={{ backgroundColor: '#14b8a6' }}
                                        title="Select from pages"
                                    >
                                        📄
                                    </button>
                                    <button
                                        onClick={() => { setEditingForLink(item.id); openSelector('policies'); }}
                                        className="px-2 py-2 rounded text-xs font-medium text-white"
                                        style={{ backgroundColor: '#ec4899' }}
                                        title="Select from policies"
                                    >
                                        ⚖️
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 items-end">
                                <button
                                    onClick={() => confirmEdit(item.id)}
                                    className="flex-1 text-white px-3 py-2 rounded font-medium text-sm"
                                    style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="flex-1 px-3 py-2 border-2 rounded font-medium text-sm"
                                    style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                            <span style={{ color: 'var(--color-text-light)', fontSize: '18px' }}>⋮⋮</span>
                            <div className="flex-1">
                                <div className="font-bold text-sm" style={{ color: currentLevelColor.text }}>
                                    {level > 0 && <span style={{ color: 'var(--color-text-light)' }} className="mr-2">├</span>}
                                    {item.name}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                                    <span className="font-semibold">link:</span> <span style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>{item.url || item.link}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <button
                                onClick={() => startEdit(item)}
                                className="px-3 py-1 rounded text-sm font-medium"
                                style={{
                                    backgroundColor: 'var(--color-accent-primary)',
                                    color: 'white'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                                title="Edit this menu item"
                            >
                                ✎ Edit
                            </button>
                            <button
                                onClick={() => startAddSub(item.id)}
                                className="px-3 py-1 rounded text-sm font-medium text-white"
                                style={{ backgroundColor: '#10b981' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                            >
                                + Sub
                            </button>
                            <button
                                onClick={() => toggleExpand(itemId)}
                                className="px-3 py-1 rounded border text-sm font-medium"
                                style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}
                                title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                                {isExpanded ? '▲' : '▼'}
                            </button>
                            <button
                                onClick={() => removeFromMenu(item.id)}
                                className="px-3 py-1 rounded text-sm font-medium flex items-center gap-2"
                                style={{ backgroundColor: '#fee', color: '#c33' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#fdd'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#fee'}
                            >
                                🗑
                            </button>
                        </div>
                    </div>
                )}

                {isExpanded && ((item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0) || addingSubFor === item.id) && (
                    <div className="p-4 border-t-2" style={{ borderColor: currentLevelColor.border, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                        <div className="mb-4 pb-3 border-b-2" style={{ borderColor: currentLevelColor.border }}>
                            <div className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                Submenus ({(item.submenu || item.sub || []).length})
                            </div>
                        </div>
                        <ul className="space-y-3">
                            {(item.submenu || item.sub || []).map((sub, sidx) => renderMenuItem(sub, sidx, [...parentPath, itemIndex], level + 1))}

                            {addingSubFor === item.id ? (
                                <li className="p-4 rounded-lg border-2 border-dashed" style={{ backgroundColor: '#fafafa', borderColor: 'var(--color-accent-primary)' }}>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input value={addingSubText} onChange={(e) => setAddingSubText(e.target.value)} placeholder="Submenu text" className="border-2 px-3 py-2 rounded" style={{ borderColor: 'var(--color-border-light)' }} />
                                            <input value={addingSubLink} onChange={(e) => setAddingSubLink(e.target.value)} placeholder="Submenu link" className="border-2 px-3 py-2 rounded" style={{ borderColor: 'var(--color-border-light)' }} />
                                        </div>

                                        <div className="flex gap-1 flex-wrap">
                                            <button
                                                onClick={() => { setSubSelectorFor(item.id); openSelector('categories'); }}
                                                className="px-3 py-1 rounded text-xs font-medium text-white"
                                                style={{ backgroundColor: '#6366f1' }}
                                                title="Select from categories"
                                            >
                                                📁 Cat
                                            </button>
                                            <button
                                                onClick={() => { setSubSelectorFor(item.id); openSelector('products'); }}
                                                className="px-3 py-1 rounded text-xs font-medium text-white"
                                                style={{ backgroundColor: '#8b5cf6' }}
                                                title="Select from products"
                                            >
                                                🛍️ Prod
                                            </button>
                                            <button
                                                onClick={() => { setSubSelectorFor(item.id); openSelector('pages'); }}
                                                className="px-3 py-1 rounded text-xs font-medium text-white"
                                                style={{ backgroundColor: '#14b8a6' }}
                                                title="Select from pages"
                                            >
                                                📄 Page
                                            </button>
                                            <button
                                                onClick={() => { setSubSelectorFor(item.id); openSelector('policies'); }}
                                                className="px-3 py-1 rounded text-xs font-medium text-white"
                                                style={{ backgroundColor: '#f59e0b' }}
                                                title="Select from policies"
                                            >
                                                ⚖️ Pol
                                            </button>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => confirmAddSub(item.id)}
                                                className="text-white px-4 py-2 rounded font-medium text-sm flex-1"
                                                style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={cancelAddSub}
                                                className="px-4 py-2 border-2 rounded font-medium text-sm flex-1"
                                                style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ) : null}
                        </ul>
                    </div>
                )
                }
            </li >
        );
    };

    const saveMenu = async () => {
        try {
            const serializeMenuItems = (items) => {
                return items.map((m) => {
                    const submenuArray = m.submenu || m.sub || [];
                    const serialized = {
                        id: m.id,
                        label: m.label || m.name,
                        name: m.name,
                        url: m.url || m.link,
                        link: m.link
                    };
                    if (submenuArray.length > 0) {
                        serialized.submenu = serializeMenuItems(submenuArray);
                    }
                    return serialized;
                });
            };

            const payload = serializeMenuItems(menuItems);

            const API = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API}/api/settings/menu`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ browseMenu: payload })
            });

            if (!res.ok) {
                let errText = res.statusText;
                try {
                    const errBody = await res.json();
                    errText = errBody.message || JSON.stringify(errBody);
                } catch (_) {
                    // ignore parse error
                }
                throw new Error(`Failed to save menu: ${res.status} ${errText}`);
            }

            const responseData = await res.json();
            toast.success('Menu saved');
        } catch (err) {
            toast.error(err.message || 'Save failed');
        }
    };

    useEffect(() => {
        const loadMenu = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API}/api/settings/menu`);
                if (!res.ok) return;
                const data = await res.json();
                if (data && Array.isArray(data.browseMenu)) {
                    setMenuItems(data.browseMenu);
                }
            } catch (e) {
                // ignore load errors
            }
        };
        loadMenu();
    }, []);

    return (
        <AdminLayout activeTab="menu">
            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Menu Manager</h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Drag menu items to reorder. Click Edit to modify labels and links.</p>
                    </div>
                    <button
                        onClick={saveMenu}
                        className="text-white px-6 py-3 rounded-lg font-semibold text-lg"
                        style={{ backgroundColor: 'var(--color-accent-primary)' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                    >
                        💾 Save
                    </button>
                </div>

                <div className="mb-8 flex items-center gap-3">
                    <button
                        onClick={startCreateMain}
                        className="text-white px-4 py-2 rounded-lg font-semibold"
                        style={{ backgroundColor: 'var(--color-accent-primary)' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                    >
                        + Add Main Menu
                    </button>
                    {isCreatingMain && (
                        <div className="flex items-center gap-2 flex-1 flex-wrap">
                            <input value={mainText} onChange={(e) => setMainText(e.target.value)} placeholder="Menu title" className="border-2 px-3 py-2 rounded" style={{ borderColor: 'var(--color-border-light)' }} />
                            <input value={mainLink} onChange={(e) => setMainLink(e.target.value)} placeholder="Link" className="border-2 px-3 py-2 rounded" style={{ borderColor: 'var(--color-border-light)' }} />

                            <button
                                onClick={() => { setMainSelectorFor('categories'); openSelector('categories'); }}
                                className="px-2 py-1 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: '#6366f1' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
                                title="Add category to menu"
                            >
                                📁
                            </button>
                            <button
                                onClick={() => { setMainSelectorFor('products'); openSelector('products'); }}
                                className="px-2 py-1 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: '#8b5cf6' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
                                title="Add product to menu"
                            >
                                🛍️
                            </button>
                            <button
                                onClick={() => { setMainSelectorFor('pages'); openSelector('pages'); }}
                                className="px-2 py-1 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: '#ec4899' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#be185d'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#ec4899'}
                                title="Add page to menu"
                            >
                                📄
                            </button>
                            <button
                                onClick={() => { setMainSelectorFor('policies'); openSelector('policies'); }}
                                className="px-2 py-1 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: '#f59e0b' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
                                title="Add policy to menu"
                            >
                                ⚖️
                            </button>

                            <button
                                onClick={confirmCreateMain}
                                className="text-white px-4 py-2 rounded font-semibold"
                                style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                            >
                                ✓ Add
                            </button>
                            <button onClick={cancelCreateMain} className="px-4 py-2 border-2 rounded font-semibold" style={{ borderColor: 'var(--color-border-light)' }}>✕ Cancel</button>
                        </div>
                    )}
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Quick Add:</span>
                    <button
                        onClick={() => openSelector('categories')}
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: '#6366f1' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
                    >
                        📁 Categories
                    </button>
                    <button
                        onClick={() => openSelector('products')}
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: '#8b5cf6' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
                    >
                        🛍️ Products
                    </button>
                    <button
                        onClick={() => openSelector('policies')}
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: '#ec4899' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#db2777'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ec4899'}
                    >
                        📋 Policies
                    </button>
                    <button
                        onClick={() => openSelector('pages')}
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: '#14b8a6' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9488'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
                    >
                        📄 Pages
                    </button>
                </div>

                <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
                    <h2 className="font-bold text-lg mb-6" style={{ color: 'var(--color-text-primary)' }}>Menu Hierarchy</h2>
                    {menuItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>No menu items yet</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Click "Add Main Menu" to create your first item</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {menuItems.map((item, idx) => renderMenuItem(item, idx, [], 0))}
                        </ul>
                    )}
                </div>

                {selectorModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                            <div className="p-6 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                                    Select {selectorModal.charAt(0).toUpperCase() + selectorModal.slice(1)}
                                </h3>

                                {(selectorModal === 'categories' || selectorModal === 'products') && (
                                    <input
                                        type="text"
                                        placeholder={`Search ${selectorModal}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full border-2 px-3 py-2 rounded text-sm"
                                        style={{ borderColor: 'var(--color-border-light)' }}
                                    />
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                                {loadingSelector ? (
                                    <p style={{ color: 'var(--color-text-light)' }}>Loading...</p>
                                ) : (
                                    <>
                                        {selectorModal === 'policies' ? (
                                            <div className="space-y-4">
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>Policies</h4>
                                                    {policiesList.length > 0 ? (
                                                        policiesList.map((item) => (
                                                            <label key={item._id || item.id} className="flex items-center p-3 rounded cursor-pointer hover:bg-gray-100" style={{ backgroundColor: selectedItems.has(item._id || item.id) ? 'rgba(0,0,0,0.05)' : 'transparent' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedItems.has(item._id || item.id)}
                                                                    onChange={() => toggleItemSelection(item._id || item.id)}
                                                                    className="mr-3"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.name || item.title}</p>
                                                                </div>
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <p style={{ color: 'var(--color-text-light)' }}>No policies available</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : selectorModal === 'pages' ? (
                                            <div className="space-y-4">
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>Pages</h4>
                                                    {pagesList.length > 0 ? (
                                                        pagesList.map((item) => (
                                                            <label key={item._id || item.id} className="flex items-center p-3 rounded cursor-pointer hover:bg-gray-100" style={{ backgroundColor: selectedItems.has(item._id || item.id) ? 'rgba(0,0,0,0.05)' : 'transparent' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedItems.has(item._id || item.id)}
                                                                    onChange={() => toggleItemSelection(item._id || item.id)}
                                                                    className="mr-3"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.name || item.title}</p>
                                                                </div>
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <p style={{ color: 'var(--color-text-light)' }}>No pages available</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            getFilteredList().map((item) => (
                                                <label key={item._id || item.id} className="flex items-center p-3 rounded cursor-pointer hover:bg-gray-100" style={{ backgroundColor: selectedItems.has(item._id || item.id) ? 'rgba(0,0,0,0.05)' : 'transparent' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.has(item._id || item.id)}
                                                        onChange={() => toggleItemSelection(item._id || item.id)}
                                                        className="mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.name || item.title}</p>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="p-6 border-t flex gap-3 justify-end" style={{ borderColor: 'var(--color-border-light)' }}>
                                <button
                                    onClick={() => setSelectorModal(null)}
                                    className="px-4 py-2 border-2 rounded font-semibold"
                                    style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSelection}
                                    className="px-4 py-2 rounded font-semibold text-white"
                                    style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                                >
                                    Add Selected ({selectedItems.size})
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminMenuPage;
