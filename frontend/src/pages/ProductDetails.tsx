
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProductPage from '@/components/ProductPage';
import { useStorageState } from '@/utils/storage';
import { Product, CartItem, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { INITIAL_PRODUCTS } from '@/constants';

// ...

interface ProductDetailsProps {
    onToggleCompare?: (product: Product) => void;
    compareList?: Product[];
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ onToggleCompare, compareList }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Global State
    const [products] = useStorageState<Product[]>('products', INITIAL_PRODUCTS);
    const [cart, setCart] = useStorageState<CartItem[]>('cart', []);
    const [wishlist, setWishlist] = useStorageState<string[]>('wishlist', []);
    const [user] = useStorageState<User | null>('user', null);

    const product = products.find(p => p.id === id);


    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
    }

    const handleAddToCart = (product: Product, color: string, size: string) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.selectedColor === color && item.selectedSize === size);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id && item.selectedColor === color && item.selectedSize === size
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, selectedColor: color, selectedSize: size, quantity: 1, selectedImage: product.images[0] }];
        });
        toast({ title: "Added to Cart", description: `${product.name} added to your bag.` });
    };

    const handleToggleWishlist = (product: Product) => {
        setWishlist(prev => {
            if (prev.includes(product.id)) {
                return prev.filter(id => id !== product.id);
            }
            return [...prev, product.id];
        });
    };

    const isWishlisted = wishlist.includes(product.id);

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
                    product={product}
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
