import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStorageState } from '@/utils/storage';
import { Order } from '@/types';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const OrderConfirmation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const [orders] = useStorageState<Order[]>('orders', []);
    const [user] = useStorageState<any>('user', null);

    // Find the order
    const order = React.useMemo(() =>
        orders.find(o => o.id === orderId),
        [orders, orderId]);

    const handleNavigate = (path: string | null) => {
        if (path) navigate('/');
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-xl font-bold mb-4">Order not found</p>
                <Button onClick={() => navigate('/')}>Return Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header
                onSearchChange={() => { }}
                onNavigate={handleNavigate}
                onAccount={() => navigate('/profile')}
                onLogout={() => { }}
                onOrders={() => navigate('/profile?tab=orders')}
                user={user}
            />

            <main className="flex-grow pt-10 pb-20 px-4">
                <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
                    <div className="bg-secondary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-secondary" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary">
                        Thank You!
                    </h1>

                    <p className="text-xl text-muted-foreground font-medium">
                        Your order <span className="text-primary font-bold">#{order.id.slice(0, 8)}</span> has been placed successfully.
                    </p>

                    <div className="bg-card border border-border rounded-xl p-8 max-w-xl mx-auto shadow-sm text-left">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-2 border-b border-border">Order Details</h3>

                        <div className="space-y-4 mb-8">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-secondary">{item.quantity}x</span>
                                        <span className="text-primary font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-primary">EGP {item.lineTotal.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-border">
                            <span className="text-lg font-bold text-primary">Total Paid</span>
                            <span className="text-2xl font-black text-secondary">EGP {order.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                        <Button
                            onClick={() => navigate('/')}
                            variant="outline"
                            className="py-6 px-8 uppercase font-bold tracking-widest border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                            <Home size={18} className="mr-2" /> Continue Shopping
                        </Button>
                        <Button
                            onClick={() => navigate('/')} // Ideally link to order history if logged in
                            className="py-6 px-8 uppercase font-bold tracking-widest bg-secondary text-secondary-foreground hover:bg-primary"
                        >
                            <Package size={18} className="mr-2" /> Track Order
                        </Button>
                    </div>
                </div>
            </main>
            <Footer onNavigate={handleNavigate} />
        </div>
    );
};

export default OrderConfirmation;
