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
                    <h1 className="text-3xl font-bold">Admin — Browse Menu</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={saveMenu} className="bg-black text-white px-4 py-2 rounded-lg font-semibold">Save Menu</button>
                    </div>
                </div>

                <div className="mb-6 flex items-center gap-3">
                    <button onClick={startCreateMain} className="bg-black text-white px-3 py-2 rounded">Create Menu</button>
                    {isCreatingMain && (
                        <div className="flex items-center gap-2">
                            <input value={mainText} onChange={(e) => setMainText(e.target.value)} placeholder="Menu title" className="border px-2 py-1 rounded" />
                            <input value={mainLink} onChange={(e) => setMainLink(e.target.value)} placeholder="Menu link (e.g. /category/slug or /custom)" className="border px-2 py-1 rounded" />
                            <button onClick={confirmCreateMain} className="bg-black text-white px-3 py-1 rounded">Add</button>
                            <button onClick={cancelCreateMain} className="px-3 py-1 border rounded">Cancel</button>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="font-bold mb-4">Menu Editor</h2>
                    {menuItems.length === 0 ? (
                        <p className="text-sm text-gray-900">No menu items yet — click "Create Menu" to add a top-level item.</p>
                    ) : (
                        <ul className="space-y-3">
                            {menuItems.map((item, idx) => (
                                <li key={item.id} className="border rounded-lg">
                                    <div className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400"><FaGripLines /></span>
                                            <div>
                                                <div className="font-semibold">{item.name}</div>
                                                <div className="text-xs text-gray-900">link: <span className="text-black">{item.link}</span></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button onClick={() => move(idx, -1)} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Up</button>
                                            <button onClick={() => move(idx, 1)} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Down</button>
                                            <button onClick={() => startAddSub(item.id)} className="px-3 py-1 bg-gray-200 text-black rounded">Add Sub</button>
                                            <button onClick={() => toggleExpand(item.id)} className="px-3 py-1 bg-gray-50 rounded border">{expanded[item.id] ? <FaChevronUp /> : <FaChevronDown />}</button>
                                            <button onClick={() => removeFromMenu(item.id)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"><FaTrash /> Remove</button>
                                        </div>
                                    </div>

                                    {expanded[item.id] && (
                                        <div className="p-3 border-t bg-gray-50">
                                            <div className="mb-3">
                                                <div className="font-semibold">Submenus</div>
                                            </div>
                                            <ul className="space-y-2">
                                                {(item.sub || []).map((sub, sidx) => (
                                                    <li key={sub.id} className="flex items-center justify-between bg-white p-2 rounded">
                                                        <div>
                                                            <div className="font-medium">{sub.name}</div>
                                                            <div className="text-xs text-gray-900">link: <span className="text-black">{sub.link}</span></div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => moveSub(idx, sidx, -1)} className="px-2 py-1 bg-gray-100 rounded">Up</button>
                                                            <button onClick={() => moveSub(idx, sidx, 1)} className="px-2 py-1 bg-gray-100 rounded">Down</button>
                                                            <button onClick={() => removeSub(item.id, sub.id)} className="px-2 py-1 bg-gray-100 text-gray-700 rounded">Remove</button>
                                                        </div>
                                                    </li>
                                                ))}

                                                {addingSubFor === item.id ? (
                                                    <li className="bg-white p-3 rounded">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                            <input value={addingSubText} onChange={(e) => setAddingSubText(e.target.value)} placeholder="Submenu text" className="border px-2 py-1 rounded" />
                                                            <input value={addingSubLink} onChange={(e) => setAddingSubLink(e.target.value)} placeholder="Submenu link (e.g. /category/slug or /custom)" className="border px-2 py-1 rounded" />
                                                            <div className="flex gap-2">
                                                                <button onClick={() => confirmAddSub(item.id)} className="bg-black text-white px-3 py-1 rounded">Add</button>
                                                                <button onClick={cancelAddSub} className="px-3 py-1 border rounded">Cancel</button>
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
