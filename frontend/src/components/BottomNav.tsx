import * as React from 'react';
import { Home, Search, LayoutGrid, User, ShoppingCart, Heart } from './icons';
import { useLanguage } from '@/i18n/LanguageContext';
import { EditableText } from './ui/editable-text';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: 'home' | 'collection') => void;
  onAccount: () => void;
  onOpenCart: () => void;
  onWishlist: () => void;
  cartCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, onAccount, onOpenCart, onWishlist, cartCount }) => {
  const { t } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-1 z-[120] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeView === 'home' ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        <Home size={22} strokeWidth={activeView === 'home' ? 2.5 : 2} />
        <span className="text-[10px] font-medium"><EditableText k="nav_home" as="span" /></span>
      </button>

      <button
        onClick={() => onNavigate('collection')}
        className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeView === 'collection' ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        <Search size={22} />
        <span className="text-[10px] font-medium"><EditableText k="nav_shop" as="span" /></span>
      </button>

      <button
        onClick={onWishlist}
        className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeView === 'wishlist' ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        <Heart size={22} strokeWidth={activeView === 'wishlist' ? 2.5 : 2} />
        <span className="text-[10px] font-medium"><EditableText k="nav_wishlist" as="span" /></span>
      </button>

      <button
        onClick={onAccount}
        className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeView === 'account' ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        <User size={22} strokeWidth={activeView === 'account' ? 2.5 : 2} />
        <span className="text-[10px] font-medium"><EditableText k="nav_account" as="span" /></span>
      </button>

      <button
        onClick={onOpenCart}
        className="flex flex-col items-center gap-1 flex-1 text-muted-foreground relative"
      >
        <ShoppingCart size={22} />
        <span className="text-[10px] font-medium"><EditableText k="nav_cart" as="span" /></span>
        {cartCount > 0 && (
          <span className="absolute top-0 right-4 bg-foreground text-background text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-background">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
};

export default BottomNav;
