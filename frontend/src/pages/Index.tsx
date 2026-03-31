import * as React from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin);
}
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Product, CartItem, Order, User } from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import { useStorageState, isValidEgyptianPhone, generateOrderId } from '../utils/storage';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { EditableText } from '../components/ui/editable-text';
import { EditableSection } from '../components/ui/editable-section';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useUI } from '@/context/UIContext';

import WebGLHero from '../components/WebGLHero';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import FeaturedSection from '../components/FeaturedSection';
import CategorySection from '../components/CategorySection';
import BestSellersSection from '../components/BestSellersSection';
import Breadcrumbs from '../components/ui/breadcrumbs';
import ProductCard from '../components/ui/product-card-1';
import FiltersSidebar from '../components/filters/FiltersSidebar';
import FiltersPopover from '../components/filters/FiltersPopover';
import {
  FilterState,
  initialFilterState,
  getMinMaxPrice,
  getUniqueCategories,
  getUniqueSizes,
  getUniqueColors
} from '../components/filters/filter-utils';
import ErrorBoundary from '../components/ErrorBoundary';
import ScrollReveal from '../components/ui/scroll-reveal';

// Lazy load heavy components
const CartDrawer = React.lazy(() => import('../components/CartDrawer'));
const AuthPage = React.lazy(() => import('../components/AuthPage'));
const AdminDashboard = React.lazy(() => import('../components/AdminDashboard'));
const ProductModal = React.lazy(() => import('../components/ProductModal'));
const WishlistView = React.lazy(() => import('../components/WishlistView'));
const UserOrders = React.lazy(() => import('../components/UserOrders'));
const ProductPage = React.lazy(() => import('../components/ProductPage'));

// ... (inside component)




type View = 'home' | 'collection' | 'product' | 'auth' | 'admin' | 'wishlist' | 'orders';

interface IndexProps {
  onToggleCompare?: (product: Product) => void;
  compareList?: Product[];
}

