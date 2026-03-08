import React from 'react';
import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import ShoppingCart from '@/components/ui/shopping-cart';
import { CartItem } from '@/types';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { isCartOpen, closeCart } = useUI();
    const { cart, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    // Mock getStock function - in a real app this would check API/inventory
    const getStock = (productId: string) => 100;

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    return (
        <Sheet open={isCartOpen} onOpenChange={closeCart}>
            <SheetContent className="w-full sm:max-w-md p-0" side="right">
                <ShoppingCart
                    items={cart}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    onCheckout={handleCheckout}
                    getStock={getStock}
                    onClose={closeCart}
                />
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
