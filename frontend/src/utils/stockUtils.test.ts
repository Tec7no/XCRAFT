import { describe, it, expect } from 'vitest';
import { validateStock, decrementStock, getVariantAvailability } from './stockUtils';
import { Product, CartItem, makeVariantKey } from '../types';

describe('stockUtils', () => {
    // helpers
    const createProduct = (overrides?: Partial<Product>): Product => ({
        id: 'p1',
        name: 'Test Product',
        code: 'TP1',
        category: 'Men',
        stock: 10,
        salePrice: 100,
        originalPrice: 100,
        discount: 0,
        colors: [{ hex: '#000000', name: 'Black' }],
        sizes: ['M', 'L'],
        images: [],
        ...overrides,
    });

    const createCartItem = (overrides?: Partial<CartItem>): CartItem => ({
        ...createProduct(),
        quantity: 1,
        selectedColor: '#000000',
        selectedSize: 'M',
        ...overrides,
    });

    describe('validateStock', () => {
        it('should return valid if stock is sufficient', () => {
            const product = createProduct({
                variantStock: {
                    [makeVariantKey('M', '#000000')]: 5
                }
            });
            const item = createCartItem({ quantity: 2 });
            const result = validateStock([item], [product]);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should return invalid if variant stock is insufficient', () => {
            const product = createProduct({
                variantStock: {
                    [makeVariantKey('M', '#000000')]: 1
                }
            });
            const item = createCartItem({ quantity: 2 });
            const result = validateStock([item], [product]);
            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('only 1 available');
        });

        it('should handle missing product', () => {
            const item = createCartItem({ id: 'missing' });
            const result = validateStock([item], []);
            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('no longer available');
        });

        it('should fallback to total stock if variantStock is missing', () => {
            const product = createProduct({ stock: 5, variantStock: undefined });
            const item = createCartItem({ quantity: 10 });
            const result = validateStock([item], [product]);
            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('only 5 available');
        });
    });

    describe('decrementStock', () => {
        it('should decrement variant stock and update total stock', () => {
            const product = createProduct({
                variantStock: {
                    [makeVariantKey('M', '#000000')]: 10,
                    [makeVariantKey('L', '#000000')]: 5
                },
                stock: 15
            });
            const item = createCartItem({ quantity: 2 });

            const result = decrementStock([item], [product]);
            const updatedProduct = result[0];

            expect(updatedProduct.variantStock?.[makeVariantKey('M', '#000000')]).toBe(8);
            expect(updatedProduct.stock).toBe(13); // 8 + 5
        });

        it('should not mutate original product array', () => {
            const product = createProduct({ stock: 10 });
            const item = createCartItem({ quantity: 1 });
            const products = [product];

            decrementStock([item], products);
            expect(products[0].stock).toBe(10);
        });
    });

    describe('getVariantAvailability', () => {
        it('should return variant specific stock', () => {
            const product = createProduct({
                variantStock: {
                    [makeVariantKey('M', '#000000')]: 7
                }
            });
            expect(getVariantAvailability(product, 'M', '#000000')).toBe(7);
        });

        it('should return 0 if variant key does not exist', () => {
            const product = createProduct({
                variantStock: {}
            });
            expect(getVariantAvailability(product, 'M', '#000000')).toBe(0);
        });

        it('should fallback to total stock if variantStock is undefined', () => {
            const product = createProduct({ stock: 99, variantStock: undefined });
            expect(getVariantAvailability(product, 'M', '#000000')).toBe(99);
        });
    });
});
