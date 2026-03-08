import React, { createContext, useContext, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { useStorageState } from '@/utils/storage';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, color?: string, size?: string, quantity?: number) => void;
    removeFromCart: (item: CartItem) => void;
    updateQuantity: (item: CartItem, delta: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useStorageState<CartItem[]>('cart', []);

    const addToCart = (product: Product, color?: string, size?: string, quantity: number = 1) => {
        const selectedColor = color || (product.colors ?? [])[0]?.hex || '';
        const firstSize = (product.sizes ?? [])[0];
        const selectedSize = size || (typeof firstSize === 'string' ? firstSize : (firstSize as { label?: string })?.label) || '';

        setCart(prev => {
            const existing = prev.find(item =>
                item.id === product.id &&
                item.selectedColor === selectedColor &&
                item.selectedSize === selectedSize
            );

            if (existing) {
                return prev.map(item =>
                    item === existing
                        ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) }
                        : item
                );
            }

            return [...prev, {
                ...product,
                quantity,
                selectedColor,
                selectedSize,
                name_ar: product.name_ar || product.name,
                name_en: product.name_en || product.name
            }];
        });
    };

    const removeFromCart = (itemToRemove: CartItem) => {
        setCart(prev => prev.filter(item =>
            !(item.id === itemToRemove.id &&
                item.selectedColor === itemToRemove.selectedColor &&
                item.selectedSize === itemToRemove.selectedSize)
        ));
    };

    const updateQuantity = (itemToUpdate: CartItem, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemToUpdate.id &&
                item.selectedColor === itemToUpdate.selectedColor &&
                item.selectedSize === itemToUpdate.selectedSize) {
                const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.stock));
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
