import * as React from 'react';
import { Product } from '../types';
import ProductCard from './ui/product-card-1';
import { useLanguage } from '@/i18n/LanguageContext';
import ScrollReveal from './ui/scroll-reveal';
import { EditableSection } from './ui/editable-section';
import { EditableText } from './ui/editable-text';

interface FeaturedSectionProps {
    products: Product[];
    onProductClick: (product: Product) => void;
    onAddToCart: (product: Product, quantity: number) => void;
    onToggleWishlist: (product: Product) => void;
    wishlist: string[];
    setQuickViewProduct: (product: Product) => void;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({
    products,
    onProductClick,
    onAddToCart,
    onToggleWishlist,
    wishlist,
    setQuickViewProduct
}) => {
    const { t } = useLanguage();

    // New Arrivals: Select 4 products.
    // Ideally, logic would pick based on discount, but using first 4 as placeholders for "New Arrivals".
    const displayProducts = React.useMemo(() => products.slice(0, 4), [products]);

    return (
        <EditableSection id="featured" title="Top Deals">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <ScrollReveal variant="fadeUp">
                    <h2 className="text-3xl font-black text-center mb-12 uppercase tracking-tighter">
                        <EditableText k="section_newArrivals" as="span" />
                    </h2>
                </ScrollReveal>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.map((product, index) => (
                        <ScrollReveal key={product.id} variant="fadeUp" delay={index * 0.1}>
                            <ProductCard
                                product={product}
                                onClick={onProductClick}
                                onAddToCart={(p) => onAddToCart(p, 1)}
                                onQuickView={setQuickViewProduct}
                                onToggleWishlist={onToggleWishlist}
                                isWishlisted={wishlist.includes(product.id)}
                                className="bg-muted/10 border-border/50"
                            />
                        </ScrollReveal>
                    ))}
                </div>
            </section>
        </EditableSection>
    );
};

export default FeaturedSection;

