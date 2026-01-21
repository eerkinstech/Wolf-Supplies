import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export const usePageSections = (pageName = 'home') => {
    // Initialize state with default values
    const [sections, setSectionsState] = useState(() => {
        try {
            const stored = localStorage.getItem(`page-${pageName}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed;
            }
        } catch (e) {
            // Silently fail and use defaults
        }

        const defaults = getDefaultSections(pageName);
        return defaults;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchAttempted = useRef(false);

    // Only try to load from API once on mount
    useEffect(() => {
        if (fetchAttempted.current) return;
        fetchAttempted.current = true;

        const loadFromAPI = async () => {
            try {
                const response = await axios.get(`${API}/api/page-config/${pageName}`);
                const data = response.data;
                if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
                    setSectionsState(data.sections);
                    localStorage.setItem(`page-${pageName}`, JSON.stringify(data.sections));
                    return;
                }
            } catch (err) {
            }
        };

        loadFromAPI();
    }, [pageName]);

    const setSections = useCallback((newSections) => {
        setSectionsState(newSections);
        try {
            localStorage.setItem(`page-${pageName}`, JSON.stringify(newSections));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }, [pageName]);

    const saveSections = useCallback(async (customSections = null) => {
        const toSave = customSections || sections;

        // Always save to localStorage first
        try {
            localStorage.setItem(`page-${pageName}`, JSON.stringify(toSave));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }

        // Try to save to API (but don't fail if it doesn't work)
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API}/api/page-config/${pageName}`, {
                pageName,
                sections: toSave
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
        } catch (err) {
        }

        return toSave;
    }, [sections, pageName]);

    return {
        sections,
        setSections,
        saveSections,
        loading,
        error
    };
};

// Default sections for home page
const getDefaultSections = (pageName) => {
    if (pageName === 'home') {
        return [
            {
                id: 'slider-1',
                type: 'slider',
                order: 0,
                visible: true,
                content: {
                    slides: [
                        {
                            id: 1,
                            title: 'Daily Grocery Order',
                            description: 'Fresh products delivered to your doorstep in 30 minutes',
                            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60'
                        },
                        {
                            id: 2,
                            title: 'Electronics Sale',
                            description: 'Best deals on latest gadgets and devices',
                            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=60'
                        },
                        {
                            id: 3,
                            title: 'Fashion Week',
                            description: 'Latest trends and styles from top brands',
                            image: 'https://plus.unsplash.com/premium_photo-1724220740325-5c95c8bfad59?w=600&auto=format&fit=crop&q=60'
                        }
                    ]
                }
            },
            {
                id: 'features-1',
                type: 'features',
                order: 1,
                visible: true,
                content: {
                    title: 'Why Choose Us',
                    items: [
                        { id: 1, title: 'Fast Delivery', description: '30 minutes or less' },
                        { id: 2, title: 'Best Prices', description: 'Competitive pricing' },
                        { id: 3, title: 'Quality Products', description: '100% authentic' }
                    ]
                }
            },
            {
                id: 'products-1',
                type: 'products',
                order: 2,
                visible: true,
                content: {
                    title: 'Featured Products',
                    limit: 8
                }
            },
            {
                id: 'categories-1',
                type: 'categories',
                order: 3,
                visible: true,
                content: {
                    title: 'Shop by Category',
                    limit: 6
                }
            },
            {
                id: 'newsletter-1',
                type: 'newsletter',
                order: 4,
                visible: true,
                content: {
                    title: 'Subscribe to Our Newsletter',
                    description: 'Get exclusive deals and updates'
                }
            }
        ];
    }

    return [];
};
