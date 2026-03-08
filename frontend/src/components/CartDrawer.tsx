import * as React from 'react';
import { CartItem } from '../types';
import ShoppingCart from './ui/shopping-cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  updateQuantity: (item: CartItem, delta: number) => void;
  removeItem: (item: CartItem) => void;
  onCheckout: () => void;
  getStock: (productId: string) => number;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  updateQuantity,
  removeItem,
  onCheckout,
  getStock
}) => {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      // Small timeout to allow ShoppingCart to mount and render its inputs
      setTimeout(() => {
        const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.[0]?.focus();
      }, 50);
    } else {
      lastFocusedRef.current?.focus?.();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        ref={drawerRef}
        className="absolute top-0 right-0 h-[100dvh] w-full max-w-md shadow-2xl flex flex-col animate-slide-in-right"
      >
        <ShoppingCart
          items={items}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onCheckout={onCheckout}
          getStock={getStock}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default CartDrawer;
