
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export type Brand = 'main' | 'splash' | 'babyshop';

interface BrandConfig {
    id: Brand;
    name: string;
    logoText: React.ReactNode;
    primaryColor: string;
    secondaryColor: string;
}

const BRANDS: Record<Brand, BrandConfig> = {
    main: {
        id: 'main',
        name: 'Xcraft',
        logoText: <>X<span className="text-secondary">CRAFT</span></>,
        primaryColor: '#1a1a1a',
        secondaryColor: '#b1121a'
    },
    splash: {
        id: 'splash',
        name: 'Collection',
        logoText: <>X<span className="text-secondary">CRAFT</span></>,
        primaryColor: '#1a1a1a',
        secondaryColor: '#b1121a'
    },
    babyshop: {
        id: 'babyshop',
        name: 'Collection',
        logoText: <>X<span className="text-secondary">CRAFT</span></>,
        primaryColor: '#1a1a1a',
        secondaryColor: '#b1121a'
    }
};

interface DepartmentContextType {
    brand: BrandConfig;
}

const DepartmentContext = createContext<DepartmentContextType>({ brand: BRANDS.main });

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [brand, setBrand] = useState<BrandConfig>(BRANDS.main);

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/splash') || path.includes('/men') || path.includes('/women')) {
            setBrand(BRANDS.splash);
        } else if (path.includes('/babyshop') || path.includes('/kids')) {
            setBrand(BRANDS.babyshop);
        } else {
            setBrand(BRANDS.main);
        }
    }, [location.pathname]);

    // Optional: Synchronize CSS variables if needed for deeper theming
    useEffect(() => {
        if (brand.id === 'babyshop') {
            document.documentElement.style.setProperty('--ic-primary', '#ff6b6b');
            document.documentElement.style.setProperty('--ic-text', '#2c3e50');
        } else {
            document.documentElement.style.setProperty('--ic-primary', '#1a1a1a');
            document.documentElement.style.setProperty('--ic-text', '#000000');
        }
    }, [brand]);

    return (
        <DepartmentContext.Provider value={{ brand }}>
            {children}
        </DepartmentContext.Provider>
    );
};

export const useDepartment = () => useContext(DepartmentContext);
