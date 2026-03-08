import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;

    isWishlistOpen: boolean;
    openWishlist: () => void;
    closeWishlist: () => void;
    toggleWishlist: () => void;

    isSearchOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const openCart = () => { setIsCartOpen(true); setIsWishlistOpen(false); };
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen(prev => !prev);

    const openWishlist = () => { setIsWishlistOpen(true); setIsCartOpen(false); };
    const closeWishlist = () => setIsWishlistOpen(false);
    const toggleWishlist = () => setIsWishlistOpen(prev => !prev);

    const openSearch = () => setIsSearchOpen(true);
    const closeSearch = () => setIsSearchOpen(false);
    const toggleSearch = () => setIsSearchOpen(prev => !prev);

    return (
        <UIContext.Provider value={{
            isCartOpen, openCart, closeCart, toggleCart,
            isWishlistOpen, openWishlist, closeWishlist, toggleWishlist,
            isSearchOpen, openSearch, closeSearch, toggleSearch
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
