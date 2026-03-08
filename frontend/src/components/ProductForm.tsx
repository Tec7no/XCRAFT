import * as React from 'react';
import { X, Save, Upload, Plus } from './icons';
import { Trash2 } from 'lucide-react';
import { Product, Category, ColorOption, VariantStock, makeVariantKey } from '../types';
import { useToast } from '@/hooks/use-toast';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Default sizes list
const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Color palette for quick selection
const COLOR_PALETTE = [
    { hex: '#000000', name: 'Black' },
    { hex: '#ffffff', name: 'White' },
    { hex: '#1a2b56', name: 'Navy' },
    { hex: '#f37021', name: 'Orange' },
    { hex: '#6b7280', name: 'Gray' },
    { hex: '#8b5a2b', name: 'Brown' },
    { hex: '#556b2f', name: 'Olive' },
    { hex: '#722f37', name: 'Burgundy' },
    { hex: '#fffdd0', name: 'Cream' },
    { hex: '#36454f', name: 'Charcoal' },
    { hex: '#b1121a', name: 'Red' },
    { hex: '#3a2d23', name: 'Dark Brown' },
    { hex: '#f6efea', name: 'Off White' },
    { hex: '#d8c6bb', name: 'Tan' },
    { hex: '#4169e1', name: 'Royal Blue' },
    { hex: '#228b22', name: 'Forest Green' },
];

// Helper to round to 2 decimal places
const roundTo2 = (num: number) => Math.round(num * 100) / 100;

// Helper to calculate sale price from original price and discount
const calculateSalePrice = (originalPrice: number, discountPercent: number): number => {
    if (!originalPrice || originalPrice <= 0) return 0;
    const clampedDiscount = Math.min(95, Math.max(0, discountPercent));
    return roundTo2(originalPrice * (1 - clampedDiscount / 100));
};

// Calculate total stock from variantStock
const calculateTotalStock = (variantStock: VariantStock): number => {
    return Object.values(variantStock).reduce((sum, qty) => sum + (qty || 0), 0);
};

// Sync variantStock with current sizes and colors (add missing, remove stale)
const syncVariantStock = (
    sizes: string[],
    colors: ColorOption[],
    currentStock: VariantStock
): VariantStock => {
    const result: VariantStock = {};
    for (const size of sizes) {
        for (const color of colors) {
            const key = makeVariantKey(size, color.hex);
            result[key] = typeof currentStock[key] === 'number' ? currentStock[key] : 0;
        }
    }
    return result;
};

