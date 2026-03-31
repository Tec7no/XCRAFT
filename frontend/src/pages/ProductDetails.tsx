import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProductPage from '@/components/ProductPage';
import { useProducts } from '@/hooks/useProducts';
import { useStorageState } from '@/utils/storage';
import { Product, CartItem, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailsProps {
    onToggleCompare?: (product: Product) => void;
    compareList?: Product[];
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ onToggleCompare, compareList }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Fetch from API
    const { products, loading } = useProducts();
    const [cart, setCart] = useStorageState<CartItem[]>('cart', []);
    const [wishlist, setWishlist] = useStorageState<string[]>('wishlist', []);
    const [user] = useStorageState<User | null>('user', null);

    // Support both id and _id from MongoDB
    const product = products.find(p => p.id === id || (p as any)._id === id);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
    }

    // Normalize variantStock from MongoDB (comes as plain object, not Map)
    const normalizedProduct: Product = {
        ...product,
        id: product.id || (product as any)._id?.toString(),
        variantStock: product.variantStock
            ? Object.fromEntries(
                Object.entries(product.variantStock as Record<string, number>)
                    .map(([k, v]) => [k, Number(v)])
              )
            : undefined,
    };

    const handleAddToCart = (product: Product, color: string, size: string) => {
        setCart(prev => {
            const existing = prev.find(
                item => item.id === product.id && item.selectedColor === color && item.selectedSize === size
            );
            if (existing) {
                return prev.map(item =>
                    item.id === product.id && item.selectedColor === color && item.selectedSize === size
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                ...product,
                selectedColor: color,
                selectedSize: size,
                quantity: 1,
                selectedImage: product.images[0]
            }];
        });
        toast({ title: "Added to Cart", description: `${product.name} added to your bag.` });
    };

    const handleToggleWishlist = (product: Product) => {
        setWishlist(prev => {
            if (prev.includes(product.id)) return prev.filter(id => id !== product.id);
            return [...prev, product.id];
        });
    };

    const isWishlisted = wishlist.includes(normalizedProduct.id);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header
                onSearchChange={() => { }}
                onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')}
                onAccount={() => navigate('/profile')}
                onLogout={() => { }}
                onOrders={() => navigate('/profile?tab=orders')}
                user={user}
            />
            <main className="flex-grow">
                <ProductPage
                    product={normalizedProduct}
                    onBack={() => {
                        if (window.history.length > 1) navigate(-1);
                        else navigate('/shop');
                    }}
                    onAddToCart={handleAddToCart}
                    onProductClick={(p) => navigate(`/product/${p.id}`)}
                    isWishlisted={isWishlisted}
                    onToggleWishlist={handleToggleWishlist}
                    catalog={products}
                    onToggleCompare={onToggleCompare}
                    compareList={compareList}
                />
            </main>
        </div>
    );
};

export default ProductDetails;