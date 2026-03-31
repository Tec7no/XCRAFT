import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  ShieldCheck,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Copy,
  Save,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Boxes,
  Upload,
  Archive,
  RefreshCw,
  RotateCcw
} from './icons';
import { UserRole, Product, Order, OrderStatus, ProductSpecificationSection } from '../types';
import ImagePlaceholder from './ImagePlaceholder';
import ProductForm from './ProductForm';
import OrderDetailsPanel from './OrderDetailsPanel';
import { listOrders, deleteOrder as deleteOrderFromStore, archiveOrder as archiveOrderFromStore } from '@/utils/ordersStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { NumericInput } from './ui/numeric-input';
import { useToast } from '@/hooks/use-toast';

import { PREDEFINED_ROUTES } from '@/config/predefined-routes';
import { Discount } from '@/types';
import { useStorageState } from '@/utils/storage';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { BannerSettingsPanel } from '@/admin/BannerSettingsPanel';

type AdminTab = 'overview' | 'inventory' | 'inventory-summary' | 'low-stock' | 'categories' | 'orders' | 'coupons' | 'marketing' | 'content' | 'settings' | 'account';

interface AdminDashboardProps {
  onExit: () => void;
  userRole: UserRole;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit, userRole, products, setProducts, orders, setOrders }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, updateSettings, publishDraft } = useSiteSettings();
  const { lang, t, toggleLang } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<AdminTab>('overview');
  const [discounts, setDiscounts] = React.useState<Discount[]>([]);
  const [couponsLoading, setCouponsLoading] = React.useState(false);

  // Fetch coupons from API on mount
  React.useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const raw = localStorage.getItem('townteam_user');
        const token = raw ? JSON.parse(raw)?.token : null;
        if (!token) return;
        const res = await fetch('http://localhost:5000/coupons', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setDiscounts(data.coupons);
      } catch (err) {
        console.error('Failed to fetch coupons:', err);
      }
    };
    fetchCoupons();
  }, []);
  const [search, setSearch] = React.useState('');
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [orderTab, setOrderTab] = React.useState('under_review');
  const [orderToDelete, setOrderToDelete] = React.useState<string | null>(null);
  const [orderToArchive, setOrderToArchive] = React.useState<{ id: string, archive: boolean } | null>(null);
  const [contentTab, setContentTab] = React.useState('gateway');
  const [settingsTab, setSettingsTab] = React.useState('shipping');
  const [adminCreds, setAdminCreds] = React.useState(() => {
    try {
      const raw = localStorage.getItem('townteam_user');
      if (!raw) return { name: '', email: '' };
      const u = JSON.parse(raw);
      return { name: u.name || '', email: u.email || '' };
    } catch { return { name: '', email: '' }; }
  });
  const [passwordForm, setPasswordForm] = React.useState({ current: '', next: '', confirm: '' });
  const [accountLoading, setAccountLoading] = React.useState(false);

  const canAdd = userRole === 'admin' || userRole === 'manager';
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const stats = React.useMemo(() => ({
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock < 10).length,
    totalValue: products.reduce((acc, p) => acc + (p.salePrice * p.stock), 0),
    categories: new Set(products.map(p => p.category)).size,
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'pending_review').length
  }), [orders, products]);

  const categoryStats = React.useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    products.forEach(p => {
      const current = map.get(p.category) || { count: 0, value: 0 };
      map.set(p.category, {
        count: current.count + 1,
        value: current.value + (p.salePrice * p.stock)
      });
    });
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }));
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    if (activeTab === 'low-stock') {
      return products.filter(p => p.stock < 10);
    }
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search, activeTab]);


  const handleDeleteOrder = (orderId: string) => {
    deleteOrderFromStore(orderId);
    setOrders(listOrders());
    setOrderToDelete(null);
    toast({ title: t('admin_order_deleted_title'), description: t('admin_order_deleted_desc') });
  };

  const handleArchiveOrder = (orderId: string, archive: boolean) => {
    archiveOrderFromStore(orderId, archive);
    setOrders(listOrders());
    setOrderToArchive(null);
    toast({
      title: archive ? t('admin_order_archived_title') : t('admin_order_restored_title'),
      description: archive ? t('admin_order_archived_desc') : t('admin_order_restored_desc')
    });
  };

  const activeOrders = React.useMemo(() => orders.filter(o => !o.archived), [orders]);
  const archivedOrders = React.useMemo(() => orders.filter(o => o.archived), [orders]);


  return (
    <div className="min-h-screen font-sans text-foreground selection:bg-primary/20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/20">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span>Xcraft<span className="text-muted-foreground font-normal">ADMIN</span></span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            <div className="hidden xs:block text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              v2.4.0 • {userRole.toUpperCase()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                publishDraft(settings);
                // Also sync to MongoDB
                try {
                  const raw = localStorage.getItem('townteam_user');
                  const token = raw ? JSON.parse(raw)?.token : null;
                  await fetch('http://localhost:5000/site-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ settings }),
                  });
                } catch (err) {
                  console.error('Failed to sync settings to DB:', err);
                }
                toast({
                  title: t('admin_save_changes'),
                  description: t('admin_save_changes_desc')
                });
              }}
              className="gap-2 text-[10px] uppercase tracking-wider font-bold h-8 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all px-2 sm:px-3"
            >
              <Save className="h-3 w-3" /> <span className="hidden xs:inline">{t('admin_save_changes')}</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/admin/site-editor')}
              className="gap-2 text-[10px] uppercase tracking-wider font-bold h-8 bg-[#0D0D0D] text-white hover:bg-[#C8A96A] hover:text-[#0D0D0D] px-2 sm:px-3"
            >
              <Pencil className="h-3 w-3" /> <span className="hidden xs:inline">{t('admin_site_editor')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLang}
              className="min-w-[40px] h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest border border-border rounded-md hover:bg-muted"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExit}
              className="gap-2 text-[10px] uppercase tracking-wider font-bold h-8 px-2 sm:px-3"
            >
              <LogOut className="h-3 w-3" /> <span className="hidden xs:inline">{t('admin_exit')}</span>
            </Button>
          </div>
        </div >
      </header >

      {/* Main Content Area */}
      < main className="container py-8 animate-in fade-in slide-in-from-bottom-4 duration-500" >
        {/* Dashboard Header & Tabs */}
        < div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8" >
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">{t('admin_dashboard')}</h1>
            <p className="text-muted-foreground text-sm">{t('admin_subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'overview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {t('admin_tab_overview')}
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'inventory' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {t('admin_tab_inventory')}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'orders' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {t('admin_tab_orders')}
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'coupons' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {t('admin_tab_coupons')}
              </button>

              <button
                key="content"
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'content' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {t('admin_tab_content')}
              </button>
              <button
                key="settings"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'settings' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {t('admin_tab_settings')}
              </button>
              <button
                key="account"
                onClick={() => setActiveTab('account')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'account' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {t('admin_tab_account')}
              </button>
            </nav>
          </div>
        </div >

        {/* Dynamic Title based on Active Tab */}
        < div className="flex items-center justify-between mb-6" >
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">
              {activeTab === 'overview' && t('admin_tab_overview')}
              {activeTab === 'inventory' && t('admin_tab_inventory')}
              {activeTab === 'inventory-summary' && t('admin_tab_inventory_summary')}
              {activeTab === 'low-stock' && t('admin_stat_low_stock')}
              {activeTab === 'categories' && t('admin_tab_categories')}
              {activeTab === 'orders' && t('admin_tab_orders')}
              {activeTab === 'coupons' && t('admin_tab_coupons')}
              {activeTab === 'marketing' && t('admin_tab_marketing')}
              {activeTab === 'content' && t('admin_tab_content')}
              {activeTab === 'settings' && t('admin_tab_settings')}
              {activeTab === 'account' && t('admin_tab_account')}
            </h2>
          </div>

          {
            activeTab === 'inventory' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('admin_search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-[200px] lg:w-[300px] bg-background border border-border rounded-md pl-9 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <Button size="sm" onClick={() => setIsAdding(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> {t('admin_add_product')}
                </Button>
              </div>
            )
          }
        </div >

        {/* --- OVERVIEW TAB --- */}
        {
          activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-sm hover:shadow-md transition-all group text-left cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[#F8F5F1] rounded-lg group-hover:bg-[#C8A96A]/10 transition-colors">
                      <TrendingUp className="text-[#C8A96A]" size={24} />
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                      <span className="text-green-600 font-bold flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +12%</span>
                    </div>
                  </div>
                  <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{t('admin_stat_revenue')}</h3>
                  <p className="text-2xl font-serif font-medium text-[#0D0D0D] tracking-tight">EGP {stats.totalValue.toLocaleString()}</p>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-sm hover:shadow-md transition-all group text-left cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[#F8F5F1] rounded-lg group-hover:bg-[#C8A96A]/10 transition-colors">
                      <ShoppingCart className="text-[#C8A96A]" size={24} />
                    </div>
                  </div>
                  <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{t('admin_stat_orders')}</h3>
                  <p className="text-2xl font-serif font-medium text-[#0D0D0D] tracking-tight">{stats.totalOrders}</p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{stats.pendingOrders}</span> {t('admin_stat_pending')}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-sm hover:shadow-md transition-all group text-left cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[#F8F5F1] rounded-lg group-hover:bg-[#C8A96A]/10 transition-colors">
                      <Package className="text-[#C8A96A]" size={24} />
                    </div>
                  </div>
                  <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{t('admin_stat_products')}</h3>
                  <p className="text-2xl font-serif font-medium text-[#0D0D0D] tracking-tight">{stats.totalProducts}</p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{stats.categories}</span> {t('admin_stat_categories')}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('low-stock')}
                  className="bg-white p-6 rounded-xl border border-[#D8D2C8] shadow-sm hover:shadow-md transition-all group text-left cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[#F8F5F1] rounded-lg group-hover:bg-[#C8A96A]/10 transition-colors">
                      <AlertTriangle className="text-[#C8A96A]" size={24} />
                    </div>
                  </div>
                  <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{t('admin_stat_low_stock')}</h3>
                  <p className="text-2xl font-serif font-medium text-[#0D0D0D] tracking-tight">{stats.lowStock}</p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-bold text-[#C8A96A]">{stats.lowStock}</span> {t('admin_stat_restock')}
                  </div>
                </button>
              </div>
            </div>
          )
        }

        {/* --- INVENTORY TAB --- */}
        {
          (activeTab === 'inventory' || activeTab === 'low-stock') && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
                  <div className="min-w-[800px] lg:min-w-0">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="px-6 py-4">{t('admin_table_product')}</th>
                          <th className="px-6 py-4">{t('admin_table_category')}</th>
                          <th className="px-6 py-4 text-center">{t('admin_table_stock')}</th>
                          <th className="px-6 py-4 text-right">{t('admin_table_price')}</th>
                          <th className="px-6 py-4 text-center">{t('admin_table_status')}</th>
                          <th className="px-6 py-4 text-right">{t('admin_table_actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                              <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                                <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div>
                                <div className="text-foreground font-semibold">{lang === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name)}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]">{lang === 'ar' ? (product.description_ar || product.description) : (product.description_en || product.description)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="secondary" className="font-mono text-[10px]">{product.category}</Badge>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`font-mono font-bold ${product.stock < 10 ? 'text-destructive' : 'text-foreground'}`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono">
                              EGP {product.salePrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className="uppercase text-[10px]">
                                {product.stock > 0 ? t('admin_status_in_stock') : t('admin_status_out_of_stock')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setIsAdding(false);
                                  }}
                                  disabled={!canEdit}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    if (window.confirm(t('admin_product_delete_confirm'))) {
                                      setProducts(products.filter(p => p.id !== product.id));
                                      toast({
                                        title: t('admin_product_deleted_title'),
                                        description: t('admin_product_deleted_desc')
                                      });
                                    }
                                  }}
                                  disabled={!canDelete}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {filteredProducts.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    <div className="bg-muted inline-flex p-4 rounded-full mb-4">
                      <Search className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold">{t('admin_no_products')}</h3>
                    <p className="text-sm mt-1">{t('admin_no_products_desc')}</p>
                  </div>
                )}
              </div>
            </div>
          )
        }

        {/* --- ORDERS TAB --- */}
        {
          activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center space-x-2 border-b border-border pb-4">
                <Button
                  variant={orderTab === 'under_review' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setOrderTab('under_review')}
                  className="gap-2"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> {t('admin_order_under_review')}
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{activeOrders.filter(o => o.status === 'pending_review').length}</Badge>
                </Button>
                <Button
                  variant={orderTab === 'active' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setOrderTab('active')}
                  className="gap-2"
                >
                  <Package className="h-3.5 w-3.5" /> {t('admin_order_all_active')}
                  <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">{activeOrders.length}</Badge>
                </Button>
                <Button
                  variant={orderTab === 'archived' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setOrderTab('archived')}
                  className="gap-2"
                >
                  <Archive className="h-3.5 w-3.5" /> {t('admin_order_archive')}
                  <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">{archivedOrders.length}</Badge>
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order List */}
                <div className="lg:col-span-1 space-y-4">
                  {(orderTab === 'archived' ? archivedOrders : activeOrders)
                    .filter(o => orderTab === 'under_review' ? o.status === 'pending_review' : true)
                    .map(order => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`bg-card border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedOrder?.id === order.id ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
                          <Badge className={`text-[10px] uppercase ${order.status === 'pending_review' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                            order.status === 'delivered' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                              'bg-gray-500/10 text-gray-600 border-gray-500/20'
                            }`}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="font-bold text-sm mb-1">{order.customer?.fullName || 'Guest'}</div>
                        <div className="flex justify-between items-end">
                          <div className="text-xs text-muted-foreground">
                            {order.items.length} {t('admin_order_items')} • {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="font-mono font-bold text-sm">
                            EGP {order.total.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Empty State */}
                  {((orderTab === 'archived' ? archivedOrders : activeOrders)
                    .filter(o => orderTab === 'under_review' ? o.status === 'pending_review' : true).length === 0) && (
                      <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                        {t('admin_no_orders')}
                      </div>
                    )}
                </div>

                {/* Order Details Panel */}
                <div className="lg:col-span-2">
                  {selectedOrder ? (
                    <OrderDetailsPanel
                      order={selectedOrder}
                      onUpdate={(updatedOrder) => {
                        setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                        setSelectedOrder(updatedOrder);
                        toast({ title: t('admin_order_updated_title'), description: t('admin_order_updated_desc').replace('{{id}}', updatedOrder.id) });
                      }}
                      onClose={() => setSelectedOrder(null)}
                      onDelete={() => setOrderToDelete(selectedOrder.id)}
                      onArchive={() => setOrderToArchive({ id: selectedOrder.id, archive: !selectedOrder.archived })}
                    />
                  ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-muted/20 border border-dashed rounded-xl p-8 text-center text-muted-foreground">
                      <div className="bg-muted p-4 rounded-full mb-4">
                        <ShoppingCart className="h-8 w-8 opacity-50" />
                      </div>
                      <h3 className="text-lg font-bold">{t('admin_select_order')}</h3>
                      <p className="text-sm max-w-xs mx-auto">{t('admin_select_order_desc')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }



        {/* --- COUPONS TAB --- */}
        {
          activeTab === 'coupons' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> {t('admin_coupons_title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t('admin_coupons_desc')}</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('admin_coupon_new_code')}
                    id="new-coupon-code"
                    className="w-40 font-mono uppercase"
                  />
                  <Select
                    onValueChange={(val) => {
                      const el = document.getElementById('new-coupon-type') as HTMLInputElement;
                      if (el) el.value = val;
                    }}
                    defaultValue="percentage"
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t('admin_coupon_type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{t('admin_coupon_type_percent')}</SelectItem>
                      <SelectItem value="fixed">{t('admin_coupon_type_fixed')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" id="new-coupon-type" defaultValue="percentage" />
                  <Input
                    type="number"
                    placeholder={t('admin_coupon_value')}
                    id="new-coupon-value"
                    className="w-24"
                    min="0"
                  />
                  <Button
                    onClick={async () => {
                      const codeInput = document.getElementById('new-coupon-code') as HTMLInputElement;
                      const typeInput = document.getElementById('new-coupon-type') as HTMLInputElement;
                      const valueInput = document.getElementById('new-coupon-value') as HTMLInputElement;

                      if (codeInput.value && valueInput.value) {
                        setCouponsLoading(true);
                        try {
                          const raw = localStorage.getItem('townteam_user');
                          const token = raw ? JSON.parse(raw)?.token : null;
                          const res = await fetch('http://localhost:5000/coupons', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                              code: codeInput.value.toUpperCase(),
                              type: (typeInput.value as 'percentage' | 'fixed') || 'percentage',
                              value: Number(valueInput.value),
                            }),
                          });
                          const data = await res.json();
                          if (!data.success) throw new Error(data.message);
                          setDiscounts(prev => [...prev, data.coupon]);
                          toast({ title: t('admin_coupon_created'), description: t('admin_coupon_created_desc').replace('{{code}}', data.coupon.code) });
                          codeInput.value = '';
                          valueInput.value = '';
                        } catch (err: any) {
                          toast({ title: t('admin_coupon_error'), description: err.message, variant: "destructive" });
                        } finally {
                          setCouponsLoading(false);
                        }
                      } else {
                        toast({ title: t('admin_coupon_error'), description: t('admin_coupon_error_desc'), variant: "destructive" });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> {t('admin_coupon_add')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discounts.map((coupon) => (
                  <Card key={coupon.id} className={`transition-all ${coupon.active ? 'border-primary/50' : 'opacity-60 grayscale'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="font-mono text-xl tracking-wider">{coupon.code}</CardTitle>
                      <Badge variant={coupon.active ? 'default' : 'secondary'}>
                        {coupon.active ? t('admin_coupon_active') : t('admin_coupon_inactive')}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">
                        {coupon.type === 'percentage' ? `${coupon.value}% ${t('admin_coupon_off')}` : `EGP ${coupon.value} ${t('admin_coupon_off')}`}
                      </div>
                      <div className="text-xs text-muted-foreground mb-4">
                        {t('admin_coupon_used')} {coupon.usageCount} {t('admin_coupon_times')}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const raw = localStorage.getItem('townteam_user');
                              const token = raw ? JSON.parse(raw)?.token : null;
                              const res = await fetch(`http://localhost:5000/coupons/${coupon.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ active: !coupon.active }),
                              });
                              const data = await res.json();
                              if (data.success) setDiscounts(discounts.map(d => d.id === coupon.id ? data.coupon : d));
                            } catch (err) {
                              toast({ title: 'Error', description: 'Failed to update coupon', variant: 'destructive' });
                            }
                          }}
                          className="flex-1"
                        >
                          {coupon.active ? t('admin_coupon_deactivate') : t('admin_coupon_activate')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (confirm(t('admin_coupon_delete_confirm'))) {
                              try {
                                const raw = localStorage.getItem('townteam_user');
                                const token = raw ? JSON.parse(raw)?.token : null;
                                const res = await fetch(`http://localhost:5000/coupons/${coupon.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` },
                                });
                                const data = await res.json();
                                if (data.success) setDiscounts(discounts.filter(d => d.id !== coupon.id));
                              } catch (err) {
                                toast({ title: 'Error', description: 'Failed to delete coupon', variant: 'destructive' });
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {discounts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    <div className="bg-muted inline-flex p-4 rounded-full mb-4">
                      <TrendingUp className="h-6 w-6 opacity-50" />
                    </div>
                    <p>{t('admin_coupon_empty')}</p>
                  </div>
                )}
              </div>
            </div>
          )
        }

        {/* --- CONTENT MANAGEMENT TAB --- */}
        {
          activeTab === 'content' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex gap-2 border-b pb-2 overflow-x-auto">
                {['gateway', 'ticker', 'contact', 'faq', 'legal', 'footer'].map((tab) => (
                  <Button
                    key={tab}
                    variant={contentTab === tab ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setContentTab(tab)}
                    className="uppercase tracking-wider text-xs font-bold"
                  >
                    {t(`admin_content_${tab}`)}
                  </Button>
                ))}
              </div>

              {contentTab === 'gateway' && (
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('admin_gateway_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">{t('admin_gateway_desc')}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(settings.gatewayCategories || []).map((cat, idx) => (
                          <Card key={cat.id || idx} className={`border bg-muted/20 relative transition-all ${cat.hidden ? 'opacity-50 grayscale' : ''}`}>
                            <CardContent className="p-4 space-y-3">
                              {cat.hidden && (
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm z-10">
                                  {t('admin_archived')}
                                </div>
                              )}
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <Label className="text-xs">{t('admin_label')}</Label>
                                  <Input
                                    value={cat.label || ''}
                                    onChange={(e) => {
                                      const newCats = [...(settings.gatewayCategories || [])];
                                      newCats[idx] = { ...newCats[idx], label: e.target.value };
                                      updateSettings(prev => ({ ...prev, gatewayCategories: newCats }));
                                    }}
                                  />
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                  <img src={cat.image} className="w-12 h-12 rounded object-cover" alt="" />
                                  <div className="flex gap-1 items-center bg-black/5 p-1 rounded-md border border-white/10">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        // X button logic - for Gateway Categories, maybe just deselecting or nothing special
                                        // but since user showed it, I'll keep it as a 'close' or 'reset' icon
                                      }}
                                    >
                                      <X size={12} />
                                    </Button>
                                    <div className="w-[1px] h-3 bg-white/20 mx-0.5" />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                      onClick={() => {
                                        const newCats = (settings.gatewayCategories || []).filter((_, i) => i !== idx);
                                        updateSettings(prev => ({ ...prev, gatewayCategories: newCats }));
                                      }}
                                      title={t('admin_delete_category_title')}
                                    >
                                      <Trash2 size={12} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 ${cat.hidden ? 'text-primary bg-primary/10' : 'text-muted-foreground'} hover:bg-muted`}
                                      onClick={() => {
                                        const newCats = [...(settings.gatewayCategories || [])];
                                        newCats[idx] = { ...newCats[idx], hidden: !newCats[idx].hidden };
                                        updateSettings(prev => ({ ...prev, gatewayCategories: newCats }));
                                      }}
                                      title={cat.hidden ? t('admin_show_category_title') : t('admin_archive_category_title')}
                                    >
                                      <Archive size={12} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t('admin_link')}</Label>
                                <Select
                                  value={PREDEFINED_ROUTES.some(r => r.path === cat.link) ? cat.link : 'custom'}
                                  onValueChange={(val) => {
                                    const newCats = [...(settings.gatewayCategories || [])];
                                    if (val !== 'custom') {
                                      newCats[idx] = { ...newCats[idx], link: val };
                                      updateSettings(prev => ({ ...prev, gatewayCategories: newCats }));
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder={t('admin_link_dropdown')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PREDEFINED_ROUTES.map(route => (
                                      <SelectItem key={route.path} value={route.path}>{route.label} ({route.path})</SelectItem>
                                    ))}
                                    <SelectItem value="custom">{t('admin_custom_link')}</SelectItem>
                                  </SelectContent>
                                </Select>

                                {(!PREDEFINED_ROUTES.some(r => r.path === cat.link)) && (
                                  <Input
                                    value={cat.link || ''}
                                    placeholder="/custom-path"
                                    className="h-8 text-xs font-mono mt-2"
                                    onChange={(e) => {
                                      const newCats = [...(settings.gatewayCategories || [])];
                                      newCats[idx] = { ...newCats[idx], link: e.target.value };
                                      updateSettings(prev => ({ ...prev, gatewayCategories: newCats }));
                                    }}
                                  />
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t('admin_image_url')}</Label>
                                <Input
                                  value={cat.image || ''}
                                  onChange={(e) => {
                                    const newCats = [...(settings.gatewayCategories || [])];
                                    newCats[idx] = { ...newCats[idx], image: e.target.value };
                                    updateSettings(prev => ({ ...prev, gatewayCategories: newCats }));
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          variant="outline"
                          className="md:col-span-2 border-dashed py-8"
                          onClick={() => {
                            const newCats = [...(settings.gatewayCategories || []), {
                              id: Date.now().toString(),
                              label: 'New Category',
                              labelKey: 'nav.shopAll',
                              link: '/shop',
                              image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400',
                              colSpan: 'col-span-1',
                              rowSpan: 'row-span-1'
                            }];
                            updateSettings(prev => ({ ...prev, gatewayCategories: newCats }));
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" /> {t('admin_add_category')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {contentTab === 'ticker' && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin_ticker_title')}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('admin_ticker_desc')}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('admin_ticker_label')} ({lang.toUpperCase()})</Label>
                      <Input
                        value={settings.translations[lang]?.['gateway_ticker'] || ''}
                        onChange={(e) => {
                          updateSettings(prev => ({
                            ...prev,
                            translations: {
                              ...prev.translations,
                              [lang]: {
                                ...prev.translations[lang],
                                gateway_ticker: e.target.value
                              }
                            }
                          }));
                        }}
                        placeholder={t('admin_ticker_placeholder')}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('admin_ticker_hint')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {contentTab === 'contact' && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin_contact_info')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>{t('admin_support_email')}</Label>
                        <Input
                          value={settings.contactInfo?.email || ''}
                          onChange={(e) => updateSettings(prev => ({ ...prev, contactInfo: { ...settings.contactInfo, email: e.target.value } as any }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin_phone_number')}</Label>
                        <Input
                          value={settings.contactInfo?.phone || ''}
                          onChange={(e) => updateSettings(prev => ({ ...prev, contactInfo: { ...settings.contactInfo, phone: e.target.value } as any }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin_office_address')}</Label>
                        <Input
                          value={settings.contactInfo?.address || ''}
                          onChange={(e) => updateSettings(prev => ({ ...prev, contactInfo: { ...settings.contactInfo, address: e.target.value } as any }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin_office_hours')}</Label>
                        <Input
                          value={settings.contactInfo?.officeHours || ''}
                          onChange={(e) => updateSettings(prev => ({ ...prev, contactInfo: { ...settings.contactInfo, officeHours: e.target.value } as any }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {contentTab === 'faq' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{t('admin_faq_title')}</span>
                      <Button size="sm" onClick={() => {
                        const newFaqs = [...(settings.faqs || []), { id: Date.now().toString(), question: t('admin_faq_new_question'), answer: t('admin_faq_new_answer'), visible: true }];
                        updateSettings(prev => ({ ...prev, faqs: newFaqs }));
                      }}>
                        <Plus size={16} className="mr-2" /> {t('admin_add_faq')}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(settings.faqs || []).map((faq, idx) => (
                      <div key={idx} className="flex gap-4 items-start p-4 border rounded bg-muted/20">
                        <div className="flex-1 space-y-3">
                          <Input
                            value={faq.question}
                            onChange={(e) => {
                              const newFaqs = [...(settings.faqs || [])];
                              newFaqs[idx] = { ...newFaqs[idx], question: e.target.value };
                              updateSettings(prev => ({ ...prev, faqs: newFaqs }));
                            }}
                            placeholder={t('admin_question')}
                            className="font-bold"
                          />
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => {
                              const newFaqs = [...(settings.faqs || [])];
                              newFaqs[idx] = { ...newFaqs[idx], answer: e.target.value };
                              updateSettings(prev => ({ ...prev, faqs: newFaqs }));
                            }}
                            placeholder={t('admin_answer')}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={faq.visible !== false}
                              onChange={(e) => {
                                const newFaqs = [...(settings.faqs || [])];
                                newFaqs[idx] = { ...newFaqs[idx], visible: e.target.checked };
                                updateSettings(prev => ({ ...prev, faqs: newFaqs }));
                              }}
                              className="h-4 w-4"
                            />
                            <Label className="text-xs">{t('admin_visible')}</Label>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newFaqs = (settings.faqs || []).filter((_, i) => i !== idx);
                            updateSettings(prev => ({ ...prev, faqs: newFaqs }));
                          }}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {contentTab === 'legal' && (
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('admin_privacy_policy')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        className="min-h-[300px] font-mono text-xs"
                        value={settings.legal?.privacyPolicy || ''}
                        onChange={(e) => updateSettings(prev => ({ ...prev, legal: { ...settings.legal, privacyPolicy: e.target.value } as any }))}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('admin_terms')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        className="min-h-[300px] font-mono text-xs"
                        value={settings.legal?.termsOfService || ''}
                        onChange={(e) => updateSettings(prev => ({ ...prev, legal: { ...settings.legal, termsOfService: e.target.value } as any }))}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {contentTab === 'footer' && (
                <div className="grid gap-6">
                  {/* Columns Management */}
                  {(settings.footer?.columns || []).map((column, colIdx) => (
                    <Card key={column.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {t('admin_footer_col_title')}: {column.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(t('admin_confirm_delete_column'))) {
                              const newCols = [...(settings.footer?.columns || [])];
                              newCols.splice(colIdx, 1);
                              updateSettings(prev => ({ ...prev, footer: { ...prev.footer!, columns: newCols } }));
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor={`col-${column.id}-title`}>{t('admin_footer_col_title')}</Label>
                            <Input
                              id={`col-${column.id}-title`}
                              value={column.title}
                              onChange={(e) => {
                                const newCols = [...(settings.footer?.columns || [])];
                                newCols[colIdx] = { ...newCols[colIdx], title: e.target.value };
                                updateSettings(prev => ({ ...prev, footer: { ...prev.footer!, columns: newCols } }));
                              }}
                            />
                          </div>

                          <div className="bg-muted/40 p-4 rounded-lg space-y-4">
                            <Label>{t('nav_cart')} / {t('admin_link')}</Label>
                            {column.links.map((link, linkIdx) => (
                              <div key={link.id || linkIdx} className="flex flex-col gap-2 flex-1">
                                <div className="flex gap-2 items-center">
                                  <Input
                                    value={link.label}
                                    placeholder={t('admin_footer_link_label_placeholder')}
                                    className="h-8 text-xs flex-1"
                                    onChange={(e) => {
                                      const newCols = [...(settings.footer?.columns || [])];
                                      const newLinks = [...newCols[colIdx].links];
                                      newLinks[linkIdx] = { ...newLinks[linkIdx], label: e.target.value };
                                      newCols[colIdx] = { ...newCols[colIdx], links: newLinks };
                                      updateSettings(prev => ({ ...prev, footer: { ...prev.footer!, columns: newCols } }));
                                    }}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      const newCols = [...(settings.footer?.columns || [])];
                                      const newLinks = [...newCols[colIdx].links];
                                      newLinks.splice(linkIdx, 1);
                                      newCols[colIdx] = { ...newCols[colIdx], links: newLinks };
                                      updateSettings(prev => ({ ...prev, footer: { ...prev.footer!, columns: newCols } }));
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Select
                                    value={PREDEFINED_ROUTES.some(r => r.path === link.href) ? link.href : 'custom'}
                                    onValueChange={(val) => {
                                      if (val !== 'custom') {
                                        const newCols = [...(settings.footer?.columns || [])];
                                        const newLinks = [...newCols[colIdx].links];
                                        newLinks[linkIdx] = { ...newLinks[linkIdx], href: val };
                                        newCols[colIdx] = { ...newCols[colIdx], links: newLinks };
                                        updateSettings(prev => ({ ...prev, footer: { ...prev.footer!, columns: newCols } }));
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder={t('admin_link_dropdown')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PREDEFINED_ROUTES.map(route => (
                                        <SelectItem key={route.path} value={route.path}>{route.label} ({route.path})</SelectItem>
                                      ))}
                                      <SelectItem value="custom">{t('admin_custom_link')}</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {(!PREDEFINED_ROUTES.some(r => r.path === link.href)) && (
                                    <Input
                                      value={link.href}
                                      placeholder={t('admin_footer_link_url')}
                                      className="h-8 text-xs font-mono"
                                      onChange={(e) => {
                                        const newCols = [...(settings.footer?.columns || [])];
                                        const newLinks = [...newCols[colIdx].links];
                                        newLinks[linkIdx] = { ...newLinks[linkIdx], href: e.target.value };
                                        newCols[colIdx] = { ...newCols[colIdx], links: newLinks };
                                        updateSettings(prev => ({ ...prev, footer: { ...prev.footer!, columns: newCols } }));
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => {
                                const newCols = [...(settings.footer?.columns || [])];
                                const newLinks = [...newCols[colIdx].links, { id: Date.now().toString(), label: 'New Link', href: '#' }];
                                newCols[colIdx] = { ...newCols[colIdx], links: newLinks };
                                updateSettings(prev => ({ ...prev, footer: { ...prev.footer!, columns: newCols } }));
                              }}
                            >
                              <Plus className="mr-2 h-3 w-3" /> Add Link
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full border-dashed py-8"
                    onClick={() => {
                      const newCols = [...(settings.footer?.columns || []), {
                        id: Date.now().toString(),
                        title: 'New Column',
                        links: []
                      }];
                      updateSettings(prev => ({ ...prev, footer: { ...prev.footer || { columns: [] }, columns: newCols } }));
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> {t('admin_footer_add_column')}
                  </Button>
                </div>
              )}
            </div>
          )
        }

        {/* --- SETTINGS TAB --- */}
        {
          activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex gap-2 border-b pb-2">
                {['shipping', 'social', 'branding', 'banners'].map((tab) => (
                  <Button
                    key={tab}
                    variant={settingsTab === tab ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSettingsTab(tab)}
                    className="uppercase tracking-wider text-xs font-bold"
                  >
                    {t(`admin_settings_${tab}`)}
                  </Button>
                ))}
              </div>

              {settingsTab === 'shipping' && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin_shipping_config')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <NumericInput
                          label={t('admin_free_shipping')}
                          min={0}
                          max={10000}
                          step={50}
                          value={settings.shippingConfig?.freeShippingThreshold || 0}
                          onChange={(value) => updateSettings(prev => ({ ...prev, shippingConfig: { ...settings.shippingConfig, freeShippingThreshold: value } as any }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <NumericInput
                          label={t('admin_flat_rate')}
                          min={0}
                          max={500}
                          step={10}
                          value={settings.shippingConfig?.flatRateFee || 0}
                          onChange={(value) => updateSettings(prev => ({ ...prev, shippingConfig: { ...settings.shippingConfig, flatRateFee: value } as any }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t('admin_processing_time')}</Label>
                          <Input
                            value={settings.shippingConfig?.processingDays || ''}
                            onChange={(e) => updateSettings(prev => ({ ...prev, shippingConfig: { ...settings.shippingConfig, processingDays: e.target.value } as any }))}
                            placeholder={t('admin_settings_processing_placeholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('admin_delivery_time')}</Label>
                          <Input
                            value={settings.shippingConfig?.deliveryDays || ''}
                            onChange={(e) => updateSettings(prev => ({ ...prev, shippingConfig: { ...settings.shippingConfig, deliveryDays: e.target.value } as any }))}
                            placeholder={t('admin_settings_delivery_placeholder')}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {settingsTab === 'social' && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin_social_links')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      {Array.isArray(settings.socialLinks) ? (
                        settings.socialLinks.map((link, index) => (
                          <div key={link.id} className="flex items-end gap-2 p-3 border rounded-md bg-background/50">
                            <div className="space-y-1 flex-1">
                              <Label className="text-xs uppercase text-muted-foreground">{link.platform} ({link.icon})</Label>
                              <Input
                                value={link.url}
                                onChange={(e) => {
                                  const newLinks = [...settings.socialLinks!];
                                  newLinks[index] = { ...link, url: e.target.value };
                                  updateSettings(prev => ({ ...prev, socialLinks: newLinks }));
                                }}
                                placeholder={t('admin_settings_social_url_placeholder')}
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newLinks = settings.socialLinks!.filter((_, i) => i !== index);
                                updateSettings(prev => ({ ...prev, socialLinks: newLinks }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-destructive">{t('admin_social_legacy_format')}</div>
                      )}

                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Plus className="h-4 w-4" /> {t('admin_social_add_link_title')}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                          <div className="space-y-1 col-span-1">
                            <Label>{t('admin_settings_social_platform')}</Label>
                            <Input id="new-social-platform" placeholder="e.g. Location" />
                          </div>
                          <div className="space-y-1 col-span-1">
                            <Label>{t('admin_settings_social_icon')}</Label>
                            <select
                              id="new-social-icon"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="Facebook">Facebook</option>
                              <option value="Instagram">Instagram</option>
                              <option value="Twitter">Twitter</option>
                              <option value="Youtube">Youtube</option>
                              <option value="MapPin">Location (MapPin)</option>
                              <option value="Phone">Phone</option>
                              <option value="Mail">Email</option>
                              <option value="Globe">Website (Globe)</option>
                            </select>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label>{t('admin_settings_social_url')}</Label>
                            <div className="flex gap-2">
                              <Input id="new-social-url" placeholder={t('admin_settings_social_url_placeholder')} className="flex-1" />
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  const platformInput = document.getElementById('new-social-platform') as HTMLInputElement;
                                  const urlInput = document.getElementById('new-social-url') as HTMLInputElement;
                                  const iconInput = document.getElementById('new-social-icon') as HTMLSelectElement;

                                  if (platformInput.value && urlInput.value) {
                                    const newLink = {
                                      id: Date.now().toString(),
                                      platform: platformInput.value,
                                      url: urlInput.value,
                                      icon: iconInput.value
                                    };
                                    const currentLinks = Array.isArray(settings.socialLinks) ? settings.socialLinks : [];
                                    updateSettings(prev => ({ ...prev, socialLinks: [...currentLinks, newLink] }));

                                    // Clear inputs
                                    platformInput.value = '';
                                    urlInput.value = '';
                                    toast({ title: t('admin_social_added_title'), description: t('admin_social_added_desc').replace('{{platform}}', newLink.platform) });
                                  } else {
                                    toast({ title: t('admin_social_error_title'), description: t('admin_social_error_desc'), variant: "destructive" });
                                  }
                                }}
                              >
                                {t('admin_social_add_btn')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}



              {settingsTab === 'branding' && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin_settings_branding')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('admin_branding_name')}</Label>
                        <Input
                          value={settings.branding?.storeName || ''}
                          onChange={(e) => updateSettings(prev => ({
                            ...prev,
                            branding: { ...(prev.branding || { logo: '' }), storeName: e.target.value }
                          }))}
                          placeholder={t('admin_branding_store_name_placeholder')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin_branding_logo')}</Label>
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 space-y-4">
                            <div className="flex gap-2">
                              <Input
                                value={settings.branding?.logo || ''}
                                onChange={(e) => updateSettings(prev => ({
                                  ...prev,
                                  branding: { ...(prev.branding || { storeName: 'Xcraft' }), logo: e.target.value }
                                }))}
                                placeholder={t('admin_branding_logo_placeholder')}
                                className="flex-1"
                              />
                              <div className="relative">
                                <Button variant="secondary" className="flex items-center gap-2">
                                  <Upload className="h-4 w-4" />
                                  {t('admin_upload')}
                                </Button>
                                <input
                                  type="file"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const base64 = reader.result as string;
                                        updateSettings(prev => ({
                                          ...prev,
                                          branding: { ...(prev.branding || { storeName: 'Xcraft' }), logo: base64 }
                                        }));
                                        toast({ title: "Logo Uploaded", description: "Your logo has been uploaded and applied." });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {t('admin_branding_logo_hint')}
                            </p>
                          </div>
                          {settings.branding?.logo && (
                            <div className="w-16 h-16 border rounded bg-muted/30 flex items-center justify-center p-2">
                              <img
                                src={settings.branding.logo}
                                alt="Logo Preview"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {settingsTab === 'banners' && (
                <BannerSettingsPanel />
              )}
            </div>
          )
        }
        {
          activeTab === 'account' && (
            <div className="max-w-5xl mx-auto animate-fade-in-up grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Info</CardTitle>
                  <p className="text-sm text-muted-foreground">Your admin account details</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={adminCreds.name} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={adminCreds.email} disabled className="bg-muted/50" />
                  </div>
                  <p className="text-xs text-muted-foreground">To update your name or email, contact the system administrator.</p>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <p className="text-sm text-muted-foreground">Update your login password</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    />
                  </div>
                  <Button
                    className="w-full mt-2"
                    disabled={accountLoading || !passwordForm.current || !passwordForm.next || !passwordForm.confirm}
                    onClick={async () => {
                      if (passwordForm.next !== passwordForm.confirm) {
                        toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
                        return;
                      }
                      if (passwordForm.next.length < 8) {
                        toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
                        return;
                      }
                      setAccountLoading(true);
                      try {
                        const raw = localStorage.getItem('townteam_user');
                        const token = raw ? JSON.parse(raw)?.token : null;
                        const res = await fetch('http://localhost:5000/auth/change-password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.next }),
                        });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.message);
                        setPasswordForm({ current: '', next: '', confirm: '' });
                        toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
                      } catch (err: any) {
                        toast({ title: 'Error', description: err.message, variant: 'destructive' });
                      } finally {
                        setAccountLoading(false);
                      }
                    }}
                  >
                    {accountLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </CardContent>
              </Card>

            </div>
          )
        }
      </main >

      {/* Product Form Modal */}
      {
        (isAdding || editingProduct) && (
          <ProductForm
            product={editingProduct}
            isAdding={isAdding}
            onSave={(product) => {
              console.log('ProductForm onSave called with:', product);
              console.log('Current products before save:', products);

              if (editingProduct) {
                // Edit existing product
                const updatedProducts = products.map(p => p.id === product.id ? product : p);
                console.log('Updating product, new products:', updatedProducts);
                setProducts(updatedProducts);
                toast({
                  title: t('admin_product_updated_title'),
                  description: t('admin_product_updated_desc').replace('{{name}}', product.name),
                });
              } else {
                // Add new product
                const newProducts = [...products, product];
                console.log('Adding new product, new products:', newProducts);
                setProducts(newProducts);
                toast({
                  title: t('admin_product_added_title'),
                  description: t('admin_product_added_desc').replace('{{name}}', product.name),
                });
              }
              setEditingProduct(null);
              setIsAdding(false);
            }}
            onCancel={() => {
              setEditingProduct(null);
              setIsAdding(false);
            }}
          />
        )
      }

      {/* Delete Order Confirmation */}
      <Dialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin_delete_order_title')}</DialogTitle>
            <DialogDescription>
              {t('admin_delete_order_desc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOrderToDelete(null)}>{t('profile_cancel')}</Button>
            <Button variant="destructive" onClick={() => orderToDelete && handleDeleteOrder(orderToDelete)}>
              {t('admin_delete_permanently')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Order Confirmation */}
      <Dialog open={!!orderToArchive} onOpenChange={() => setOrderToArchive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{orderToArchive?.archive ? t('admin_archive_order_title') : t('admin_restore_order_title')}</DialogTitle>
            <DialogDescription>
              {orderToArchive?.archive
                ? t('admin_archive_order_desc')
                : t('admin_restore_order_desc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOrderToArchive(null)}>{t('profile_cancel')}</Button>
            <Button variant="default" onClick={() => orderToArchive && handleArchiveOrder(orderToArchive.id, orderToArchive.archive)}>
              {orderToArchive?.archive ? t('admin_archive') : t('admin_restore')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