interface ProductFormProps {
    product: Product | null;
    isAdding: boolean;
    onSave: (product: Product) => void;
    onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
    product: initialProduct,
    isAdding,
    onSave,
    onCancel
}) => {
    const { toast } = useToast();
    const [product, setProduct] = React.useState<Product>(() => {
        if (initialProduct) {
            return {
                ...initialProduct,
                sizes: Array.isArray(initialProduct.sizes) ? initialProduct.sizes : [],
                colors: Array.isArray(initialProduct.colors) ? initialProduct.colors : [],
                variantStock: initialProduct.variantStock || {},
                specifications: initialProduct.specifications || []
            };
        }
        // Default product for adding new
        return {
            id: '',
            name: '',
            name_ar: '',
            name_en: '',
            code: '',
            category: 'Men' as Category,
            originalPrice: 0,
            salePrice: 0,
            discount: 0,
            stock: 0,
            images: [],
            description: '',
            description_ar: '',
            description_en: '',
            sizes: [],
            colors: [],
            variantStock: {},
            specifications: [],
            featuredIn: []
        };
    });
    const [imageUrlInput, setImageUrlInput] = React.useState('');
    const [customSizeInput, setCustomSizeInput] = React.useState('');
    const [showCustomSizeDialog, setShowCustomSizeDialog] = React.useState(false);
    const [sizeError, setSizeError] = React.useState('');
    const [customColorHex, setCustomColorHex] = React.useState('#000000');
    const [customColorName, setCustomColorName] = React.useState('');
    const [showCustomColorDialog, setShowCustomColorDialog] = React.useState(false);
    const [colorError, setColorError] = React.useState('');
    const modalRef = React.useRef<HTMLFormElement | null>(null);

    // Auto-calculate sale price when originalPrice or discount changes
    React.useEffect(() => {
        const newSalePrice = calculateSalePrice(product.originalPrice, product.discount);
        if (newSalePrice !== product.salePrice) {
            setProduct(prev => ({ ...prev, salePrice: newSalePrice }));
        }
    }, [product.originalPrice, product.discount]);

    // Sync variantStock whenever sizes or colors change
    React.useEffect(() => {
        setProduct(prev => {
            const synced = syncVariantStock(prev.sizes, prev.colors, prev.variantStock || {});
            const newTotal = calculateTotalStock(synced);
            return { ...prev, variantStock: synced, stock: newTotal };
        });
    }, [product.sizes.length, product.colors.length]);

    // Focus trap
    React.useEffect(() => {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.[0]?.focus();
    }, []);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProduct(prev => {
                    if (prev.images.includes(base64String)) return prev;
                    return { ...prev, images: [...prev.images, base64String] };
                });
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    // Handle add image URL
    const handleAddImageUrl = () => {
        const trimmed = imageUrlInput.trim();
        if (!trimmed) return;
        if (product.images.includes(trimmed)) {
            setImageUrlInput('');
            toast({ title: "Duplicate", description: "Image already added", variant: "destructive" });
            return;
        }
        setProduct({ ...product, images: [...product.images, trimmed] });
        setImageUrlInput('');
    };

    // ===== SIZES (chip-based selection like colors) =====
    // Helper: safely get string from size (handles legacy SizeOption objects)
    const getSizeLabel = (size: unknown): string => {
        if (typeof size === 'string') return size;
        if (size && typeof size === 'object' && 'label' in size) {
            return String((size as { label: unknown }).label);
        }
        return String(size ?? '');
    };

    const isSizeSelected = (label: string) =>
        (product.sizes ?? []).some(s => getSizeLabel(s).toUpperCase() === label.toUpperCase());

    const toggleSize = (label: string) => {
        const normalized = label.toUpperCase();
        if (isSizeSelected(normalized)) {
            setProduct(prev => ({
                ...prev,
                sizes: (prev.sizes ?? []).filter(s => getSizeLabel(s).toUpperCase() !== normalized)
            }));
        } else {
            setProduct(prev => ({
                ...prev,
                sizes: [...(prev.sizes ?? []), normalized]
            }));
        }
    };

    const removeSize = (label: string) => {
        setProduct(prev => ({
            ...prev,
            sizes: (prev.sizes ?? []).filter(s => getSizeLabel(s).toUpperCase() !== label.toUpperCase())
        }));
    };

    const handleAddCustomSize = () => {
        const trimmed = customSizeInput.trim();
        // Preserve numeric sizes as-is, otherwise uppercase
        const normalized = /^\d+$/.test(trimmed) ? trimmed : trimmed.toUpperCase();

        // Validation
        if (!normalized) {
            setSizeError('Size cannot be empty');
            return;
        }
        if (normalized.length > 8) {
            setSizeError('Max 8 characters');
            return;
        }
        if (isSizeSelected(normalized)) {
            setSizeError('Size already exists');
            return;
        }

        // Add and select the new size
        setProduct(prev => ({
            ...prev,
            sizes: [...(prev.sizes ?? []), normalized]
        }));
        setCustomSizeInput('');
        setSizeError('');
        setShowCustomSizeDialog(false);
    };

    // ===== COLORS =====
    const isColorSelected = (hex: string) =>
        product.colors.some(c => c.hex.toLowerCase() === hex.toLowerCase());

    const toggleColor = (hex: string, name?: string) => {
        const normalizedHex = hex.toLowerCase();
        const exists = isColorSelected(hex);

        if (exists) {
            setProduct(prev => ({
                ...prev,
                colors: prev.colors.filter(c => c.hex.toLowerCase() !== normalizedHex)
            }));
        } else {
            setProduct(prev => ({
                ...prev,
                colors: [...prev.colors, { hex: normalizedHex, name }]
            }));
        }
    };

    const handleAddCustomColor = () => {
        const normalizedHex = customColorHex.trim().toLowerCase();

        // Validate hex format (#rrggbb or #rgb)
        const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        if (!hexRegex.test(normalizedHex)) {
            setColorError('Invalid hex format (e.g. #ff0000)');
            return;
        }

        // Normalize short hex (#rgb) to full (#rrggbb)
        let fullHex = normalizedHex;
        if (normalizedHex.length === 4) {
            fullHex = `#${normalizedHex[1]}${normalizedHex[1]}${normalizedHex[2]}${normalizedHex[2]}${normalizedHex[3]}${normalizedHex[3]}`;
        }

        // Check for duplicate
        if (isColorSelected(fullHex)) {
            setColorError('Color already added');
            return;
        }

        // Add and select the new color
        setProduct(prev => ({
            ...prev,
            colors: [...prev.colors, { hex: fullHex, name: customColorName.trim() || undefined }]
        }));
        setCustomColorHex('#000000');
        setCustomColorName('');
        setColorError('');
        setShowCustomColorDialog(false);
    };

    const removeColor = (hex: string) => {
        setProduct(prev => ({
            ...prev,
            colors: prev.colors.filter(c => c.hex.toLowerCase() !== hex.toLowerCase())
        }));
    };

    // ===== VARIANT STOCK MATRIX =====
    const handleVariantStockChange = (size: string, hex: string, value: number) => {
        const key = makeVariantKey(size, hex);
        const intValue = Math.max(0, Math.floor(value || 0));
        setProduct(prev => {
            const newVariantStock = { ...prev.variantStock, [key]: intValue };
            return {
                ...prev,
                variantStock: newVariantStock,
                stock: calculateTotalStock(newVariantStock)
            };
        });
    };

    // Handle discount change with clamping
    const handleDiscountChange = (value: number) => {
        const clamped = Math.min(95, Math.max(0, value));
        setProduct(prev => ({ ...prev, discount: clamped }));
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (product.images.length === 0) {
            toast({ title: "Error", description: "At least one image is required", variant: "destructive" });
            return;
        }

        if (product.colors.length === 0) {
            toast({ title: "Error", description: "At least one color is required", variant: "destructive" });
            return;
        }

        if (product.sizes.length === 0) {
            toast({ title: "Error", description: "At least one size is required", variant: "destructive" });
            return;
        }

        // Prepare final product with synced variantStock
        const variantStock = syncVariantStock(product.sizes, product.colors, product.variantStock || {});
        const finalProduct: Product = {
            ...product,
            originalPrice: Math.max(0, Number(product.originalPrice) || 0),
            discount: Math.min(95, Math.max(0, Number(product.discount) || 0)),
            salePrice: calculateSalePrice(product.originalPrice, product.discount),
            variantStock,
            stock: calculateTotalStock(variantStock),
            id: isAdding ? `tt-${Date.now()}` : product.id
        };

        onSave(finalProduct);
    };

    const totalStock = calculateTotalStock(product.variantStock || {});

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm pointer-events-auto" onClick={onCancel} />
            <form
                onSubmit={handleSubmit}
                ref={modalRef}
                className="relative z-[1] bg-card w-full max-w-2xl p-8 rounded-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center border-b border-border pb-4">
                    <h3 className="text-xl font-black text-primary uppercase tracking-tighter">
                        {isAdding ? 'Add Product' : 'Edit Product'}
                    </h3>
                    <button type="button" aria-label="Close" onClick={onCancel}>
                        <X size={24} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Images Section */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Images</label>
                        <div className="flex flex-wrap gap-4">
                            {product.images.map((img, idx) => (
                                <div key={idx} className="relative group/img w-20 h-24 border border-border rounded overflow-hidden">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setProduct({ ...product, images: product.images.filter((_, i) => i !== idx) })}
                                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            <label className="w-20 h-24 border-2 border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:border-secondary transition-all">
                                <Upload size={18} className="text-muted-foreground" />
                                <span className="text-[8px] font-black uppercase text-muted-foreground mt-1">Upload</span>
                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                placeholder="Or paste image URL"
                                className="flex-1 bg-muted border border-border p-3 text-xs font-bold rounded outline-none focus:border-secondary"
                            />
                            <button type="button" onClick={handleAddImageUrl} className="px-4 bg-secondary text-secondary-foreground text-[10px] font-black uppercase tracking-widest rounded">
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground">Name (العربية)</label>
                            <input required value={product.name_ar || product.name} onChange={e => setProduct({ ...product, name_ar: e.target.value, name: e.target.value })} className="w-full bg-muted border border-border p-3 text-xs font-bold uppercase rounded outline-none focus:border-secondary" dir="rtl" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground">Name (English)</label>
                            <input required value={product.name_en || ''} onChange={e => setProduct({ ...product, name_en: e.target.value })} className="w-full bg-muted border border-border p-3 text-xs font-bold uppercase rounded outline-none focus:border-secondary" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground">SKU</label>
                            <input required value={product.code} onChange={e => setProduct({ ...product, code: e.target.value })} className="w-full bg-muted border border-border p-3 text-xs font-bold uppercase rounded outline-none focus:border-secondary" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground">Category</label>
                            <select value={product.category} onChange={e => setProduct({ ...product, category: e.target.value as Category })} className="w-full bg-muted border border-border p-3 text-xs font-bold uppercase rounded outline-none focus:border-secondary">
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Kids">Kids</option>
                            </select>
                        </div>

                        {/* Description Field */}
                        {/* Description Fields */}
                        <div className="space-y-1 col-span-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground">Description (العربية)</label>
                                    <textarea
                                        value={product.description_ar || product.description || ''}
                                        onChange={e => setProduct({ ...product, description_ar: e.target.value, description: e.target.value })}
                                        className="w-full bg-muted border border-border p-3 text-xs font-bold rounded outline-none focus:border-secondary min-h-[100px] resize-y"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground">Description (English)</label>
                                    <textarea
                                        value={product.description_en || ''}
                                        onChange={e => setProduct({ ...product, description_en: e.target.value })}
                                        className="w-full bg-muted border border-border p-3 text-xs font-bold rounded outline-none focus:border-secondary min-h-[100px] resize-y"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Special Collections Section */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Special Collections</label>
                        <div className="flex flex-wrap gap-4">
                            {['Best Sellers', 'New Arrivals', 'Offers'].map((collection) => (
                                <label key={collection} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={(product.featuredIn || []).includes(collection as any)}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setProduct(prev => {
                                                const current = prev.featuredIn || [];
                                                if (checked) {
                                                    return { ...prev, featuredIn: [...current, collection as any] };
                                                } else {
                                                    return { ...prev, featuredIn: current.filter(c => c !== collection) };
                                                }
                                            });
                                        }}
                                        className="w-4 h-4 rounded border-border text-secondary focus:ring-secondary"
                                    />
                                    <span className="text-xs font-bold uppercase group-hover:text-secondary transition-colors">
                                        {collection}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="text-[8px] text-muted-foreground">Select where this product should appear in the store.</p>
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Pricing</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground">Original Price</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={product.originalPrice ? Number(product.originalPrice) : ''}
                                    onChange={e => setProduct({ ...product, originalPrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                                    className="w-full bg-muted border border-border p-3 text-xs font-bold rounded outline-none focus:border-secondary"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground">Discount %</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="95"
                                    value={product.discount ? Number(product.discount) : ''}
                                    onChange={e => handleDiscountChange(e.target.value === '' ? 0 : Number(e.target.value))}
                                    className="w-full bg-muted border border-border p-3 text-xs font-bold rounded outline-none focus:border-secondary"
                                />
                                <p className="text-[8px] text-muted-foreground">Max 95%</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground">Sale Price</label>
                                <input
                                    type="number"
                                    readOnly
                                    value={product.salePrice}
                                    className="w-full bg-muted/50 border border-border p-3 text-xs font-bold rounded outline-none cursor-not-allowed text-secondary"
                                />
                                <p className="text-[8px] text-muted-foreground">Auto-calculated</p>
                            </div>
                        </div>
                    </div>

                    {/* Sizes Section - Chip-based like Colors */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sizes</label>

                        {/* Size Chips Palette */}
                        <div className="flex flex-wrap gap-2">
                            {DEFAULT_SIZES.map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`
                                        w-10 h-10 rounded-full border-2 transition-all font-bold text-xs uppercase
                                        ${isSizeSelected(size)
                                            ? 'border-foreground bg-foreground text-background ring-2 ring-foreground ring-offset-1'
                                            : 'border-border bg-background text-foreground hover:border-foreground'
                                        }
                                    `}
                                >
                                    {size}
                                </button>
                            ))}

                            {/* Add Custom Size */}
                            <Popover open={showCustomSizeDialog} onOpenChange={setShowCustomSizeDialog}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="relative z-20 w-10 h-10 rounded-full border-2 border-dashed border-[#d8c6bb] flex items-center justify-center text-muted-foreground hover:border-[#b1121a] hover:text-[#b1121a] transition-all bg-white"
                                        title="Add custom size"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-52 p-3">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">New Size</p>
                                        <input
                                            type="text"
                                            value={customSizeInput}
                                            onChange={(e) => { setCustomSizeInput(e.target.value); setSizeError(''); }}
                                            placeholder="e.g., XXXL or 42"
                                            maxLength={8}
                                            className={`w-full bg-muted border p-2 text-xs font-bold uppercase rounded outline-none focus:border-secondary ${sizeError ? 'border-destructive' : 'border-border'}`}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSize())}
                                            autoFocus
                                        />
                                        {sizeError && (
                                            <p className="text-[10px] text-destructive font-medium">{sizeError}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { setShowCustomSizeDialog(false); setCustomSizeInput(''); setSizeError(''); }}
                                                className="flex-1 bg-muted text-muted-foreground py-2 text-[10px] font-bold uppercase rounded border border-border hover:bg-background"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddCustomSize}
                                                className="flex-1 bg-secondary text-secondary-foreground py-2 text-[10px] font-black uppercase rounded"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Selected Sizes List */}
                        {(product.sizes ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                                {(product.sizes ?? []).map((size, idx) => {
                                    const sizeLabel = getSizeLabel(size);
                                    return (
                                        <div
                                            key={sizeLabel || idx}
                                            className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs font-bold border border-border"
                                        >
                                            <span className="uppercase text-foreground">{sizeLabel}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSize(sizeLabel)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <p className="text-[8px] text-muted-foreground">Click to select/deselect. Selected: {(product.sizes ?? []).length}</p>
                    </div>

                    {/* Colors Section */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Colors</label>

                        {/* Color Palette */}
                        <div className="flex flex-wrap gap-2">
                            {COLOR_PALETTE.map((color) => (
                                <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => toggleColor(color.hex, color.name)}
                                    title={color.name}
                                    className={`
                                        w-8 h-8 rounded-full border-2 transition-all hover:scale-110
                                        ${isColorSelected(color.hex)
                                            ? 'border-foreground ring-2 ring-foreground ring-offset-2'
                                            : 'border-border'
                                        }
                                    `}
                                    style={{ backgroundColor: color.hex }}
                                />
                            ))}

                            {/* Add Custom Color */}
                            <Popover open={showCustomColorDialog} onOpenChange={setShowCustomColorDialog}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="relative z-20 w-8 h-8 rounded-full border-2 border-dashed border-[#d8c6bb] flex items-center justify-center text-muted-foreground hover:border-[#b1121a] hover:text-[#b1121a] transition-all bg-white"
                                        title="Add custom color"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-3">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">New Color</p>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                value={customColorHex}
                                                onChange={(e) => { setCustomColorHex(e.target.value); setColorError(''); }}
                                                className="w-10 h-10 rounded border border-border cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={customColorHex}
                                                onChange={(e) => { setCustomColorHex(e.target.value); setColorError(''); }}
                                                placeholder="#ff0000"
                                                className={`flex-1 bg-muted border p-2 text-xs font-mono rounded outline-none focus:border-secondary ${colorError ? 'border-destructive' : 'border-border'}`}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={customColorName}
                                            onChange={(e) => setCustomColorName(e.target.value)}
                                            placeholder="Color name (optional)"
                                            className="w-full bg-muted border border-border p-2 text-xs rounded outline-none focus:border-secondary"
                                        />
                                        {colorError && (
                                            <p className="text-[10px] text-destructive font-medium">{colorError}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { setShowCustomColorDialog(false); setCustomColorHex('#000000'); setCustomColorName(''); setColorError(''); }}
                                                className="flex-1 bg-muted text-muted-foreground py-2 text-[10px] font-bold uppercase rounded border border-border hover:bg-background"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddCustomColor}
                                                className="flex-1 bg-secondary text-secondary-foreground py-2 text-[10px] font-black uppercase rounded"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Selected Colors */}
                        {product.colors.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-border">
                                {product.colors.map((color) => (
                                    <div
                                        key={color.hex}
                                        className="flex items-center gap-3 bg-muted p-3 rounded-lg border border-border"
                                    >
                                        {/* Color Info */}
                                        <div className="flex items-center gap-2 flex-1">
                                            <span
                                                className="w-6 h-6 rounded-full border-2 border-border flex-shrink-0"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            <span className="uppercase text-xs font-bold">{color.name || color.hex}</span>
                                        </div>

                                        {/* Color Image Upload */}
                                        <div className="flex items-center gap-2">
                                            {color.image ? (
                                                <div className="relative group/colorimg">
                                                    <img
                                                        src={color.image}
                                                        alt={color.name || color.hex}
                                                        className="w-12 h-12 object-cover rounded border border-border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setProduct(prev => ({
                                                                ...prev,
                                                                colors: prev.colors.map(c =>
                                                                    c.hex === color.hex ? { ...c, image: undefined } : c
                                                                )
                                                            }));
                                                        }}
                                                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground p-0.5 rounded-full opacity-0 group-hover/colorimg:opacity-100 transition-opacity"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-12 h-12 border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-secondary transition-all bg-background">
                                                    <Upload size={14} className="text-muted-foreground" />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setProduct(prev => ({
                                                                    ...prev,
                                                                    colors: prev.colors.map(c =>
                                                                        c.hex === color.hex ? { ...c, image: reader.result as string } : c
                                                                    )
                                                                }));
                                                            };
                                                            reader.readAsDataURL(file);
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Remove Color Button */}
                                        <button
                                            type="button"
                                            onClick={() => removeColor(color.hex)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[8px] text-muted-foreground">Click palette colors to add/remove. Selected: {product.colors.length}</p>
                    </div>

                    {/* Variant Stock Matrix Section */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Stock Matrix (Size × Color)</label>

                        {(product.sizes ?? []).length === 0 || (product.colors ?? []).length === 0 ? (
                            <div className="bg-muted/30 border border-dashed border-border rounded p-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Select at least one size and one color to manage stock.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="p-2 border border-border bg-muted font-bold uppercase text-[10px] text-muted-foreground">
                                                Size / Color
                                            </th>
                                            {(product.colors ?? []).map(color => (
                                                <th key={color.hex} className="p-2 border border-border bg-muted text-center min-w-[70px]">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span
                                                            className="w-5 h-5 rounded-full border border-border"
                                                            style={{ backgroundColor: color.hex }}
                                                        />
                                                        <span className="text-[9px] text-muted-foreground truncate max-w-[60px]">
                                                            {color.name || color.hex.slice(0, 7)}
                                                        </span>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="p-2 border border-border bg-muted font-bold uppercase text-[10px] text-muted-foreground min-w-[60px]">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(product.sizes ?? []).map(size => {
                                            const sizeLabel = getSizeLabel(size);
                                            const rowTotal = (product.colors ?? []).reduce((sum, color) => {
                                                const key = makeVariantKey(sizeLabel, color.hex);
                                                return sum + (product.variantStock?.[key] ?? 0);
                                            }, 0);

                                            return (
                                                <tr key={sizeLabel}>
                                                    <td className="p-2 border border-border bg-muted font-bold uppercase text-center">
                                                        {sizeLabel}
                                                    </td>
                                                    {(product.colors ?? []).map(color => {
                                                        const key = makeVariantKey(sizeLabel, color.hex);
                                                        const qty = product.variantStock?.[key] ?? 0;
                                                        return (
                                                            <td key={color.hex} className="p-1 border border-border text-center">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={qty ? Number(qty) : ''}
                                                                    onChange={(e) => handleVariantStockChange(sizeLabel, color.hex, e.target.value === '' ? 0 : Number(e.target.value))}
                                                                    className="w-full bg-white border border-border p-1.5 text-xs font-bold text-center rounded outline-none focus:border-secondary"
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-2 border border-border bg-muted font-bold text-center text-foreground">
                                                        {rowTotal}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {/* Column totals row */}
                                        <tr>
                                            <td className="p-2 border border-border bg-muted font-bold uppercase text-[10px] text-foreground text-center">
                                                Total
                                            </td>
                                            {(product.colors ?? []).map(color => {
                                                const colTotal = (product.sizes ?? []).reduce((sum, size) => {
                                                    const sizeLabel = getSizeLabel(size);
                                                    const key = makeVariantKey(sizeLabel, color.hex);
                                                    return sum + (product.variantStock?.[key] ?? 0);
                                                }, 0);
                                                return (
                                                    <td key={color.hex} className="p-2 border border-border bg-muted font-bold text-center text-foreground">
                                                        {colTotal}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-2 border border-border bg-foreground font-black text-center text-background">
                                                {totalStock}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Size Guide Image */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Size Guide</label>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setProduct({ ...product, sizeGuideImage: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="flex-1 bg-white border border-border p-2 text-sm rounded outline-none focus:border-secondary file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
                            />
                            {product.sizeGuideImage && (
                                <button
                                    type="button"
                                    onClick={() => setProduct({ ...product, sizeGuideImage: undefined })}
                                    className="px-3 py-2 bg-destructive/10 text-destructive rounded text-xs font-bold hover:bg-destructive/20"
                                >
                                    إزالة
                                </button>
                            )}
                        </div>
                        {product.sizeGuideImage && (
                            <div className="mt-2 border border-border rounded p-2 bg-muted/20">
                                <img
                                    src={product.sizeGuideImage}
                                    alt="Size Guide Preview"
                                    className="max-w-full h-auto max-h-40 object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>


                    {/* Specifications Section */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Specifications</label>
                        <div className="space-y-3">
                            {(product.specifications || []).map((section, sIndex) => (
                                <div key={section.id} className="border rounded-md p-3 bg-muted/30 space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex gap-2 items-center">
                                            <input
                                                value={section.title_ar || section.title}
                                                onChange={(e) => {
                                                    const newSpecs = [...(product.specifications || [])];
                                                    newSpecs[sIndex] = { ...newSpecs[sIndex], title_ar: e.target.value, title: e.target.value };
                                                    setProduct({ ...product, specifications: newSpecs });
                                                }}
                                                placeholder="العنوان (مثلاً: الخامة)"
                                                className="flex-1 bg-transparent font-bold text-sm border-b border-transparent focus:border-primary outline-none"
                                                dir="rtl"
                                            />
                                            <input
                                                value={section.title_en || ''}
                                                onChange={(e) => {
                                                    const newSpecs = [...(product.specifications || [])];
                                                    newSpecs[sIndex] = { ...newSpecs[sIndex], title_en: e.target.value };
                                                    setProduct({ ...product, specifications: newSpecs });
                                                }}
                                                placeholder="Title (e.g. Material)"
                                                className="flex-1 bg-transparent font-bold text-sm border-b border-transparent focus:border-primary outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSpecs = (product.specifications || []).filter((_, i) => i !== sIndex);
                                                    setProduct({ ...product, specifications: newSpecs });
                                                }}
                                                className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pl-4 border-l-2 border-border">
                                        {section.items.map((item, iIndex) => (
                                            <div key={iIndex} className="flex flex-col gap-2 p-2 bg-background/50 rounded border border-border/50">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        value={item.label_ar || item.label}
                                                        onChange={(e) => {
                                                            const newSpecs = [...(product.specifications || [])];
                                                            newSpecs[sIndex].items[iIndex] = { ...newSpecs[sIndex].items[iIndex], label_ar: e.target.value, label: e.target.value };
                                                            setProduct({ ...product, specifications: newSpecs });
                                                        }}
                                                        placeholder="التسمية (مثلاً: القماش)"
                                                        className="flex-1 bg-white border border-border p-1.5 text-xs rounded outline-none focus:border-secondary"
                                                        dir="rtl"
                                                    />
                                                    <input
                                                        value={item.label_en || ''}
                                                        onChange={(e) => {
                                                            const newSpecs = [...(product.specifications || [])];
                                                            newSpecs[sIndex].items[iIndex] = { ...newSpecs[sIndex].items[iIndex], label_en: e.target.value };
                                                            setProduct({ ...product, specifications: newSpecs });
                                                        }}
                                                        placeholder="Label (e.g. Fabric)"
                                                        className="flex-1 bg-white border border-border p-1.5 text-xs rounded outline-none focus:border-secondary"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        value={item.value_ar || item.value}
                                                        onChange={(e) => {
                                                            const newSpecs = [...(product.specifications || [])];
                                                            newSpecs[sIndex].items[iIndex] = { ...newSpecs[sIndex].items[iIndex], value_ar: e.target.value, value: e.target.value };
                                                            setProduct({ ...product, specifications: newSpecs });
                                                        }}
                                                        placeholder="القيمة (مثلاً: قطن)"
                                                        className="flex-1 bg-white border border-border p-1.5 text-xs rounded outline-none focus:border-secondary"
                                                        dir="rtl"
                                                    />
                                                    <input
                                                        value={item.value_en || ''}
                                                        onChange={(e) => {
                                                            const newSpecs = [...(product.specifications || [])];
                                                            newSpecs[sIndex].items[iIndex] = { ...newSpecs[sIndex].items[iIndex], value_en: e.target.value };
                                                            setProduct({ ...product, specifications: newSpecs });
                                                        }}
                                                        placeholder="Value (e.g. Cotton)"
                                                        className="flex-1 bg-white border border-border p-1.5 text-xs rounded outline-none focus:border-secondary"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSpecs = [...(product.specifications || [])];
                                                        newSpecs[sIndex].items = newSpecs[sIndex].items.filter((_, i) => i !== iIndex);
                                                        setProduct({ ...product, specifications: newSpecs });
                                                    }}
                                                    className="self-end text-muted-foreground hover:text-destructive p-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSpecs = [...(product.specifications || [])];
                                                newSpecs[sIndex].items.push({ label: "", value: "" });
                                                setProduct({ ...product, specifications: newSpecs });
                                            }}
                                            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Add Field
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    const newSpecs = [...(product.specifications || [])];
                                    newSpecs.push({ id: Date.now().toString(), title: "New Section", items: [] });
                                    setProduct({ ...product, specifications: newSpecs });
                                }}
                                className="w-full py-2 border-2 border-dashed border-border rounded text-xs font-bold uppercase text-muted-foreground hover:border-secondary hover:text-secondary transition-colors"
                            >
                                + Add Specifications Section
                            </button>
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary text-primary-foreground py-4 font-black uppercase text-xs tracking-widest rounded shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <Save size={18} /> {isAdding ? 'Add Product' : 'Save Changes'}
                </button>
            </form >
        </div >
    );
};

export default ProductForm;
