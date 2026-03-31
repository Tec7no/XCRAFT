import * as React from 'react';
import { Search, User, Menu, X, ChevronRight, Heart } from './icons';
import { useLanguage } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import AnnouncementMarquee from './AnnouncementMarquee';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package, LayoutDashboard, Pencil } from "lucide-react";
import { EditableText } from './ui/editable-text';
import { User as UserType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useEditMode } from '@/admin/EditModeContext';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  onNavigate: (category: string | null) => void;
  onAccount: () => void;
  onLogout: () => void;
  onOrders: () => void;
  user: UserType | null;
}

// Custom cart icon SVG component
const CartIcon: React.FC<{ size?: number; className?: string }> = ({ size = 22, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useUI } from '@/context/UIContext';
import { useDepartment } from '@/context/DepartmentContext';

import { useProducts } from '@/hooks/useProducts';

const Header: React.FC<HeaderProps> = ({ onSearchChange, onNavigate, onAccount, onLogout, onOrders, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState(''); // Local state for preview
  const { lang, toggleLang, t } = useLanguage();
  const { settings } = useSiteSettings();
  const { brand } = useDepartment();
  const navigate = useNavigate();
  const { products } = useProducts();

  const previewProducts = React.useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [searchTerm, products]);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { openCart, openWishlist } = useUI();
  const { isIframe } = useEditMode();

  // ... rest of component using openCart instead of onOpenCart

  // Build nav items from settings or fallback to defaults
  const navItems = React.useMemo(() => {
    const items = settings.nav?.items || [];
    return items
      .filter(item => item.visible)
      .map(item => ({
        id: item.id,
        labelKey: item.labelKey,
        label: t(item.labelKey),
        href: item.href,
        category: item.href.startsWith('#') ? item.href.slice(1) || null : null,
        tag: null as string | null,
      }));
  }, [settings.nav?.items, t]);

  const handleLinkClick = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    // Special handling for "Shop All" on Home/Index page to enable smooth scroll
    // Check if link is /shop or / and we are currently on / or /shop
    if ((item.href === '/shop' || item.href === '/') && (window.location.pathname === '/' || window.location.pathname === '/shop')) {
      onNavigate(null); // Use onNavigate(null) which we updated in Index.tsx to scroll to #products
      return;
    }

    // If it's a legacy hash link (e.g. #Men), use onNavigate
    if (item.href.startsWith('#')) {
      onNavigate(item.category);
    } else {
      // If it's a real path (e.g. /shop/men), use standard navigation
      navigate(item.href);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm transition-all duration-300 pt-[env(safe-area-inset-top)]"
    >
      {/* GPU-optimized announcement marquee */}
      <AnnouncementMarquee textKey="announcementText" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          <div className="flex-shrink-0 flex items-center ltr">
            <h1
              className="text-xl md:text-2xl font-black tracking-tighter text-foreground cursor-pointer select-none uppercase flex items-center gap-0 transition-all duration-300"
              onClick={handleLogoClick}
            >
              {settings.branding?.logo ? (
                <img
                  src={settings.branding.logo}
                  alt={settings.branding.storeName || 'Xcraft'}
                  className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                />
              ) : (
                <span className="text-lg md:text-2xl">{settings.branding?.storeName || 'Xcraft'}</span>
              )}
            </h1>
          </div>

          <nav className="hidden lg:flex space-x-8 items-center rtl:space-x-reverse">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item)}
                className="group relative text-[14px] font-medium text-muted-foreground hover:text-foreground transition-all uppercase tracking-wider py-2"
              >
                <EditableText k={item.labelKey} as="span" />
                {item.tag && (
                  <span className={`ml-2 rtl:mr-2 rtl:ml-0 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${item.tag === 'Sale' ? 'bg-secondary text-secondary-foreground' :
                    item.tag === 'New' ? 'bg-accent text-accent-foreground' :
                      'bg-primary text-primary-foreground'
                    }`}>
                    {item.tag}
                  </span>
                )}
                <span className="absolute bottom-0 left-0 rtl:right-0 rtl:left-auto w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-0 xs:gap-1 md:gap-4">
            {/* Search Toggle */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                onChange={(e) => {
                  const val = e.target.value;
                  onSearchChange(val);
                  setSearchTerm(val); // Local state for preview

                  if (window.location.pathname !== '/') {
                    navigate(`/?q=${val}`, { replace: true });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsSearchOpen(false); // Close preview on enter if desired, or keep open
                    if (window.location.pathname === '/') {
                      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className={`transition-all duration-300 bg-muted border border-border rounded-full outline-none text-xs px-4 py-2 text-primary placeholder-muted-foreground ${isSearchOpen ? 'w-[100px] xs:w-32 md:w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
              />
              <button
                onClick={() => {
                  if (!isSearchOpen) {
                    setIsSearchOpen(true);
                  } else {
                    const inputElement = document.querySelector('input[type="text"][placeholder="' + t('searchPlaceholder') + '"]') as HTMLInputElement;
                    if (inputElement && inputElement.value.trim().length > 0) {
                      if (window.location.pathname === '/') {
                        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                      }
                      // Also close the dropdown if open? Maybe handled by click outside?
                      setSearchTerm(''); // Clear preview
                    } else {
                      setIsSearchOpen(false);
                    }
                  }
                }}
                className="min-w-[36px] min-h-[36px] xs:min-w-[40px] xs:min-h-[40px] md:min-w-[44px] md:min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                aria-label="Toggle search"
              >
                <Search size={20} className="md:w-[22px] md:h-[22px]" />
              </button>

              {/* Search Results Preview Dropdown */}
              {isSearchOpen && searchTerm.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {previewProducts.length > 0 ? (
                    <div className="py-2">
                      {previewProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => {
                            navigate(`/product/${product.id}`);
                            setSearchTerm('');
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                        >
                          <img src={product.images[0]} alt={lang === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name)} className="w-8 h-8 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">
                              {lang === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name)}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{product.category}</span>
                              <span className="text-[10px] font-bold text-primary">{product.salePrice} EGP</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          if (window.location.pathname === '/') {
                            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            navigate(`/?q=${searchTerm}`);
                          }
                          setSearchTerm('');
                        }}
                        className="text-center py-2 border-t border-border mt-1 text-xs font-bold text-primary cursor-pointer hover:bg-muted"
                      >
                        {t('viewAllResults')}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      {t('noResultsFound')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex min-w-[44px] min-h-[44px] items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors outline-none px-2">
                    <User size={22} />
                    <span className="hidden md:inline text-[11px] font-bold uppercase tracking-widest truncate max-w-[100px]">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{t('my_account')}</DropdownMenuLabel>
                  {!(user.role === 'admin' || user.role === 'manager') && (
                    <>
                      <DropdownMenuItem onClick={onAccount}>
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('profile')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onOrders}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>{t('my_orders')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {(user.role === 'admin' || user.role === 'manager') && (
                    <>
                      <DropdownMenuItem onClick={() => {
                        const path = '/admin/dashboard';
                        if (isIframe) window.top!.location.href = path;
                        else navigate(path);
                      }}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>{t('admin_dashboard')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const path = '/admin/site-editor';
                        if (isIframe) window.top!.location.href = path;
                        else navigate(path);
                      }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>{t('admin_site_editor')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={onAccount}
                className="hidden md:flex min-w-[44px] min-h-[44px] items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors px-2"
              >
                <User size={22} />
                <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest"><EditableText k="login" as="span" /></span>
              </button>
            )}

            {/* Language Toggle Button */}
            <button
              onClick={toggleLang}
              aria-label={lang === 'en' ? t('switch_to_arabic') : t('switch_to_english')}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest border border-border rounded-md hover:bg-muted w-10 h-10 p-0"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={openWishlist}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-primary relative transition-colors group"
              aria-label={t('wishlist')}
            >
              <Heart size={22} className="group-hover:scale-105 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute top-2 right-2 rtl:left-2 rtl:right-auto bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-card">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-primary relative transition-colors group"
              aria-label={t('nav_cart')}
            >
              <CartIcon size={22} className="group-hover:scale-105 transition-transform" />
              {cartCount >= 0 && (
                <span className={`absolute top-2 right-2 rtl:left-2 rtl:right-auto bg-foreground text-background text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-card ${cartCount === 0 ? 'hidden' : ''}`}>
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background overflow-y-auto lg:hidden">
          <div className="flex flex-col min-h-full">
            <div className="flex items-center justify-between px-6 py-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary"><EditableText k="menu" as="span" /></h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1">
                <X size={32} className="text-primary" />
              </button>
            </div>

            <div className="flex flex-col">
              {navItems.map((item, idx) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
                  className="flex items-center justify-between px-6 py-5 border-b border-muted hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-foreground uppercase tracking-widest group-hover:text-secondary">
                      <EditableText k={item.labelKey} as="span" />
                    </span>
                    {item.tag && (
                      <span className={`ml-3 rtl:mr-3 rtl:ml-0 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${item.tag === 'Sale' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
                        }`}>{item.tag}</span>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground group-hover:text-secondary rtl:rotate-180" />
                </a>
              ))}
            </div>

            <div className="mt-auto p-6 space-y-4">
              <button
                onClick={() => { onAccount(); setIsMobileMenuOpen(false); }}
                className="w-full bg-primary text-primary-foreground py-4 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-4 rounded"
              >
                <User size={18} /> <EditableText k="signIn" as="span" />
              </button>
              {(!user || (user.role !== 'admin' && user.role !== 'manager')) && (
                <button
                  onClick={() => { navigate('/auth?mode=staff'); setIsMobileMenuOpen(false); }}
                  className="w-full border border-primary-foreground/20 text-muted-foreground py-3 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 rounded hover:bg-muted transition-colors"
                >
                  <LayoutDashboard size={14} /> {t('header_staff_access')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