const Index: React.FC<IndexProps> = ({ onToggleCompare, compareList }) => {
  const navigate = useNavigate();
  const { category: urlCategory } = useParams(); // Get category from URL
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const { settings } = useSiteSettings();


  // State
  const [view, setView] = React.useState<View>('home');

  // Products should be read-only from localStorage - only admin can modify them
  // But we need to reload when admin changes them
  // Products (Centralized Hook)
  const { products } = useProducts();

  // const [cart, setCart] = useStorageState<CartItem[]>('cart', []); // Removed
  const [orders, setOrders] = useStorageState<Order[]>('orders', []);
  // const [wishlist, setWishlist] = useStorageState<string[]>('wishlist', []); // Removed
  const [user, setUser] = useStorageState<User | null>('user', null);

  // Contexts
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { openCart, closeCart, openWishlist } = useUI();

  // Filter State (Live)
  const [filters, setFilters] = React.useState<FilterState>(initialFilterState);
  const [maxPrice, setMaxPrice] = React.useState(10000);

  // Search State via URL
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const handleSearchChange = (query: string) => {
    if (query) {
      setSearchParams({ q: query }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // Derived Data for Filters
  const availableCategories = React.useMemo(() => getUniqueCategories(products), [products]);
  const availableSizes = React.useMemo(() => getUniqueSizes(products), [products]);
  const availableColors = React.useMemo(() => getUniqueColors(products), [products]);

  React.useEffect(() => {
    // If we have categories filtered, find max among them, else global max
    const relevantProducts = filters.categories.length > 0
      ? products.filter(p => filters.categories.includes(p.category))
      : products;

    const [_, max] = getMinMaxPrice(relevantProducts.length > 0 ? relevantProducts : products);
    const newMax = max || 10000;
    setMaxPrice(newMax);

    setFilters(prev => {
      // Auto-expand price range if it was at the default limit (10000) and new max is higher
      if (prev.price[1] === 10000 && newMax > 10000) {
        return { ...prev, price: [prev.price[0], newMax] };
      }
      // Auto-shrink price range if it exceeds the new max
      if (prev.price[1] > newMax && newMax > 0) {
        return { ...prev, price: [prev.price[0], newMax] };
      }
      return prev;
    });
  }, [products, filters.categories]);

  // Sync URL Category with Filters
  React.useEffect(() => {
    if (urlCategory) {
      // If URL has a category (e.g. /shop/men), allow case-insensitive matching
      // Capitalize first letter basic normalization
      const normalizedCategory = urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1).toLowerCase();

      // IMPORTANT: Only update if the category actually changed to avoid resets
      // when other filters (like price) are modified.
      if (filters.categories.length !== 1 || filters.categories[0] !== normalizedCategory) {
        const newFilters = {
          ...initialFilterState,
          price: [0, maxPrice] as [number, number],
          categories: [normalizedCategory]
        };

        setFilters(newFilters);

        // Auto-switch to collection/home view if not already there
        if (view !== 'home' && view !== 'collection') {
          setView('home');
        }

        // Attempt to scroll to products section
        setTimeout(() => {
          const section = document.getElementById('products');
          if (section) {
            gsap.to(window, {
              duration: 1.2,
              scrollTo: { y: section.offsetTop - 80, autoKill: true },
              ease: "power3.inOut"
            });
          }
        }, 100);
      }
    } else if (window.location.pathname.startsWith('/shop')) {
      // If we are on the shop page but no category is specified, clear filters
      // but only if filters are actually set to avoid loops.
      if (filters.categories.length > 0) {
        handleClearFilters();
      }
    }
  }, [urlCategory]); // Removed maxPrice dependency to break the loop


  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);
  // const [isCartOpen, setIsCartOpen] = React.useState(false); // Removed
  // const [searchQuery, setSearchQuery] = React.useState(''); // Removed local state

  // Filtered products
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      // 1. Search (Always global)
      if (searchQuery) {
        const sq = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(sq);
        const matchAr = p.name_ar?.toLowerCase().includes(sq);
        const matchEn = p.name_en?.toLowerCase().includes(sq);
        if (!matchName && !matchAr && !matchEn) return false;
      }

      // 2. Categories
      if (filters.categories.length > 0) {
        let matches = false;
        const normalizedProductCat = p.category.toLowerCase();
        const normalizedFilterCats = filters.categories.map(c => c.toLowerCase());

        if (normalizedFilterCats.includes(normalizedProductCat)) matches = true;
        // Special mapping for Collections via featuredIn tags
        if (normalizedFilterCats.includes('new') && (p.badge === 'New' || p.featuredIn?.includes('New Arrivals'))) matches = true;
        if (normalizedFilterCats.includes('offers') && (p.discount > 0 || p.badge === 'Sale' || p.featuredIn?.includes('Offers'))) matches = true;
        if (normalizedFilterCats.includes('best-sellers') && p.featuredIn?.includes('Best Sellers')) matches = true;

        if (!matches) return false;
      }

      // 3. Price
      if (p.salePrice < filters.price[0] || p.salePrice > filters.price[1]) return false;

      // 4. Sizes
      if (filters.sizes.length > 0) {
        const hasSize = (p.sizes ?? []).some(s =>
          filters.sizes.includes(typeof s === 'string' ? s : (s as { label: string }).label)
        );
        if (!hasSize) return false;
      }

      // 5. Colors
      if (filters.colors.length > 0) {
        const hasColor = p.colors.some(c => filters.colors.includes(c.hex));
        if (!hasColor) return false;
      }

      // 6. In Stock
      if (filters.inStockOnly && p.stock <= 0) return false;

      return true;
    });
  }, [products, searchQuery, filters]);

  // Handlers
  const handleClearFilters = () => {
    const cleared = { ...initialFilterState, price: [0, maxPrice] as [number, number] };
    setFilters(cleared);
  };

  const handleNavigate = (category: string | null) => {
    // When clicking a category chip, we set that category as the ONLY drafted/applied filter and scroll
    if (category) {
      const newFilters = {
        ...initialFilterState,
        price: [0, maxPrice] as [number, number],
        categories: [category]
      };
      setFilters(newFilters);

      setView('home');
      setTimeout(() => {
        const section = document.getElementById('products');
        if (section) {
          gsap.to(window, {
            duration: 1.2,
            scrollTo: { y: section.offsetTop - 80, autoKill: true },
            ease: "power3.inOut"
          });
        }
      }, 100);
    } else {
      // Clear all
      handleClearFilters();
      setTimeout(() => {
        const section = document.getElementById('products');
        if (section) {
          gsap.to(window, {
            duration: 1.2,
            scrollTo: { y: section.offsetTop - 80, autoKill: true },
            ease: "power3.inOut"
          });
        }
      }, 100);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('product');
    window.scrollTo(0, 0);
  };

  const handleCheckout = () => {
    // setIsCartOpen(false); // Handled by context
    navigate('/checkout');
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'admin' || loggedInUser.role === 'manager') {
      setView('admin');
    } else {
      setView('home');
    }
    toast({ title: 'Welcome!', description: `Logged in as ${loggedInUser.name}` });
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const getStock = (productId: string) => products.find(p => p.id === productId)?.stock || 0;

  const handleScrollToFeatured = () => {
    const element = document.getElementById('home-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render based on view
  if (view === 'auth') {
    return (
      <React.Suspense fallback={<div className="min-h-screen" />}>
        <AuthPage onLogin={handleLogin} onCancel={() => setView('home')} />
      </React.Suspense>
    );
  }

  if (view === 'admin' && user && (user.role === 'admin' || user.role === 'manager')) {
    // Redirect to /admin route instead of rendering here
    navigate('/admin');
    return <div className="min-h-screen flex items-center justify-center">Redirecting to admin...</div>;
  }


  return (
    <ErrorBoundary>
      {/* Background removed, using global DottedSurface */}
      <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
        <div className="absolute top-0 w-full z-50">
          <Header
            onSearchChange={handleSearchChange}
            onNavigate={handleNavigate}
            onAccount={() => navigate('/profile')}
            onLogout={handleLogout}
            onOrders={() => setView('orders')}
            user={user}
          />
        </div>

        <main className="flex-grow">
          {view === 'home' && (
            <>
              <WebGLHero onNavigate={handleNavigate} />
              <section key="products" id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
                <ScrollReveal variant="fadeUp">
                  <div className="flex flex-col items-center mb-8">
                    {/* Breadcrumbs for category view */}
                    <div className="mb-4">
                      <Breadcrumbs
                        items={[
                          ...(filters.categories.length === 1 ? [{ label: <EditableText k={`category_${filters.categories[0].toLowerCase()}`} as="span" /> }] : [{ label: <EditableText k="shop_full_collection" as="span" /> }])
                        ]}
                      />
                    </div>

                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter text-center">
                      {filters.categories.length === 1 ? (
                        lang === 'ar' ? (
                          <span><span className="text-muted-foreground text-xl"><EditableText k="shop_collection" as="span" /></span> <EditableText k={`category_${filters.categories[0].toLowerCase()}`} as="span" /></span>
                        ) : (
                          <span><EditableText k={`category_${filters.categories[0].toLowerCase()}`} as="span" /> <span className="text-muted-foreground text-xl"><EditableText k="shop_collection" as="span" /></span></span>
                        )
                      ) : (
                        <span><EditableText k="shop_full_collection" as="span" /></span>
                      )}
                    </h2>

                  </div>
                </ScrollReveal>

                <div className="md:hidden flex justify-between items-center mb-4">
                  <span className="text-sm text-foreground font-bold">
                    {filteredProducts.length} <EditableText k="shop_results" as="span" />
                  </span>
                  <FiltersPopover
                    filters={filters}
                    setFilters={setFilters}
                    availableCategories={availableCategories}
                    availableSizes={availableSizes}
                    availableColors={availableColors}
                    maxPrice={maxPrice}
                    onApply={() => { }} // No-op since it's live
                    onClear={handleClearFilters}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-8 align-start">
                  <FiltersSidebar
                    filters={filters}
                    setFilters={setFilters}
                    availableCategories={availableCategories}
                    availableSizes={availableSizes}
                    availableColors={availableColors}
                    maxPrice={maxPrice}
                    onApply={() => { }} // No-op/Hidden in live mode
                    onClear={handleClearFilters}
                  />

                  <div className="flex-1">
                    {filteredProducts.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                        {filteredProducts.map((product, index) => (
                          <ScrollReveal key={product.id} variant="fadeUp" delay={index * 0.05}>
                            <ProductCard
                              product={product}
                              onClick={handleProductClick}
                              onAddToCart={(p, c, s) => {
                                addToCart(p, c || '', s || '');
                                toast({ title: 'Added to bag', description: `${p.name} added to your bag.` });
                              }}
                              onQuickView={setQuickViewProduct}
                              onToggleWishlist={() => toggleWishlist(product.id)}
                              isWishlisted={isInWishlist(product.id)}
                            />
                          </ScrollReveal>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-muted-foreground bg-muted/30 rounded-lg border border-border">
                        <p><EditableText k="filters_noResults" as="span" /></p>
                        <button onClick={handleClearFilters} className="mt-4 text-foreground underline font-black uppercase text-xs tracking-widest">
                          <EditableText k="filters_clear" as="span" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          {view === 'product' && selectedProduct && (
            <React.Suspense fallback={<div className="min-h-screen" />}>
              <ProductPage
                product={selectedProduct}
                onBack={() => setView('home')}
                onAddToCart={(p, color, size) => addToCart(p, color, size, 1)}
                onProductClick={handleProductClick}
                isWishlisted={wishlist.includes(selectedProduct.id)}
                onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
                catalog={products}
              />
            </React.Suspense>
          )}

          {view === 'wishlist' && (
            <React.Suspense fallback={<div className="py-20 text-center">Loading Wishlist...</div>}>
              <WishlistView
                wishlist={wishlist}
                products={products}
                onSetView={setView}
                onProductClick={handleProductClick}
                onAddToCart={(p, qty) => {
                  addToCart(p); // default qty 1 if not supported, or loop
                  toast({ title: 'Added to bag' });
                }}
                onQuickView={setQuickViewProduct}
                onToggleWishlist={(p) => toggleWishlist(p.id)}
              />
            </React.Suspense>
          )}

          {view === 'orders' && user && (
            <React.Suspense fallback={<div className="py-20 text-center">Loading Orders...</div>}>
              <UserOrders
                orders={orders}
                user={user}
                onBack={() => setView('home')}
              />
            </React.Suspense>
          )}
        </main>

        <Footer onNavigate={handleNavigate} />

        {/* Hide BottomNav on Product Page to prevent overlap with Add to Cart bar */}
        {view !== 'product' && (
          <BottomNav
            activeView={view}
            onNavigate={(v) => {
              if (v === 'collection') {
                handleNavigate(null);
              } else {
                if (view === 'home') {
                  gsap.to(window, { duration: 1, scrollTo: 0, ease: "power3.inOut" });
                }
                setView(v);
              }
            }}
            onAccount={() => navigate('/profile')}
            onOpenCart={openCart}
            onWishlist={openWishlist}
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          />
        )}

        <React.Suspense fallback={null}>
          <ProductModal
            product={quickViewProduct}
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={(p, color, size) => {
              addToCart(p, color, size);
              toast({ title: 'Added to bag' });
            }}
          />
          {/* CartDrawer is Global now */}
        </React.Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default Index;

