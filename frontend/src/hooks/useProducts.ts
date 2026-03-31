// src/hooks/useProducts.ts
// Fetches products from the backend API
// Falls back to INITIAL_PRODUCTS if API is unreachable (dev/demo mode)

import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { productsApi } from '../lib/api';
import { INITIAL_PRODUCTS } from '../constants';

interface UseProductsOptions {
  category?: string;
  badge?: string;
  featured?: string;
  search?: string;
}

export const useProducts = (options?: UseProductsOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll(options);
      setProducts(data.products || []);
    } catch (err: any) {
      console.warn("API unavailable, falling back to local products:", err.message);
      // Graceful fallback to localStorage / INITIAL_PRODUCTS
      try {
        const stored = localStorage.getItem('townteam_products');
        if (stored) {
          const parsed = JSON.parse(stored);
          setProducts(Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      } catch {
        setProducts(INITIAL_PRODUCTS);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options?.category, options?.badge, options?.featured, options?.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

// ─── Admin version: full CRUD ──────────────────────────────────────────────────
export const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const createProduct = async (productData: Partial<Product>) => {
    const data = await productsApi.create(productData);
    setProducts(prev => [data.product, ...prev]);
    return data.product;
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const data = await productsApi.update(id, productData);
    setProducts(prev => prev.map(p => p.id === id ? data.product : p));
    return data.product;
  };

  const deleteProduct = async (id: string) => {
    await productsApi.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return { products, loading, refetch: fetchProducts, createProduct, updateProduct, deleteProduct };
};
