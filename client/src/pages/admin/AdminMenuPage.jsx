import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaGripLines, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';

const AdminMenuPage = () => {
    // menuItems: [{ id, name, link, sub: [{ id, name, link }] }]
    const [menuItems, setMenuItems] = useState([]);

    // Create main item state
    const [isCreatingMain, setIsCreatingMain] = useState(false);
    const [mainText, setMainText] = useState('');
    const [mainLink, setMainLink] = useState('');

    // Submenu add state keyed by parent id
    const [addingSubFor, setAddingSubFor] = useState(null);
    const [addingSubText, setAddingSubText] = useState('');
    const [addingSubLink, setAddingSubLink] = useState('');

    // expand/collapse state for menu items
    const [expanded, setExpanded] = useState({});

    // Create main menu item
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
        const newItem = { id, name: mainText.trim(), link: mainLink.trim() || '#', sub: [] };
        setMenuItems((s) => [...s, newItem]);
        toast.success('Main menu item added');
        cancelCreateMain();
        setExpanded((e) => ({ ...e, [id]: true }));
    };

    // Submenu handlers
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
    const confirmAddSub = (parentId) => {
        if (!parentId) return;
        setMenuItems((prev) => prev.map((m) => {
            if (m.id !== parentId) return m;
            const sub = m.sub || [];
            const newSub = { id: `sub_${Date.now()}`, name: addingSubText || 'Submenu', link: addingSubLink || '#' };
            return { ...m, sub: [...sub, newSub] };
        }));
        toast.success('Submenu added');
        cancelAddSub();
        setExpanded((e) => ({ ...e, [parentId]: true }));
    };

    const removeFromMenu = (id) => {
        setMenuItems((s) => s.filter((m) => m.id !== id));
    };

    const removeSub = (parentId, subId) => {
        setMenuItems((s) => s.map((m) => (m.id !== parentId ? m : { ...m, sub: (m.sub || []).filter((sub) => sub.id !== subId) })));
    };

    const move = (index, dir) => {
        setMenuItems((s) => {
            const copy = [...s];
            const to = index + dir;
            if (to < 0 || to >= copy.length) return copy;
            const [item] = copy.splice(index, 1);
            copy.splice(to, 0, item);
            return copy;
        });
    };

    const moveSub = (parentIndex, subIndex, dir) => {
        setMenuItems((s) => {
            const copy = [...s];
            const parent = { ...copy[parentIndex] };
            parent.sub = [...(parent.sub || [])];
            const to = subIndex + dir;
            if (to < 0 || to >= parent.sub.length) return s;
            const [item] = parent.sub.splice(subIndex, 1);
            parent.sub.splice(to, 0, item);
            copy[parentIndex] = parent;
            return copy;
        });
    };

    const toggleExpand = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

    const saveMenu = async () => {
        try {
            const payload = menuItems.map((m) => ({ id: m.id, name: m.name, link: m.link, sub: (m.sub || []).map((s) => ({ id: s.id, name: s.name, link: s.link })) }));
            const API = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API}/api/settings/menu`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ browseMenu: payload }),
            });

            if (!res.ok) {
                let errText = res.statusText;
                try {
                    const errBody = await res.json();
                    errText = errBody.message || JSON.stringify(errBody);
                } catch (_) { }
                throw new Error(`Failed to save menu: ${res.status} ${errText}`);
            }
            toast.success('Menu saved');
        } catch (err) {
            console.error('saveMenu error:', err);
            toast.error(err.message || 'Save failed');
        }
    };

    // Load existing menu on mount
    useEffect(() => {
        const loadMenu = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API}/api/settings/menu`);
                if (!res.ok) return; // ignore if cannot load
                const data = await res.json();
                if (data && Array.isArray(data.browseMenu)) setMenuItems(data.browseMenu);
            } catch (e) {
                console.warn('Could not load existing menu', e);
            }
        };
        loadMenu();
    }, []);

    return (
        <AdminLayout activeTab="menu">
            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin — Browse Menu</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={saveMenu} className="text-white px-4 py-2 rounded-lg font-semibold" style={{ backgroundColor: 'var(--color-accent-primary)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}>Save Menu</button>
                    </div>
                </div>

                <div className="mb-6 flex items-center gap-3">
                    <button onClick={startCreateMain} className="text-white px-3 py-2 rounded" style={{ backgroundColor: 'var(--color-accent-primary)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}>Create Menu</button>
                    {isCreatingMain && (
                        <div className="flex items-center gap-2">
                            <input value={mainText} onChange={(e) => setMainText(e.target.value)} placeholder="Menu title" className="border px-2 py-1 rounded" style={{ borderColor: 'var(--color-border-light)' }} />
                            <input value={mainLink} onChange={(e) => setMainLink(e.target.value)} placeholder="Menu link (e.g. /category/slug or /custom)" className="border px-2 py-1 rounded" style={{ borderColor: 'var(--color-border-light)' }} />
                            <button onClick={confirmCreateMain} className="text-white px-3 py-1 rounded" style={{ backgroundColor: 'var(--color-accent-primary)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}>Add</button>
                            <button onClick={cancelCreateMain} className="px-3 py-1 border rounded" style={{ borderColor: 'var(--color-border-light)' }}>Cancel</button>
                        </div>
                    )}
                </div>

                <div className="p-6 rounded-lg shadow" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
                    <h2 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Menu Editor</h2>
                    {menuItems.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>No menu items yet — click "Create Menu" to add a top-level item.</p>
                    ) : (
                        <ul className="space-y-3">
                            {menuItems.map((item, idx) => (
                                <li key={item.id} className="border rounded-lg" style={{ borderColor: 'var(--color-border-light)' }}>
                                    <div className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                            <span style={{ color: 'var(--color-text-light)' }}><FaGripLines /></span>
                                            <div>
                                                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.name}</div>
                                                <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>link: <span style={{ color: 'var(--color-text-primary)' }}>{item.link}</span></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button onClick={() => move(idx, -1)} className="px-3 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}>Up</button>
                                            <button onClick={() => move(idx, 1)} className="px-3 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}>Down</button>
                                            <button onClick={() => startAddSub(item.id)} className="px-3 py-1 rounded" style={{ backgroundColor: 'var(--color-accent-light)', color: 'white' }}>Add Sub</button>
                                            <button onClick={() => toggleExpand(item.id)} className="px-3 py-1 rounded border" style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}>{expanded[item.id] ? <FaChevronUp /> : <FaChevronDown />}</button>
                                            <button onClick={() => removeFromMenu(item.id)} className="px-3 py-1 rounded flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-light)' }}><FaTrash /> Remove</button>
                                        </div>
                                    </div>

                                    {expanded[item.id] && (
                                        <div className="p-3 border-t" style={{ backgroundColor: 'var(--color-bg-section)', borderColor: 'var(--color-border-light)' }}>
                                            <div className="mb-3">
                                                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Submenus</div>
                                            </div>
                                            <ul className="space-y-2">
                                                {(item.sub || []).map((sub, sidx) => (
                                                    <li key={sub.id} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
                                                        <div>
                                                            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{sub.name}</div>
                                                            <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>link: <span style={{ color: 'var(--color-text-primary)' }}>{sub.link}</span></div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => moveSub(idx, sidx, -1)} className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}>Up</button>
                                                            <button onClick={() => moveSub(idx, sidx, 1)} className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}>Down</button>
                                                            <button onClick={() => removeSub(item.id, sub.id)} className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-light)' }}>Remove</button>
                                                        </div>
                                                    </li>
                                                ))}

                                                {addingSubFor === item.id ? (
                                                    <li className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                            <input value={addingSubText} onChange={(e) => setAddingSubText(e.target.value)} placeholder="Submenu text" className="border px-2 py-1 rounded" style={{ borderColor: 'var(--color-border-light)' }} />
                                                            <input value={addingSubLink} onChange={(e) => setAddingSubLink(e.target.value)} placeholder="Submenu link (e.g. /category/slug or /custom)" className="border px-2 py-1 rounded" style={{ borderColor: 'var(--color-border-light)' }} />
                                                            <div className="flex gap-2">
                                                                <button onClick={() => confirmAddSub(item.id)} className="text-white px-3 py-1 rounded" style={{ backgroundColor: 'var(--color-accent-primary)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}>Add</button>
                                                                <button onClick={cancelAddSub} className="px-3 py-1 border rounded" style={{ borderColor: 'var(--color-border-light)' }}>Cancel</button>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ) : null}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMenuPage;
