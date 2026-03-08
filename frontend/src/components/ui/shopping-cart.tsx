'use client';
import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Trash2, ShoppingCart as ShoppingCartIcon, X } from 'lucide-react';
import { CartItem } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { Progress } from '@/components/ui/progress';

interface ShoppingCartProps {
    items: CartItem[];
    onUpdateQuantity: (item: CartItem, delta: number) => void;
    onRemoveItem: (item: CartItem) => void;
    onCheckout: () => void;
    getStock: (productId: string) => number;
    onClose: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
    items,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    getStock,
    onClose
}) => {
    const { t } = useLanguage();
    const { settings } = useSiteSettings();
    const shippingConfig = settings.shippingConfig || { freeShippingThreshold: 1000, processingDays: '1-2', deliveryDays: '3-5', flatRateFee: 50 };
    const subtotal = items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
    const shipping = subtotal >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.flatRateFee;
    const total = subtotal + shipping;

    const formatCurrency = (amount: number) => {
        return `EGP ${amount.toLocaleString()}`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-2">
                    <ShoppingCartIcon className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">{t('cart_title')}</h2>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{t('cart_itemsCount').replace('{{count}}', items.length.toString())}</span>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Free Shipping Progress */}
                {items.length > 0 && (
                    <div className="mb-6 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className={subtotal >= shippingConfig.freeShippingThreshold ? "text-green-600" : "text-muted-foreground"}>
                                {subtotal >= shippingConfig.freeShippingThreshold
                                    ? t('cart_shipping_unlocked')
                                    : <span dangerouslySetInnerHTML={{ __html: t('cart_shipping_remaining').replace('{{amount}}', `${(shippingConfig.freeShippingThreshold - subtotal).toLocaleString()} EGP`) }} />}
                            </span>
                            <span className="text-muted-foreground">{Math.round(Math.min(100, (subtotal / shippingConfig.freeShippingThreshold) * 100))}%</span>
                        </div>
                        <Progress value={Math.min(100, (subtotal / shippingConfig.freeShippingThreshold) * 100)} className="h-1.5 bg-[#F8F5F1]" />
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <ShoppingCartIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>{t('cart_empty')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center gap-4 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <img
                                    src={item.images[0]}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-md"
                                />
                                <div className="flex-1 grid gap-1">
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">{t('cart_perItem')} {formatCurrency(item.salePrice)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => onUpdateQuantity(item, -1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            min="1"
                                            max={getStock(item.id)}
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const newQty = parseInt(e.target.value);
                                                if (!isNaN(newQty) && newQty >= 1 && newQty <= getStock(item.id)) {
                                                    const delta = newQty - item.quantity;
                                                    onUpdateQuantity(item, delta);
                                                }
                                            }}
                                            className="w-16 text-center h-7"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => onUpdateQuantity(item, 1)}
                                            disabled={item.quantity >= getStock(item.id)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <p className="font-semibold">{formatCurrency(item.salePrice * item.quantity)}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => onRemoveItem(item)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer with totals */}
            {items.length > 0 && (
                <div className="border-t p-6 bg-muted/20">
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                            <span>{t('cart_subtotal')}</span>
                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        {shipping > 0 && (
                            <div className="flex justify-between">
                                <span>{t('cart_shipping')}</span>
                                <span className="font-medium">{formatCurrency(shipping)}</span>
                            </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>{t('cart_total')}</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <Button
                        className="w-full"
                        onClick={onCheckout}
                        disabled={items.length === 0}
                    >
                        {t('cart_checkout')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ShoppingCart;
