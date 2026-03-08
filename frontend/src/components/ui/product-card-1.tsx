import React from 'react';
import { Scale } from 'lucide-react';
import { Product } from '../../types';
import { ShoppingBag, Heart, Eye } from '../icons';
import ImagePlaceholder from '../ImagePlaceholder';
import { useLanguage } from '@/i18n/LanguageContext';
import { EditableText } from '@/components/ui/editable-text';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    onAddToCart: (product: Product, color?: string, size?: string) => void;
    onQuickView?: (product: Product) => void;
    onToggleWishlist?: (product: Product) => void;
    isWishlisted?: boolean;
    onToggleCompare?: (product: Product) => void;
    isCompared?: boolean;
    className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onClick,
    onAddToCart,
    onQuickView,
    onToggleWishlist,
    isWishlisted = false,
    onToggleCompare,
    isCompared = false,
    className
}) => {
    const { t, lang } = useLanguage();
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);
    const primaryImage = previewImage || product.images[0];
    const secondaryImage = previewImage ? null : product.images[1]; // Don't show secondary hover if previewing color
    const isOutOfStock = product.stock <= 0;
    const hasDiscount = product.discount > 0;

    return (
        <div className={cn("group relative bg-card border border-border hover:shadow-xl transition-all duration-300 overflow-hidden", className)}>
            {/* Image Container */}
            <div
                className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-muted"
                onClick={() => onClick(product)}
                onMouseLeave={() => setPreviewImage(null)}
            >
                {primaryImage ? (
                    <>
                        <img
                            src={primaryImage}
                            alt={lang === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name)}
                            loading="lazy"
                            className={`w-full h-full object-cover transition-transform duration-500 ${previewImage ? '' : 'group-hover:scale-110'}`}
                        />
                        {secondaryImage && (
                            <img
                                src={secondaryImage}
                                alt={lang === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name)}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            />
                        )}
                    </>
                ) : (
                    <ImagePlaceholder className="w-full h-full" label="No image" />
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.badge && (
                        <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${product.badge === 'New' ? 'bg-foreground text-background' :
                            product.badge === 'Sale' ? 'bg-foreground text-background line-through opacity-70' :
                                'bg-muted text-muted-foreground'
                            }`}>
                            <EditableText k={`tag_${product.badge.toLowerCase()}`} as="span" />
                        </span>
                    )}
                    {hasDiscount && (
                        <span className="px-2 py-1 bg-foreground text-background text-[9px] font-bold uppercase">
                            -{product.discount}%
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="px-2 py-1 bg-gray-500 text-white text-[9px] font-bold uppercase">
                            <EditableText k="tag_soldOut" as="span" />
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {onToggleWishlist && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleWishlist(product);
                            }}
                            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${isWishlisted
                                ? 'bg-secondary text-secondary-foreground'
                                : 'bg-background/90 hover:bg-secondary text-foreground hover:text-secondary-foreground'
                                }`}
                            aria-label="Add to wishlist"
                        >
                            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                    )}
                    {onQuickView && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onQuickView(product);
                            }}
                            className="p-2 bg-background/90 hover:bg-secondary text-foreground hover:text-secondary-foreground rounded-full shadow-sm backdrop-blur-md transition-colors"
                            aria-label="Quick view"
                        >
                            <Eye size={16} />
                        </button>
                    )}
                </div>

                {/* Add to Cart Button - Visible on Mobile icons / Hover on Desktop */}
                {!isOutOfStock && (
                    <>
                        {/* Desktop Version */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                            }}
                            className="hidden md:flex absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-3 font-bold uppercase text-xs tracking-widest opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300 items-center justify-center gap-2 hover:bg-secondary"
                        >
                            <ShoppingBag size={14} />
                            <EditableText k="btn_addToCart" as="span" />
                        </button>

                        {/* Mobile Version - Floating Bag Icon */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                            }}
                            className="md:hidden absolute bottom-2 right-2 p-2.5 bg-secondary text-secondary-foreground rounded-full shadow-lg active:scale-95 transition-transform"
                            aria-label="Add to cart"
                        >
                            <ShoppingBag size={18} />
                        </button>
                    </>
                )}
            </div>

            {/* Product Info */}
            <div className="p-3 space-y-2">
                <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        <EditableText k={`category_${product.category.toLowerCase()}`} as="span" />
                    </p>
                    <h3 className="text-[15px] font-bold uppercase tracking-tight leading-tight line-clamp-2 text-foreground">
                        {lang === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name)}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground ltr">
                        EGP {product.salePrice.toLocaleString()}
                    </span>
                    {product.originalPrice > product.salePrice && (
                        <span className="text-xs text-muted-foreground line-through">
                            EGP {product.originalPrice.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Color Swatches */}
                {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1" onMouseLeave={() => setPreviewImage(null)}>
                        {product.colors.slice(0, 5).map((color, idx) => (
                            <div
                                key={idx}
                                className="w-4 h-4 rounded-full border border-border cursor-pointer transition-transform hover:scale-110"
                                style={{ backgroundColor: color.hex }}
                                title={color.name || color.hex}
                                onMouseEnter={() => color.image && setPreviewImage(color.image)}
                            />
                        ))}
                        {product.colors.length > 5 && (
                            <span className="text-[9px] text-muted-foreground">+{product.colors.length - 5}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
