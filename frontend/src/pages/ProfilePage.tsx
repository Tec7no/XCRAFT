import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStorageState, removeStorageItem } from '@/utils/storage';
import { CartItem, User, Order, Address } from '@/types';
import { useMyOrders } from '@/hooks/useOrders';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Package, MapPin, Plus, Trash2, Edit2, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import UserOrders from '@/components/UserOrders'; // Reuse existing component
import { EditableText } from '@/components/ui/editable-text';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { lang, t } = useLanguage();
    const [user, setUser] = useStorageState<User | null>('user', null);
    const [cart] = useStorageState<CartItem[]>('cart', []);
    const { orders } = useMyOrders();
    const [wishlist] = useStorageState<string[]>('wishlist', []);

    // Address State
    const [isAddingAddress, setIsAddingAddress] = React.useState(false);
    const [newAddress, setNewAddress] = React.useState<Partial<Address>>({});

    React.useEffect(() => {
        if (!user) {
            navigate('/auth?redirect=/profile', { replace: true });
        }
    }, [user, navigate]);

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
    }

    const handleLogout = () => {
        removeStorageItem('user');
        setUser(null);
        navigate('/');
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddress.fullName || !newAddress.address || !newAddress.city || !newAddress.phone || !newAddress.name) {
            toast({ title: "Validation Error", description: "Please fill all fields", variant: "destructive" });
            return;
        }

        const address: Address = {
            id: crypto.randomUUID(),
            name: newAddress.name!,
            fullName: newAddress.fullName!,
            phone: newAddress.phone!,
            address: newAddress.address!,
            city: newAddress.city!,
            isDefault: user.addresses?.length === 0
        };

        const updatedAddresses = [...(user.addresses || []), address];

        try {
            const { authApi } = await import('@/lib/api');
            await authApi.updateProfile({ addresses: updatedAddresses });
            setUser({ ...user, addresses: updatedAddresses });
            setIsAddingAddress(false);
            setNewAddress({});
            toast({ title: t('profile_address_saved'), description: t('profile_address_saved_desc') });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!user.addresses) return;
        const updatedAddresses = user.addresses.filter(a => a.id !== id);
        try {
            const { authApi } = await import('@/lib/api');
            await authApi.updateProfile({ addresses: updatedAddresses });
            setUser({ ...user, addresses: updatedAddresses });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!user.addresses) return;
        const updatedAddresses = user.addresses.map(a => ({ ...a, isDefault: a.id === id }));
        try {
            const { authApi } = await import('@/lib/api');
            await authApi.updateProfile({ addresses: updatedAddresses });
            setUser({ ...user, addresses: updatedAddresses });
            toast({ title: t('profile_default_updated'), description: t('profile_default_updated_desc') });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    const handleNavigate = (path: string | null) => {
        if (path) navigate(path);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header
                onSearchChange={() => { }}
                onNavigate={handleNavigate}
                onAccount={() => navigate('/profile')}
                onLogout={handleLogout}
                onOrders={() => navigate('/profile?tab=orders')}
                user={user}
            />

            <main className="flex-grow pt-10 pb-20 px-4">
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-primary"><EditableText k="profile_title" as="span" /></h1>
                        <Button variant="outline" onClick={handleLogout} className="text-destructive border-destructive/20 hover:bg-destructive/10">
                            <LogOut size={16} className="mr-2" /> <EditableText k="profile_logout" as="span" />
                        </Button>
                    </div>

                    <Tabs defaultValue="info" className="space-y-8">
                        <TabsList className="bg-muted p-1">
                            <TabsTrigger value="info" className="uppercase font-bold tracking-widest text-xs"><EditableText k="profile_tab_info" as="span" /></TabsTrigger>
                            <TabsTrigger value="addresses" className="uppercase font-bold tracking-widest text-xs"><EditableText k="profile_tab_addresses" as="span" /></TabsTrigger>
                            <TabsTrigger value="orders" className="uppercase font-bold tracking-widest text-xs"><EditableText k="profile_tab_orders" as="span" /></TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold uppercase tracking-widest text-sm text-foreground"><EditableText k="profile_personalDetails" as="span" /></h3>
                                </div>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const updates = {
                                        name: formData.get('name') as string,
                                        email: formData.get('email') as string,
                                        phone: formData.get('phone') as string
                                    };
                                    setUser({ ...user, ...updates });
                                    toast({ title: t('profile_status_updated'), description: t('profile_status_updated_desc') });
                                }} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1"><EditableText k="profile_fullName" as="span" /></label>
                                            <input
                                                name="name"
                                                defaultValue={user.name}
                                                className="w-full bg-background border border-border p-3 rounded text-sm outline-none focus:border-secondary transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1"><EditableText k="profile_email" as="span" /></label>
                                            <input
                                                name="email"
                                                type="email"
                                                defaultValue={user.email}
                                                className="w-full bg-background border border-border p-3 rounded text-sm outline-none focus:border-secondary transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1"><EditableText k="profile_phone" as="span" /></label>
                                            <input
                                                name="phone"
                                                type="tel"
                                                defaultValue={user.phone || ''}
                                                placeholder="+20..."
                                                className="w-full bg-background border border-border p-3 rounded text-sm outline-none focus:border-secondary transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1"><EditableText k="profile_role" as="span" /></label>
                                            <div className="p-3 bg-muted rounded font-medium capitalize text-sm text-muted-foreground cursor-not-allowed select-none">{user.role}</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button type="submit" variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                            <EditableText k="profile_saveChanges" as="span" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </TabsContent>

                        {/* Addresses Tab */}
                        <TabsContent value="addresses" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Add New Button */}
                                <button
                                    onClick={() => setIsAddingAddress(true)}
                                    className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-primary hover:border-primary transition-all min-h-[200px]"
                                >
                                    <Plus size={32} />
                                    <span className="font-bold uppercase text-xs tracking-widest"><EditableText k="profile_addNewAddress" as="span" /></span>
                                </button>

                                {/* Address Cards */}
                                {user.addresses?.map(addr => (
                                    <div key={addr.id} className={`border rounded-xl p-6 relative group ${addr.isDefault ? 'border-secondary bg-secondary/5' : 'border-border bg-card'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={18} className="text-primary" />
                                                <span className="font-bold uppercase tracking-wide text-sm">{addr.name}</span>
                                                {addr.isDefault && <span className="bg-secondary text-secondary-foreground text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"><EditableText k="profile_address_default" as="span" /></span>}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-destructive hover:scale-110"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p className="font-bold text-foreground">{addr.fullName}</p>
                                            <p>{addr.address}</p>
                                            <p>{addr.city}</p>
                                            <p>{addr.phone}</p>
                                        </div>
                                        {!addr.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(addr.id)}
                                                className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                                            >
                                                <EditableText k="profile_setAsDefault" as="span" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add Address Modal/Form */}
                            {isAddingAddress && (
                                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-card border border-border w-full max-w-md p-8 rounded-xl shadow-2xl animate-in zoom-in-95">
                                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6"><EditableText k="profile_newAddress" as="span" /></h3>
                                        <form onSubmit={handleSaveAddress} className="space-y-4">
                                            <input required placeholder={t('profile_placeholder_label')} className="w-full bg-muted border border-border p-3 rounded text-sm outline-none focus:border-secondary" onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                                            <input required placeholder={t('profile_placeholder_fullName')} className="w-full bg-muted border border-border p-3 rounded text-sm outline-none focus:border-secondary" onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                                            <input required placeholder={t('profile_placeholder_phone')} className="w-full bg-muted border border-border p-3 rounded text-sm outline-none focus:border-secondary" onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                            <input required placeholder={t('profile_placeholder_address')} className="w-full bg-muted border border-border p-3 rounded text-sm outline-none focus:border-secondary" onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} />
                                            <input required placeholder={t('profile_placeholder_city')} className="w-full bg-muted border border-border p-3 rounded text-sm outline-none focus:border-secondary" onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                            <div className="flex gap-4 pt-4">
                                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddingAddress(false)}><EditableText k="profile_cancel" as="span" /></Button>
                                                <Button type="submit" className="flex-1"><EditableText k="profile_saveAddress" as="span" /></Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Orders Tab */}
                        <TabsContent value="orders">
                            <UserOrders orders={orders} user={user} onBack={() => { }} />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer onNavigate={handleNavigate} />
        </div>
    );
};


export default ProfilePage;
