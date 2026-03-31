/**
 * OrderDetailsPanel - Admin view for order details
 * Shows customer info, items, payment info, and status workflow buttons
 */

import * as React from 'react';
import { Order, OrderStatus } from '@/types';
import {
    User, Phone, Mail, MapPin, CreditCard, Truck, Building2,
    CheckCircle, XCircle, Package, Clock, AlertCircle, Trash2, Archive, RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailsPanelProps {
    order: Order;
    onUpdate: (order: Order) => void;
    onDelete?: () => void;
    onArchive?: () => void;
    onClose: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Package },
    shipping: { label: 'Shipping', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
    cod: 'Cash on Delivery',
    transfer: 'Bank Transfer / Instapay',
    card: 'Credit/Debit Card',
};

export default function OrderDetailsPanel({ order, onUpdate, onDelete, onArchive, onClose }: OrderDetailsPanelProps) {
    const { lang } = useLanguage();
    const { toast } = useToast();
    const [rejectionReason, setRejectionReason] = React.useState('');
    const [showRejectDialog, setShowRejectDialog] = React.useState(false);
    const [showProofModal, setShowProofModal] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);

    // Support both id and _id from MongoDB
    const orderId = (order as any)._id || order.id || '';
    const orderDisplayId = orderId.toString().slice(-8).toUpperCase();

    const statusConfig = STATUS_CONFIG[order.status] || { label: order.status || 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle };
    const StatusIcon = statusConfig.icon;

    const handleStatusChange = async (newStatus: OrderStatus, reason?: string) => {
        setIsUpdating(true);
        try {
            const res = await ordersApi.updateStatus(orderId, newStatus, reason);
            onUpdate({ ...order, ...res.order, id: orderId });
            toast({ title: 'Status Updated', description: `Order is now ${newStatus}` });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReject = () => {
        handleStatusChange('rejected', rejectionReason);
        setShowRejectDialog(false);
        setRejectionReason('');
    };

    return (
        <div className="bg-card border border-border rounded-lg shadow-sm h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary">#{orderDisplayId}</h3>
                            <Badge variant="outline" className={`text-[8px] font-black uppercase px-2 py-0 border ${statusConfig.color}`}>
                                {statusConfig.label}
                            </Badge>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground">
                            {new Date((order as any).createdAt || Date.now()).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 bg-black/5 rounded-md border border-white/10 shadow-inner">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onClose}>✕</Button>
                    <div className="w-[1px] h-3 bg-white/20 mx-0.5" />
                    {onDelete && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={onDelete} title="Delete Order">
                            <Trash2 size={14} />
                        </Button>
                    )}
                    {onArchive && (
                        <Button
                            variant="ghost" size="icon"
                            className={`h-7 w-7 ${order.archived ? 'text-primary' : 'text-muted-foreground'} hover:bg-muted`}
                            onClick={onArchive}
                            title={order.archived ? "Restore Order" : "Archive Order"}
                        >
                            {order.archived ? <RefreshCw size={14} /> : <Archive size={14} />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <section>
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
                                <User size={12} /> Customer Information
                            </h4>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs">
                                        {(order.customer?.fullName || 'L').charAt(0)}
                                    </div>
                                    <span className="font-black text-sm text-primary">{order.customer?.fullName || 'Legacy Customer'}</span>
                                </div>
                                <div className="grid gap-2 text-[11px] font-bold text-muted-foreground">
                                    <div className="flex items-center gap-2"><Phone size={12} /><span>{order.customer?.phone || 'No phone'}</span></div>
                                    {order.customer?.email && (
                                        <div className="flex items-center gap-2"><Mail size={12} /><span>{order.customer.email}</span></div>
                                    )}
                                    <div className="flex items-start gap-2">
                                        <MapPin size={12} className="mt-0.5" />
                                        <span className="leading-tight">{order.customer?.address || 'No address'}, {order.customer?.city || ''}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
                                <CreditCard size={12} /> Payment Details
                            </h4>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold text-primary">
                                        {order.payment?.method ? PAYMENT_LABELS[order.payment.method] : 'Standard Payment'}
                                    </span>
                                    {order.payment?.method === 'cod' && <Truck size={14} className="text-secondary" />}
                                    {order.payment?.method === 'transfer' && <Building2 size={14} className="text-secondary" />}
                                    {order.payment?.method === 'card' && <CreditCard size={14} className="text-secondary" />}
                                </div>
                                {order.payment?.proofImage && (
                                    <div className="relative group cursor-pointer" onClick={() => setShowProofModal(true)}>
                                        <img src={order.payment.proofImage} alt="Payment proof" className="w-full h-24 object-cover rounded-lg border border-border transition-all group-hover:brightness-90" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Badge className="bg-primary/80 text-white backdrop-blur-sm">View Proof</Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Order Items & Totals */}
                    <div className="space-y-4">
                        <section>
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
                                <Package size={12} /> Order Summary
                            </h4>
                            <div className="bg-muted/30 rounded-xl border border-border/50 overflow-hidden">
                                <div className="max-h-[240px] overflow-y-auto divide-y divide-border/50">
                                    {(order.items || []).map((item, idx) => (
                                        <div key={idx} className="p-3 flex gap-3 hover:bg-muted/50 transition-colors">
                                            {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded bg-white shadow-sm" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black uppercase text-primary truncate leading-tight">
                                                    {lang === 'ar' ? (item.name_ar || item.name) : (item.name_en || item.name)}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{item.size}</span>
                                                    <span className="text-muted-foreground">/</span>
                                                    <div className="w-2 h-2 rounded-full border border-border/50" style={{ backgroundColor: item.color }} />
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{item.colorName}</span>
                                                </div>
                                                <div className="flex justify-between items-end mt-1">
                                                    <span className="text-[9px] font-medium text-muted-foreground">{item.quantity} × {item.unitPrice.toLocaleString()}</span>
                                                    <span className="text-[11px] font-black text-secondary">{item.lineTotal.toLocaleString()} EGP</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-[#f6efea] border-t border-[#d8c6bb] space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                                        <span>Subtotal</span><span>{(order.subtotal || 0).toLocaleString()} EGP</span>
                                    </div>
                                    {(order.discount || 0) > 0 && (
                                        <div className="flex justify-between text-[11px] font-bold text-green-600">
                                            <span>Discount</span><span>-{order.discount.toLocaleString()} EGP</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                                        <span>Delivery</span>
                                        <span>{order.delivery === 0 ? 'FREE' : `${(order.delivery || 0).toLocaleString()} EGP`}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2 mt-1 border-t border-[#d8c6bb]/50">
                                        <span className="text-xs font-black uppercase tracking-widest text-primary">Total Amount</span>
                                        <span className="text-lg font-black text-[#b1121a] leading-none">{(order.total || 0).toLocaleString()} EGP</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {order.status === 'rejected' && order.rejectionReason && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Rejection Reason</span>
                        </div>
                        <p className="text-sm font-medium text-red-800/80 leading-relaxed">{order.rejectionReason}</p>
                    </div>
                )}
            </div>

            {/* Status Actions */}
            <div className="p-4 border-t border-border bg-muted/50">
                {!order.archived ? (
                    <div className="max-w-md mx-auto">
                        {order.status === 'pending_review' && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={() => handleStatusChange('accepted')} disabled={isUpdating} className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] h-11">
                                    <CheckCircle size={16} className="mr-2" /> Accept Order
                                </Button>
                                <Button variant="destructive" onClick={() => setShowRejectDialog(true)} disabled={isUpdating} className="font-black uppercase tracking-widest text-[10px] h-11">
                                    <XCircle size={16} className="mr-2" /> Reject
                                </Button>
                            </div>
                        )}
                        {order.status === 'accepted' && (
                            <Button onClick={() => handleStatusChange('preparing')} disabled={isUpdating} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-[10px] h-11">
                                <Package size={16} className="mr-2" /> Start Preparation
                            </Button>
                        )}
                        {order.status === 'preparing' && (
                            <Button onClick={() => handleStatusChange('shipping')} disabled={isUpdating} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] h-11">
                                <Truck size={16} className="mr-2" /> Out for Delivery
                            </Button>
                        )}
                        {order.status === 'shipping' && (
                            <Button onClick={() => handleStatusChange('delivered')} disabled={isUpdating} className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] h-11">
                                <CheckCircle size={16} className="mr-2" /> Confirm Delivery
                            </Button>
                        )}
                        {(order.status === 'delivered' || order.status === 'rejected') && (
                            <div className="text-center py-2">
                                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 ${order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                    {order.status === 'delivered' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                    <span className="text-xs font-black uppercase tracking-widest">Order {order.status}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-3 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Order is archived and locked for editing.</p>
                    </div>
                )}
            </div>

            {/* Reject Dialog */}
            {showRejectDialog && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border animate-in zoom-in-95 duration-200">
                        <h4 className="text-lg font-black uppercase tracking-tighter text-primary mb-2">Reject Order</h4>
                        <p className="text-xs font-medium text-muted-foreground mb-4">Please provide a reason for rejecting this order.</p>
                        <textarea
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            placeholder="e.g. Out of stock, Location not covered..."
                            className="w-full border border-border rounded-xl p-4 text-sm font-bold mb-4 resize-none bg-muted/30 focus:bg-white focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="flex-1 font-bold h-11 rounded-xl">Cancel</Button>
                            <Button variant="destructive" onClick={handleReject} className="flex-1 font-black uppercase tracking-widest text-[10px] h-11 rounded-xl">Confirm Reject</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Proof Modal */}
            {showProofModal && order.payment?.proofImage && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 animate-in fade-in duration-300" onClick={() => setShowProofModal(false)}>
                    <div className="relative group">
                        <img src={order.payment.proofImage} alt="Payment proof" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
                        <Button className="absolute -top-4 -right-4 bg-white text-black hover:bg-gray-200 rounded-full h-10 w-10 p-0 shadow-xl">✕</Button>
                    </div>
                </div>
            )}
        </div>
    );
}