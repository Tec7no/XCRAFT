
import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { useStorageState } from '@/utils/storage';
import { Product, Order, User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { INITIAL_PRODUCTS } from '@/constants';

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useStorageState<User | null>('user', null);
    const [products, setProducts] = useStorageState<Product[]>('products', INITIAL_PRODUCTS);
    const [orders, setOrders] = useStorageState<Order[]>('orders', []);

    // Protect the route
    React.useEffect(() => {
        // Only redirect if explicitly NOT logged in
        if (user === null) {
            navigate('/auth', { replace: true });
        }
    }, [user, navigate]);

    if (user === null) {
        return <div className="min-h-screen flex items-center justify-center text-foreground">Redirecting to login...</div>;
    }

    if (user.role !== 'admin' && user.role !== 'manager') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-4">
                    <h1 className="text-2xl font-black text-destructive uppercase tracking-widest">Access Denied</h1>
                    <p className="text-muted-foreground font-medium">Your current role (<span className="font-mono font-bold text-foreground">{user.role}</span>) does not have permission to view this page.</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => { setUser(null); navigate('/auth'); }}
                            className="px-6 py-2 bg-destructive text-destructive-foreground font-bold rounded-lg hover:bg-destructive/90 transition-colors uppercase text-xs tracking-wider"
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/90 transition-colors uppercase text-xs tracking-wider"
                        >
                            Go Home
                        </button>
                    </div>
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
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
        />
    );
};

export default AdminPage;
