import * as React from 'react';
import { Order, User } from '../types'; // Adjust path as needed
import { EditableText } from './ui/editable-text';
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import OrderTracking from './OrderTracking';
import { useLanguage } from '@/i18n/LanguageContext';

interface UserOrdersProps {
    orders: Order[];
    user: User;
    onBack: () => void;
}

const UserOrders: React.FC<UserOrdersProps> = ({ orders, user, onBack }) => {
    const { t, lang } = useLanguage();
    const [expandedOrderId, setExpandedOrderId] = React.useState<string | null>(null);

    // Filter orders for the current user (by email or phone)
    // Assuming user.email or user.phone matches customer info in order
    // For MVP, we might just show all if we rely on local storage "orders" being user-specific,
    // but usually orders storage is global in this simple app pattern.
    // Let's filter by email for safety if available, otherwise phone.
    const userOrders = React.useMemo(() => {
        return orders.filter(order =>
            (user.email && order.customer.email === user.email) ||
            (user.phone && (order.customer.phone === user.phone || order.id.includes(user.phone || '')))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [orders, user]);

    const toggleExpand = (orderId: string) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'text-foreground bg-foreground/10 border-foreground';
            case 'shipping': return 'text-foreground bg-muted border-border';
            case 'rejected': return 'text-muted-foreground bg-muted/50 border-border opacity-60';
            case 'pending_review': return 'text-foreground bg-muted/20 border-border';
            default: return 'text-muted-foreground bg-muted border-border';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle size={14} />;
            case 'rejected': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'delivered': return t('orders_status_delivered');
            case 'shipping': return t('orders_status_shipping');
            case 'rejected': return t('orders_status_rejected');
            case 'pending_review': return t('orders_status_review');
            default: return t('orders_status_pending');
        }
    };

    return (
        <div className="bg-background min-h-[60vh] py-12 animate-fade-in-up">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={onBack} className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        &larr; <EditableText k="orders_back" as="span" />
                    </button>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground">
                        <EditableText k="orders_title" as="span" />
                    </h1>
                </div>

                {userOrders.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border rounded-lg bg-muted/30">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-bold text-foreground mb-2"><EditableText k="orders_no_orders" as="span" /></h3>
                        <p className="text-muted-foreground text-sm"><EditableText k="orders_no_orders_desc" as="span" /></p>
                        <button onClick={onBack} className="mt-6 text-foreground font-black uppercase text-xs tracking-widest hover:underline">
                            <EditableText k="orders_start_shopping" as="span" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userOrders.map(order => {
                            const isExpanded = expandedOrderId === order.id;

                            return (
                                <div key={order.id} className="border border-border rounded-lg overflow-hidden bg-card transition-all hover:shadow-md">
                                    <div
                                        className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer select-none"
                                        onClick={() => toggleExpand(order.id)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-sm tracking-wide">#{order.id.slice(0, 8)}...</span>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')} - {new Date(order.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between md:gap-8">
                                            <div className="text-right">
                                                <p className="font-bold text-sm">EGP {order.total.toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground">{order.items.length} <EditableText k="orders_items" as="span" /></p>
                                            </div>
                                            {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="bg-muted/20 border-t border-border p-5 animate-fade-in text-sm">
                                            {/* Order Progress Tracker */}
                                            <div className="mb-8 px-4">
                                                <OrderTracking
                                                    status={order.status}
                                                    rejectionReason={order.rejectionReason}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex gap-4 items-center">
                                                        <div className="h-12 w-12 bg-muted rounded border border-border overflow-hidden flex-shrink-0">
                                                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-foreground text-xs uppercase tracking-wide">
                                                                {lang === 'ar' ? (item.name_ar || item.name) : (item.name_en || item.name)}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {item.size} / {item.colorName || item.color} • x{item.quantity}
                                                            </p>
                                                        </div>
                                                        <span className="font-medium text-xs">EGP {item.lineTotal.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground"><EditableText k="orders_subtotal" as="span" /></span>
                                                    <span>EGP {order.subtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground"><EditableText k="orders_delivery" as="span" /></span>
                                                    <span>EGP {order.delivery.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
                                                    <span><EditableText k="orders_total" as="span" /></span>
                                                    <span>EGP {order.total.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 bg-muted p-3 rounded text-xs text-muted-foreground">
                                                <p className="font-bold mb-1 uppercase tracking-widest text-[10px]"><EditableText k="orders_delivery_details" as="span" /></p>
                                                <p>{order.customer.fullName}</p>
                                                <p>{order.customer.phone}</p>
                                                <p>{order.customer.address}, {order.customer.city}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserOrders;
