import { useEffect } from 'react';
import { INITIAL_PRODUCTS } from '../constants';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { Product } from '../types';

/**
 * Hook to ensure INITIAL_PRODUCTS are always present in localStorage
 * Merges INITIAL_PRODUCTS with existing products (no duplicates)
 */
export const useInitializeProducts = () => {
    useEffect(() => {
        const existingProducts = getStorageItem<Product[]>('products', []);

        // If no products at all, just set INITIAL_PRODUCTS
        if (existingProducts.length === 0) {
            setStorageItem('products', INITIAL_PRODUCTS);
            return;
        }

        // Helper to migrate legacy products to multi-language structure
        const migrateProduct = (p: Product): Product => {
            return {
                ...p,
                name_ar: p.name_ar || p.name,
                description_ar: p.description_ar || p.description,
                specifications: p.specifications?.map(s => ({
                    ...s,
                    title_ar: s.title_ar || s.title,
                    items: s.items.map(item => ({
                        ...item,
                        label_ar: item.label_ar || item.label,
                        value_ar: item.value_ar || item.value
                    }))
                }))
            };
        };

        // Merge: Add any INITIAL_PRODUCTS that don't exist yet, or update if paths changed
        let updated = false;
        const mergedProducts = existingProducts.map(migrateProduct);

        INITIAL_PRODUCTS.forEach(initial => {
            const index = mergedProducts.findIndex(p => p.id === initial.id);
            if (index === -1) {
                mergedProducts.push(initial);
                updated = true;
            } else {
                const existing = mergedProducts[index];

                // Update: Always merge existing user data over initial constants to preserve edits.
                // Deep merge specifications to ensure translations are preserved.
                const mergedSpecs = initial.specifications?.map(initialSpec => {
                    const existingSpec = existing.specifications?.find(s => s.id === initialSpec.id);
                    if (!existingSpec) return initialSpec;

                    return {
                        ...initialSpec,
                        ...existingSpec,
                        title_en: existingSpec.title_en || initialSpec.title_en,
                        title_ar: existingSpec.title_ar || initialSpec.title_ar,
                        items: initialSpec.items.map(initialItem => {
                            const existingItem = existingSpec.items.find(item => item.label === initialItem.label);
                            if (!existingItem) return initialItem;

                            return {
                                ...initialItem,
                                ...existingItem,
                                label_en: existingItem.label_en || initialItem.label_en,
                                label_ar: existingItem.label_ar || initialItem.label_ar,
                                value_en: existingItem.value_en || initialItem.value_en,
                                value_ar: existingItem.value_ar || initialItem.value_ar
                            };
                        })
                    };
                });

                mergedProducts[index] = {
                    ...initial,
                    ...existing,
                    name_en: existing.name_en || initial.name_en,
                    name_ar: existing.name_ar || initial.name_ar,
                    description_en: existing.description_en || initial.description_en,
                    description_ar: existing.description_ar || initial.description_ar,
                    specifications: mergedSpecs
                };

                if (JSON.stringify(existing) !== JSON.stringify(mergedProducts[index])) {
                    updated = true;
                }
            }
        });

        if (updated) {
            setStorageItem('products', mergedProducts);
            console.log(`✅ Synced demo products to latest versions`);
        }
    }, []); // Run once on mount
};
