
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { SiteSettingsProvider } from "@/config/SiteSettingsContext";
import { EditModeProvider } from "@/admin/EditModeContext";
import { DepartmentProvider } from "./context/DepartmentContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { UIProvider } from "./context/UIContext";

import Index from "./pages/Index";
import GatewayPage from "./pages/GatewayPage";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/static/PrivacyPolicy";
import TermsOfService from "./pages/static/TermsOfService";
import ShippingInfo from "./pages/static/ShippingInfo";
import AboutUs from "./pages/static/AboutUs";
import ContactUs from "./pages/static/ContactUs";
import FAQ from "./pages/static/FAQ";
import OrderConfirmation from "./pages/OrderConfirmation";
import ProfilePage from "./pages/ProfilePage";
import ProductDetails from "./pages/ProductDetails";
import NewsletterPopup from "./components/NewsletterPopup";
import StoreLocator from "./pages/static/StoreLocator";
import HelpCenter from "./pages/static/HelpCenter";
import DottedDemo from "./pages/static/DottedDemo";
import CheckboxDemo from "./pages/static/CheckboxDemo";
import NumericInputDemo from "./pages/static/NumericInputDemo";
import AuthDemo from "./pages/static/AuthDemo";
import MarketingBanner from "./components/MarketingBanner";
import ComparisonModal from "./components/ComparisonModal";
import { Scale } from "lucide-react";
import { Product, User } from "./types";
import { useStorageState } from "./utils/storage";
import CartDrawer from "./components/cart/CartDrawer";
import WishlistDrawer from "./components/wishlist/WishlistDrawer";
import ResetPasswordPage from './pages/ResetPasswordPage';

<Route path="/reset-password/:token" element={<ResetPasswordPage />} />

// Lazy Load Components
const AuthPage = React.lazy(() => import("./components/AuthPage"));
const AdminPage = React.lazy(() => import("./pages/AdminPage"));
const SiteEditorPage = React.lazy(() => import("./pages/admin/SiteEditorPage"));
const EditorPreviewPage = React.lazy(() => import("./pages/admin/EditorPreviewPage"));

const queryClient = new QueryClient();

// Auth Wrapper
const AuthRoute = () => {
  const navigate = useNavigate();
  // We still use the hook for reactive updates, but we'll manually write to storage on login
  const [user, setUser] = useStorageState<User | null>('user', null);

  // Get redirect path from query string
  const query = new URLSearchParams(window.location.search);
  const redirectPath = query.get('redirect');

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'manager') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Redirection logic: use ?redirect=... or default to /shop
        navigate(redirectPath || '/shop', { replace: true });
      }
    }
  }, [user, navigate, redirectPath]);

  const handleLogin = (newUser: User) => {
    // CRITICAL: Write to storage SYNCHRONOUSLY
    // Our updated setStorageItem now dispatches a 'townteam_storage' event
    // which ensures all components (like AdminPage) stay in sync immediately.
    import('./utils/storage').then(({ setStorageItem }) => {
      setStorageItem('user', newUser);
      setUser(newUser);

      // Navigation is now safer as state is synced
      if (newUser.role === 'admin' || newUser.role === 'manager') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Redirection logic: use ?redirect=... or default to /shop
        navigate(redirectPath || '/shop', { replace: true });
      }
    });
  };

  if (user) return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;

  const handleCancel = () => {
    // If we have history within the app, go back, otherwise go home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthPage onLogin={handleLogin} onCancel={handleCancel} />
    </React.Suspense>
  );
};

import { ThemeProvider } from 'next-themes';
import { DottedSurface } from "@/components/ui/dotted-surface";
import { useInitializeProducts } from '@/hooks/useInitializeProducts';

