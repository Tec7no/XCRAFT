import { useState, useEffect } from 'react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

export const useProducts = () => {
    // Products should be read-only from localStorage - only admin can modify them
    // But we need to reload when admin changes them
    const [products, setProducts] = useState<Product[]>(() => {
        try {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('townteam_products');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return (Array.isArray(parsed) && parsed.length > 0) ? parsed : INITIAL_PRODUCTS;
                }
            }
        } catch (e) {
            console.warn('Failed to load products from localStorage:', e);
        }
        return INITIAL_PRODUCTS;
    });

    // Listen for product changes from admin
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent | Event) => {
            if (e instanceof StorageEvent) {
                if (e.key === 'townteam_products') {
                    try {
                        const stored = localStorage.getItem('townteam_products');
                        if (stored) {
                            const parsed = JSON.parse(stored);
                            if (Array.isArray(parsed)) {
                                setProducts(parsed);
                            }
                        }
                    } catch (err) {
                        console.warn('Failed to reload products:', err);
                    }
                }
            } else if (e.type === 'townteam_storage') {
                const customEvent = e as CustomEvent;
                if (customEvent.detail && customEvent.detail.key === 'townteam_products') {
                    try {
                        const stored = localStorage.getItem('townteam_products');
                        if (stored) {
                            const parsed = JSON.parse(stored);
                            if (Array.isArray(parsed)) {
                                setProducts(parsed);
                            }
                        }
                    } catch (err) {
                        console.warn('Failed to reload products:', err);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('townteam_storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('townteam_storage', handleStorageChange);
        };
    }, []);

    return products;
};
