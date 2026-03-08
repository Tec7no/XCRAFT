import * as React from 'react';
import { X, ShoppingBag, Heart } from './icons';
import { Product, ColorOption, makeVariantKey } from '../types';
import ImagePlaceholder from './ImagePlaceholder';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false
}) => {
  const [selectedColor, setSelectedColor] = React.useState<ColorOption | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);

  // Get available sizes (now just string[])
  const availableSizes = React.useMemo(() =>
    Array.isArray(product?.sizes) ? product.sizes : [],
    [product?.sizes]
  );

  // Helper to get variant stock for a size+color combination
  const getVariantQty = React.useCallback((size: string, hex: string): number => {
    if (!product?.variantStock) return 0;
    const key = makeVariantKey(size, hex);
    return product.variantStock[key] ?? 0;
  }, [product?.variantStock]);

  React.useEffect(() => {
    if (product) {
      setSelectedColor((product.colors ?? [])[0] || null);
      setSelectedSize(availableSizes[0] || null);
    }
  }, [product, availableSizes]);

  const handleAddToCart = () => {
    if (product && selectedColor && selectedSize) {
      onAddToCart(product, selectedColor.hex, selectedSize);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.[0]?.focus();
    } else {
      lastFocusedRef.current?.focus?.();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const primaryImage = product.images.find(Boolean);
  const outOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div
        ref={modalRef}
        className="relative bg-card border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-fade-in-up"
      >
        <button
          onClick={onClose}
          aria-label="Close product"
          className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur hover:bg-secondary text-primary hover:text-secondary-foreground rounded-full transition-all shadow-md"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-1/2 bg-muted relative group">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImagePlaceholder className="w-full h-full" label="Image coming soon" />
          )}
        </div>

        <div className="w-full md:w-1/2 p-8 overflow-y-auto text-primary">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">{product.category}</p>
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight leading-none">{product.name}</h2>
              <p className="text-[10px] text-muted-foreground font-bold mt-2">CODE: {product.code}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-foreground ltr">EGP {product.salePrice.toLocaleString()}</span>
              {product.originalPrice > product.salePrice && (
                <span className="text-lg text-muted-foreground line-through ltr">EGP {product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description || "Designed with attention to detail and crafted from high-quality materials, this piece is a versatile addition to any wardrobe."}
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3">Color: <span className="text-foreground ml-2">{selectedColor?.name || selectedColor?.hex}</span></h4>
                <div className="flex gap-3">
                  {(product.colors ?? []).map(color => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor?.hex === color.hex ? 'border-foreground scale-110' : 'border-transparent'}`}
                      aria-label={`Select color ${color.name || color.hex}`}
                    >
                      <div className="w-full h-full rounded-full border border-border" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3">Select Size: <span className="text-secondary ml-2">{selectedSize}</span></h4>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map(size => {
                    const variantQty = selectedColor ? getVariantQty(size, selectedColor.hex) : 0;
                    const isUnavailable = variantQty <= 0;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={isUnavailable}
                        className={`py-3 text-[11px] font-bold transition-all uppercase ${isUnavailable
                          ? 'opacity-30 cursor-not-allowed bg-muted text-muted-foreground border border-border line-through'
                          : selectedSize === size
                            ? 'bg-foreground text-background border-foreground'
                            : 'border border-border text-foreground hover:border-foreground'
                          }`}
                        aria-label={`Select size ${size}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6">
              {(() => {
                const variantQty = selectedColor && selectedSize ? getVariantQty(selectedSize, selectedColor.hex) : 0;
                const isOutOfStock = outOfStock || variantQty <= 0;
                return (
                  <>
                    <div className="flex gap-4">
                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || !selectedColor || !selectedSize}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-bold uppercase text-xs tracking-widest transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'}`}
                      >
                        <ShoppingBag size={18} />
                        {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                      </button>

                      {onToggleWishlist && (
                        <button
                          onClick={() => product && onToggleWishlist(product)}
                          className={`px-5 border-2 transition-all flex items-center justify-center ${isWishlisted ? 'border-foreground text-foreground bg-foreground/5' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'}`}
                        >
                          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {variantQty > 0 ? `In stock: ${variantQty}` : 'Select available size'}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
