import { Product, ColorOption, StockByColor, VariantStock, makeVariantKey, parseVariantKey } from '@/types';

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string | null, fallback: T): T {
    if (!json) return fallback;
    try {
        return JSON.parse(json) as T;
    } catch {
        console.warn('Failed to parse JSON, using fallback');
        return fallback;
    }
}

/**
 * Ensure value is an array, returns empty array if not
 */
export function ensureArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? value : [];
}

/**
 * Convert any legacy size format to simple string[]
 * Handles: SizeOption[], string[], comma-separated string
 */
function normalizeSizes(sizes: unknown): string[] {
    if (!sizes) return [];

    // Already a simple string array
    if (Array.isArray(sizes) && sizes.length > 0 && typeof sizes[0] === 'string') {
        return sizes.map(s => String(s).trim().toUpperCase()).filter(Boolean);
    }

    // Legacy SizeOption[] format (objects with label property)
    if (Array.isArray(sizes) && sizes.length > 0 && typeof sizes[0] === 'object' && sizes[0] !== null) {
        return sizes
            .filter(s => {
                // Only include enabled sizes from old format
                if ('enabled' in s && s.enabled === false) return false;
                if ('hidden' in s && s.hidden === true) return false;
                return true;
            })
            .map(s => String(s.label || s).trim().toUpperCase())
            .filter(Boolean);
    }

    // Legacy comma-separated string
    if (typeof sizes === 'string') {
        return sizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    }

    return [];
}

/**
 * Convert legacy color format (string[]) to ColorOption[]
 */
function normalizeColors(colors: unknown): ColorOption[] {
    if (!colors) return [];

    // Already an array of objects with hex property
    if (Array.isArray(colors) && colors.length > 0 && typeof colors[0] === 'object' && colors[0] !== null && 'hex' in colors[0]) {
        return colors.map(c => ({
            hex: String(c.hex || '#000000').toLowerCase(),
            name: c.name ? String(c.name) : undefined,
        }));
    }

    // Legacy string array format (hex values)
    if (Array.isArray(colors) && colors.length > 0 && typeof colors[0] === 'string') {
        return colors.map(c => ({
            hex: String(c).toLowerCase(),
            name: undefined,
        }));
    }

    // Legacy comma-separated string
    if (typeof colors === 'string') {
        return colors.split(',').filter(c => c.trim()).map(c => ({
            hex: c.trim().toLowerCase(),
            name: undefined,
        }));
    }

    return [];
}

/**
 * Migrate and normalize variant stock from various legacy formats
 * Priority: variantStock > stockByColor > stock
 */
function normalizeVariantStock(
    variantStock: unknown,
    stockByColor: unknown,
    sizes: string[],
    colors: ColorOption[],
    legacyStock: number
): VariantStock {
    const result: VariantStock = {};

    // No sizes or colors = empty variant stock
    if (sizes.length === 0 || colors.length === 0) {
        return result;
    }

    // Helper to ensure integer >= 0
    const safeInt = (val: unknown): number => {
        const n = Number(val);
        return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    };

    // Case 1: variantStock already exists - sync with current sizes/colors
    if (variantStock && typeof variantStock === 'object' && !Array.isArray(variantStock)) {
        const existing = variantStock as Record<string, unknown>;

        // Build result with only valid size+color combinations
        for (const size of sizes) {
            for (const color of colors) {
                const key = makeVariantKey(size, color.hex);
                result[key] = safeInt(existing[key]);
            }
        }
        return result;
    }

    // Case 2: stockByColor exists - migrate each color's stock to first size
    if (stockByColor && typeof stockByColor === 'object' && !Array.isArray(stockByColor)) {
        const sbc = stockByColor as StockByColor;
        const firstSize = sizes[0];

        for (const color of colors) {
            const hexLower = color.hex.toLowerCase();
            const colorStock = safeInt(sbc[hexLower]);

            for (const size of sizes) {
                const key = makeVariantKey(size, color.hex);
                // Assign color's stock to first size only, rest get 0
                result[key] = size === firstSize ? colorStock : 0;
            }
        }
        return result;
    }

    // Case 3: Only legacy stock number - assign to first variant
    const firstSize = sizes[0];
    const firstColor = colors[0];

    for (const size of sizes) {
        for (const color of colors) {
            const key = makeVariantKey(size, color.hex);
            // Assign all stock to first size + first color
            const isFirstVariant = size === firstSize && color.hex === firstColor.hex;
            result[key] = isFirstVariant ? safeInt(legacyStock) : 0;
        }
    }

    return result;
}

/**
 * Calculate total stock from variantStock
 */
export function calculateTotalStock(variantStock: VariantStock): number {
    return Object.values(variantStock).reduce((sum, qty) => sum + (qty || 0), 0);
}

/**
 * Get stock for a specific size+color variant
 */
export function getVariantStock(product: Product, size: string, hex: string): number {
    if (!product.variantStock) return 0;
    const key = makeVariantKey(size, hex);
    return product.variantStock[key] ?? 0;
}

/**
 * Normalize a single product to ensure all fields are valid
 */
export function normalizeProduct(product: unknown): Product | null {
    if (!product || typeof product !== 'object') return null;

    const p = product as Record<string, unknown>;

    const colors = normalizeColors(p.colors);
    const sizes = normalizeSizes(p.sizes);
    const legacyStock = Number(p.stock) || 0;
    const variantStock = normalizeVariantStock(p.variantStock, p.stockByColor, sizes, colors, legacyStock);
    const totalStock = calculateTotalStock(variantStock);

    return {
        id: String(p.id || `product-${Date.now()}`),
        name: String(p.name || 'Unnamed Product'),
        code: String(p.code || 'TT-000'),
        category: (p.category as Product['category']) || 'Men',
        stock: totalStock,
        salePrice: Number(p.salePrice) || 0,
        originalPrice: Number(p.originalPrice) || Number(p.salePrice) || 0,
        discount: Number(p.discount) || 0,
        description: p.description ? String(p.description) : undefined,
        instructions: p.instructions ? String(p.instructions) : undefined,
        colors,
        sizes,
        variantStock,
        images: ensureArray<string>(p.images).map(String),
        badge: p.badge as Product['badge'] ?? null,
        specifications: ensureArray<any>(p.specifications),
        sizeGuideImage: p.sizeGuideImage ? String(p.sizeGuideImage) : undefined,
        featuredIn: ensureArray<string>(p.featuredIn) as Product['featuredIn'],
    };
}

/**
 * Normalize an array of products
 */
export function normalizeProducts(products: unknown): Product[] {
    if (!Array.isArray(products)) return [];
    return products
        .map(normalizeProduct)
        .filter((p): p is Product => p !== null);
}

/**
 * Site settings normalization for drafts/published data
 */
export function normalizeSiteDraft<T extends object>(draft: unknown, defaults: T): T {
    if (!draft || typeof draft !== 'object') return defaults;

    // Merge with defaults to ensure all fields exist
    return { ...defaults, ...(draft as T) };
}

/**
 * Clear all app-specific localStorage keys (for dev reset)
 */
export function clearAppData(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.startsWith('townteam_') ||
            key.startsWith('XCRAFT_') ||
            key === 'fox_lang'
        )) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Failed to remove key:', key, e);
        }
    });

    console.log('Cleared app data keys:', keysToRemove);
}
