import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeProducts } from './normalize';
import type { Product } from '@/types';

const STORAGE_PREFIX = 'townteam_';

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return defaultValue;

    const parsed = JSON.parse(item);

    // Special handling for products - normalize legacy formats
    if (key === 'products' && Array.isArray(parsed)) {
      // If products array is empty, use default products instead
      if (parsed.length === 0) {
        console.warn('Products array is empty in localStorage, using INITIAL_PRODUCTS');
        return defaultValue;
      }
      return normalizeProducts(parsed) as T;
    }

    return parsed;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('townteam_storage', {
      detail: { key: STORAGE_PREFIX + key }
    }));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('townteam_storage', {
      detail: { key: STORAGE_PREFIX + key }
    }));
  } catch (e) {
    console.warn('localStorage remove failed:', e);
  }
}

export function useStorageState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => getStorageItem(key, defaultValue));
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    // Set flag to prevent self-triggering
    isUpdatingRef.current = true;
    setStorageItem(key, state);
    // Reset flag after a short delay
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  }, [key, state]);

  // Listen for storage events (cross-tab and same-tab via custom events)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | Event) => {
      // Ignore events triggered by this component
      if (isUpdatingRef.current) {
        return;
      }

      if (e instanceof StorageEvent) {
        if (e.key === STORAGE_PREFIX + key) {
          setState(getStorageItem(key, defaultValue));
        }
      } else if (e.type === 'townteam_storage') {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && customEvent.detail.key === STORAGE_PREFIX + key) {
          setState(getStorageItem(key, defaultValue));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('townteam_storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('townteam_storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  return [state, setState];
}

// Egyptian phone validation
export function isValidEgyptianPhone(phone: string): boolean {
  // Accepts: 01XXXXXXXXX or +201XXXXXXXXX
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+?20)?1[0125]\d{8}$/.test(cleaned);
}

// Generate order ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TT-${timestamp}-${random}`;
}