const App = () => {
  const navigate = useNavigate();
  // Initialize demo products on app load
  useInitializeProducts();

  const [compareList, setCompareList] = React.useState<Product[]>([]);
  const [showCompare, setShowCompare] = React.useState(false);

  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <DottedSurface className="fixed inset-0 z-[-1]" />
      <QueryClientProvider client={queryClient}>
        <SiteSettingsProvider>
          <EditModeProvider>
            <LanguageProvider>
              <CartProvider>
                <WishlistProvider>
                  <UIProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />

                      <DepartmentProvider>
                        <CartDrawer />
                        <WishlistDrawer />
                        <MarketingBanner />
                        <NewsletterPopup />

                        {/* Global Compare Float Button */}
                        {compareList.length > 0 && (
                          <button
                            onClick={() => setShowCompare(true)}
                            className="fixed bottom-24 right-5 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 border-2 border-white/20 animate-in slide-in-from-right-10"
                          >
                            <Scale size={20} />
                            <span className="text-xs font-black bg-secondary text-secondary-foreground rounded-full w-5 h-5 flex items-center justify-center absolute -top-2 -right-2">
                              {compareList.length}
                            </span>
                          </button>
                        )}

                        <ComparisonModal
                          isOpen={showCompare}
                          onClose={() => setShowCompare(false)}
                          products={compareList}
                          onRemove={(id) => setCompareList(prev => prev.filter(p => p.id !== id))}
                          onAddToCart={(p) => {
                            setShowCompare(false);
                            navigate(`/product/${p.id}`);
                          }}
                        />

                        <Routes>
                          {/* Public Routes */}
                          <Route path="/" element={<GatewayPage />} />
                          <Route path="/shop" element={<Index onToggleCompare={toggleCompare} compareList={compareList} />} />
                          <Route path="/shop/:category" element={<Index onToggleCompare={toggleCompare} compareList={compareList} />} />

                          {/* Specific Brand Routes for House of Brands */}
                          <Route path="/splash" element={<Index onToggleCompare={toggleCompare} compareList={compareList} />} />
                          <Route path="/babyshop" element={<Index onToggleCompare={toggleCompare} compareList={compareList} />} />
                          <Route path="/kids" element={<Index onToggleCompare={toggleCompare} compareList={compareList} />} />
                          <Route path="/men" element={<Index onToggleCompare={toggleCompare} compareList={compareList} />} />
                          <Route path="/women" element={<Index onToggleCompare={toggleCompare} compareList={compareList} />} />

                          {/* Authentication */}
                          <Route path="/auth" element={<AuthRoute />} />

                          {/* Core Pages */}
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms-of-service" element={<TermsOfService />} />
                          <Route path="/shipping-info" element={<ShippingInfo />} />
                          <Route path="/about-us" element={<AboutUs />} />
                          <Route path="/contact-us" element={<ContactUs />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/order-confirmation" element={<OrderConfirmation />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/product/:id" element={<ProductDetails onToggleCompare={toggleCompare} compareList={compareList} />} />

                          <Route path="/store-locator" element={<StoreLocator />} />
                          <Route path="/help-center" element={<HelpCenter />} />
                          <Route path="/demo-one" element={<DottedDemo />} />
                          <Route path="/checkbox-demo" element={<CheckboxDemo />} />
                          <Route path="/numeric-input-demo" element={<NumericInputDemo />} />
                          <Route path="/auth-demo" element={<AuthDemo />} />

                          {/* Admin Routes */}
                          <Route path="/admin/dashboard" element={
                            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>}>
                              <AdminPage />
                            </React.Suspense>
                          } />
                          <Route path="/admin/site-editor" element={
                            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Editor...</div>}>
                              <SiteEditorPage />
                            </React.Suspense>
                          } />

                          {/* Editor Preview */}
                          <Route path="/editor-preview" element={
                            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Preview...</div>}>
                              <EditorPreviewPage />
                            </React.Suspense>
                          } />

                          {/* Catch-all 404 */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </DepartmentProvider>

                    </TooltipProvider>
                  </UIProvider>
                </WishlistProvider>
              </CartProvider>
            </LanguageProvider>
          </EditModeProvider>
        </SiteSettingsProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
