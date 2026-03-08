/**
 * Stock Utilities - Validate and decrement variant stock matrix
 */

import { CartItem, Product, makeVariantKey } from '@/types';

export interface StockValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate that all cart items have sufficient variant stock
 */
export function validateStock(
    cart: CartItem[],
    products: Product[]
): StockValidationResult {
    const errors: string[] = [];

    for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (!product) {
            errors.push(`Product "${item.name}" is no longer available`);
            continue;
        }

        // Check variant stock (Size × Color)
        if (product.variantStock) {
            const key = makeVariantKey(item.selectedSize, item.selectedColor);
            const available = product.variantStock[key] ?? 0;

            if (available < item.quantity) {
                errors.push(
                    `"${item.name}" (${item.selectedSize}/${item.selectedColor}) - only ${available} available, you requested ${item.quantity}`
                );
            }
        } else {
            // Fallback to total stock check
            if (product.stock < item.quantity) {
                errors.push(
                    `"${item.name}" - only ${product.stock} available, you requested ${item.quantity}`
                );
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Decrement stock for each cart item
 * Returns updated products array
 */
export function decrementStock(
    cart: CartItem[],
    products: Product[]
): Product[] {
    // Create a deep copy to avoid mutation
    const updated = products.map(p => ({
        ...p,
        variantStock: p.variantStock ? { ...p.variantStock } : undefined,
    }));

    for (const item of cart) {
        const productIdx = updated.findIndex(p => p.id === item.id);
        if (productIdx === -1) continue;

        const product = updated[productIdx];

        // Decrement variant stock
        if (product.variantStock) {
            const key = makeVariantKey(item.selectedSize, item.selectedColor);
            const current = product.variantStock[key] ?? 0;
            product.variantStock[key] = Math.max(0, current - item.quantity);

            // Recalculate total stock
            product.stock = Object.values(product.variantStock).reduce(
                (sum, qty) => sum + (qty || 0),
                0
            );
        } else {
            // Fallback to simple stock decrement
            product.stock = Math.max(0, product.stock - item.quantity);
        }
    }

    return updated;
}

/**
 * Get available quantity for a specific variant
 */
export function getVariantAvailability(
    product: Product,
    size: string,
    color: string
): number {
    if (!product.variantStock) {
        return product.stock;
    }

    const key = makeVariantKey(size, color);
    return product.variantStock[key] ?? 0;
}
