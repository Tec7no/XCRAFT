import React, { createContext, useContext, ReactNode } from 'react';
import { useStorageState } from '@/utils/storage';

interface WishlistContextType {
    wishlist: string[];
    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    toggleWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useStorageState<string[]>('wishlist', []);

    const addToWishlist = (productId: string) => {
        if (!wishlist.includes(productId)) {
            setWishlist(prev => [...prev, productId]);
        }
    };

    const removeFromWishlist = (productId: string) => {
        setWishlist(prev => prev.filter(id => id !== productId));
    };

    const toggleWishlist = (productId: string) => {
        if (wishlist.includes(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(productId);
        }
    };

    const isInWishlist = (productId: string) => wishlist.includes(productId);

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist,
            wishlistCount: wishlist.length
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
