import * as React from 'react';
import { Product } from '../types';
import ProductCard from './ui/product-card-1';
import ScrollReveal from './ui/scroll-reveal';

interface WishlistViewProps {
    wishlist: string[];
    products: Product[];
    onSetView: (view: 'home' | 'collection' | 'product' | 'auth' | 'admin' | 'wishlist') => void;
    onProductClick: (product: Product) => void;
    onAddToCart: (product: Product, quantity?: number) => void;
    onQuickView: (product: Product) => void;
    onToggleWishlist: (product: Product) => void;
}

const WishlistView: React.FC<WishlistViewProps> = ({
    wishlist,
    products,
    onSetView,
    onProductClick,
    onAddToCart,
    onQuickView,
    onToggleWishlist,
}) => {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ScrollReveal variant="fadeDown">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => onSetView('home')}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        ←
                    </button>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Your Wishlist</h2>
                    <span className="text-sm text-muted-foreground">({wishlist.length} items)</span>
                </div>
            </ScrollReveal>
            {wishlist.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                    <button
                        onClick={() => onSetView('collection')}
                        className="px-8 py-3 bg-primary text-primary-foreground font-bold uppercase text-xs tracking-widest hover:bg-secondary transition-colors rounded"
                    >
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products
                        .filter(p => wishlist.includes(p.id))
                        .map((product, index) => (
                            <ScrollReveal key={product.id} variant="scale" delay={index * 0.05}>
                                <ProductCard
                                    product={product}
                                    onClick={onProductClick}
                                    onAddToCart={(p) => onAddToCart(p, 1)}
                                    onQuickView={onQuickView}
                                    onToggleWishlist={onToggleWishlist}
                                    isWishlisted={true}
                                />
                            </ScrollReveal>
                        ))}
                </div>
            )}
        </section>
    );
};

export default WishlistView;
