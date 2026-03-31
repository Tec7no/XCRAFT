import React, { useState, useEffect, useCallback } from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { useStorageState } from '@/utils/storage';
import { Product, Order, User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { productsApi, ordersApi } from '@/lib/api';

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useStorageState<User | null>('user', null);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user === null) navigate('/auth', { replace: true });
    }, [user, navigate]);

    const fetchData = useCallback(async () => {
        if (!user || (user.role !== 'admin' && user.role !== 'manager')) return;
        setLoading(true);
        try {
            const [prodRes, ordRes] = await Promise.all([
                productsApi.getAll(),
                ordersApi.getAll(),
            ]);
            setProducts(prodRes.products || []);
            setOrders(ordRes.orders || []);
        } catch (err) {
            console.error('Admin data fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Intercept setProducts: also sync with API ─────────────────────────────
    // AdminDashboard calls setProducts(updater fn or new array).
    // We detect if a product was added, edited, or deleted by comparing snapshots.
    const handleSetProducts: React.Dispatch<React.SetStateAction<Product[]>> = async (updater) => {
        setProducts(prev => {
            const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;

            // Detect delete: item removed
            if (next.length < prev.length) {
                const deleted = prev.find(p => !next.find((n: Product) => n.id === p.id));
                if (deleted) productsApi.delete(deleted.id).catch(console.error);
            }
            // Detect add: item added (no id match in prev, and has id)
            else if (next.length > prev.length) {
                const added = next.find((n: Product) => !prev.find(p => p.id === n.id));
                if (added) {
                    productsApi.create(added)
                        .then(res => {
                            // Replace temp product with DB version (gets real _id)
                            setProducts(curr => curr.map(p => p.id === added.id ? res.product : p));
                        })
                        .catch(console.error);
                }
            }
            // Detect update: same length, different content
            else {
                const changed = next.find((n: Product) => {
                    const old = prev.find(p => p.id === n.id);
                    return old && JSON.stringify(old) !== JSON.stringify(n);
                });
                if (changed) {
                    productsApi.update(changed.id, changed).catch(console.error);
                }
            }

            return next;
        });
    };

    // ─── Intercept setOrders: also sync with API ───────────────────────────────
    const handleSetOrders: React.Dispatch<React.SetStateAction<Order[]>> = async (updater) => {
        setOrders(prev => {
            const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;

            // Detect delete
            if (next.length < prev.length) {
                const deleted = prev.find(o => !next.find((n: Order) => n.id === o.id));
                if (deleted) ordersApi.delete(deleted.id).catch(console.error);
            }
            // Detect status/archive change
            else {
                const changed = next.find((n: Order) => {
                    const old = prev.find(o => o.id === n.id);
                    return old && (old.status !== n.status || old.archived !== n.archived);
                });
                if (changed) {
                    const old = prev.find(o => o.id === changed.id)!;
                    if (old.status !== changed.status) {
                        ordersApi.updateStatus(changed.id, changed.status, changed.rejectionReason).catch(console.error);
                    }
                    if (old.archived !== changed.archived) {
                        ordersApi.archive(changed.id, !!changed.archived).catch(console.error);
                    }
                }
            }

            return next;
        });
    };

    if (user === null) {
        return <div className="min-h-screen flex items-center justify-center text-foreground">Redirecting to login...</div>;
    }

    if (user.role !== 'admin' && user.role !== 'manager') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-4">
                    <h1 className="text-2xl font-black text-destructive uppercase tracking-widest">Access Denied</h1>
                    <p className="text-muted-foreground font-medium">
                        Your current role (<span className="font-mono font-bold text-foreground">{user.role}</span>) does not have permission.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => { setUser(null); navigate('/auth'); }}
                            className="px-6 py-2 bg-destructive text-destructive-foreground font-bold rounded-lg hover:bg-destructive/90 transition-colors uppercase text-xs tracking-wider">
                            Logout
                        </button>
                        <button onClick={() => navigate('/')}
                            className="px-6 py-2 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/90 transition-colors uppercase text-xs tracking-wider">
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <AdminDashboard
            onExit={() => {
                import('@/utils/storage').then(({ setStorageItem }) => {
                    setStorageItem('user', null);
                    setUser(null);
                    navigate('/');
                });
            }}
            userRole={user.role}
            products={products}
            setProducts={handleSetProducts}
            orders={orders}
            setOrders={handleSetOrders}
        />
    );
};

export default AdminPage;
