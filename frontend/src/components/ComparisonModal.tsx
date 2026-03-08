import React from 'react';
import { Product } from '@/types';
import { X, CheckCircle2 } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder';
import { Button } from './ui/button';

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onRemove: (id: string) => void;
    onAddToCart: (product: Product) => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, products, onRemove, onAddToCart }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border border-border">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-primary">Compare Products</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                            {products.length} item{products.length !== 1 && 's'} selected
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <p className="text-sm font-bold uppercase tracking-widest">No products selected</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[150px_repeat(auto-fit,minmax(200px,1fr))] gap-8 min-w-[800px]">
                            {/* Labels Column */}
                            <div className="space-y-8 pt-[200px] text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                <div className="h-8 flex items-center">Price</div>
                                <div className="h-8 flex items-center">Stock Status</div>
                                <div className="h-8 flex items-center">Category</div>
                                <div className="h-8 flex items-center">Colors</div>
                                <div className="h-8 flex items-center">Sizes</div>
                                <div className="h-24">Description</div>
                            </div>

                            {/* Product Columns */}
                            {products.map(p => (
                                <div key={p.id} className="space-y-8 relative group">
                                    <button
                                        onClick={() => onRemove(p.id)}
                                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                                    >
                                        <X size={14} />
                                    </button>

                                    {/* Image & Title */}
                                    <div className="h-[200px] flex flex-col gap-3">
                                        <div className="relative aspect-[3/4] w-full bg-muted rounded-md overflow-hidden border border-border">
                                            {p.images[0] ? (
                                                <img src={p.images[0]} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImagePlaceholder className="w-full h-full" label="No Img" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-sm leading-tight line-clamp-2" title={p.name}>{p.name}</h3>
                                    </div>

                                    {/* Attributes */}
                                    <div className="h-8 flex items-center font-bold text-foreground ltr">
                                        EGP {p.salePrice.toLocaleString()}
                                    </div>
                                    <div className="h-8 flex items-center">
                                        {p.stock > 0 ? (
                                            <span className="text-foreground border border-foreground/20 bg-foreground/5 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-black uppercase">
                                                <CheckCircle2 size={12} /> In Stock
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground border border-border bg-muted/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Out of Stock</span>
                                        )}
                                    </div>
                                    <div className="h-8 flex items-center text-xs">{p.category}</div>
                                    <div className="h-8 flex items-center gap-1">
                                        {(p.colors || []).map(c => (
                                            <div key={c.hex} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} title={c.name} />
                                        ))}
                                    </div>
                                    <div className="h-8 flex items-center gap-1 flex-wrap">
                                        {(Array.isArray(p.sizes) ? p.sizes : []).map(s => (
                                            <span key={s} className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-bold">{s}</span>
                                        ))}
                                    </div>
                                    <div className="h-24 overflow-y-auto text-[10px] text-muted-foreground leading-relaxed pr-2 custom-scrollbar">
                                        {p.description}
                                    </div>

                                    <Button onClick={() => onAddToCart(p)} className="w-full font-black uppercase text-[10px] tracking-widest bg-foreground hover:bg-foreground/90 text-background transition-all">
                                        Add to Cart
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComparisonModal;
