import { Product } from "@/types";

export interface FilterState {
    categories: string[];
    price: [number, number];
    sizes: string[];
    colors: string[];
    inStockOnly: boolean;
}

export const initialFilterState: FilterState = {
    categories: [],
    price: [0, 10000], // Default max, will be updated dynamically
    sizes: [],
    colors: [],
    inStockOnly: false,
};

export const toggleArrayValue = <T>(array: T[], value: T): T[] => {
    return array.includes(value)
        ? array.filter((item) => item !== value)
        : [...array, value];
};

export const getMinMaxPrice = (products: Product[]): [number, number] => {
    if (!Array.isArray(products) || products.length === 0) return [0, 0];
    const prices = products.map((p) => p.salePrice ?? 0);
    return [Math.min(...prices), Math.max(...prices)];
};

export const getUniqueCategories = (products: Product[]): string[] => {
    if (!Array.isArray(products)) return ["Men", "Women", "Kids"];
    // Manual categories from requirements + dynamic ones
    const fixed = ["Men", "Women", "Kids", "New", "Offers"];
    const dynamic = Array.from(new Set(products.map((p) => p.category)));
    // Merge and dedupe, keeping fixed order preference
    return Array.from(new Set([...fixed, ...dynamic]));
};

export const getUniqueSizes = (products: Product[]): string[] => {
    const sizes = new Set<string>();
    if (!Array.isArray(products)) return [];

    products.forEach((p) => {
        // Handle both legacy string[] and new SizeOption[] formats
        const productSizes = Array.isArray(p.sizes) ? p.sizes : [];
        productSizes.forEach((s) => {
            if (typeof s === 'string') {
                sizes.add(s);
            } else if (s && typeof s === 'object' && 'label' in s) {
                sizes.add(String((s as any).label));
            }
        });
    });

    // Sort logic (XS, S, M, L, XL, XXL)
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
    return Array.from(sizes).sort((a, b) => {
        const indexA = sizeOrder.indexOf(a);
        const indexB = sizeOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
};

export const getUniqueColors = (products: Product[]): string[] => {
    const colors = new Set<string>();
    if (!Array.isArray(products)) return [];

    products.forEach((p) => {
        // Handle both legacy string[] and new ColorOption[] formats
        const productColors = Array.isArray(p.colors) ? p.colors : [];
        productColors.forEach((c) => {
            if (typeof c === 'string') {
                colors.add(c);
            } else if (c && typeof c === 'object' && 'hex' in c) {
                colors.add(String(c.hex));
            }
        });
    });

    return Array.from(colors);
};

