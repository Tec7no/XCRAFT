import React from 'react';
import { useUI } from '@/context/UIContext';
import { useWishlist } from '@/context/WishlistContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { INITIAL_PRODUCTS } from '@/constants'; // Fallback to look up product details

const WishlistDrawer = () => {
    const { isWishlistOpen, closeWishlist } = useUI();
    const { wishlist, removeFromWishlist } = useWishlist();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Helper to get product details from ID (since wishlist only stores IDs)
    const getProduct = (id: string) => {
        // ideally getting from a product context or cache
        return INITIAL_PRODUCTS.find(p => p.id === id);
    };

    return (
        <Sheet open={isWishlistOpen} onOpenChange={closeWishlist}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0" side="right">
                <div className="flex items-center justify-between p-6 border-b border-[#d8c6bb] bg-[#f6efea]">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-[#b1121a]">
                        Wishlist
                    </h2>
                    <Button variant="ghost" onClick={closeWishlist} className="hover:bg-[#e8dec9] text-[#3a2d23]">
                        <X size={20} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[#f6efea]">
                    {wishlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <Heart size={48} className="text-[#b1121a]/50" />
                            <p className="text-lg font-medium text-[#3a2d23]">Your wishlist is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {wishlist.map(id => {
                                const product = getProduct(id);
                                if (!product) return null;
                                return (
                                    <div key={id} className="flex gap-4 p-4 bg-white border border-[#d8c6bb] rounded-md">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-20 h-24 object-cover rounded-md bg-gray-100"
                                        />
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-[#b1121a] text-sm line-clamp-1">{product.name}</h4>
                                                <p className="text-xs text-[#3a2d23]/80">{product.salePrice} EGP</p>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-[#b1121a] text-white text-xs h-8"
                                                    onClick={() => {
                                                        closeWishlist();
                                                        navigate(`/product/${product.id}`);
                                                    }}
                                                >
                                                    View Item
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-[#3a2d23] hover:text-[#b1121a]"
                                                    onClick={() => removeFromWishlist(id)}
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default WishlistDrawer;
