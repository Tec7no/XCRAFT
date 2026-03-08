import * as React from 'react';
import { Check, Clock, Package, Truck, AlertCircle } from 'lucide-react';
import { OrderStatus } from '@/types';

interface OrderTrackingProps {
    status: OrderStatus | string;
    rejectionReason?: string;
}

const STEPS = [
    { id: 'placed', label: 'Order Placed', icon: Clock, statuses: ['pending_review'] },
    { id: 'processing', label: 'Processing', icon: Package, statuses: ['accepted', 'preparing'] },
    { id: 'shipping', label: 'Out for Delivery', icon: Truck, statuses: ['shipping'] },
    { id: 'delivered', label: 'Delivered', icon: Check, statuses: ['delivered'] },
];

const OrderTracking: React.FC<OrderTrackingProps> = ({ status, rejectionReason }) => {
    // Determine current step index
    // pending_review -> 0 (active)
    // accepted/preparing -> 1 (active), 0 (completed)
    // shipping -> 2 (active), 0,1 (completed)
    // delivered -> 3 (completed), 0,1,2 (completed)

    let currentStepIndex = 0;
    if (['accepted', 'preparing'].includes(status)) currentStepIndex = 1;
    else if (status === 'shipping') currentStepIndex = 2;
    else if (status === 'delivered') currentStepIndex = 4; // All completed
    else if (status === 'rejected') currentStepIndex = -1; // Special case

    if (currentStepIndex === -1) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5" size={18} />
                <div>
                    <p className="font-bold text-red-700 text-sm uppercase tracking-wide">Order Rejected</p>
                    <p className="text-red-600/80 text-xs mt-1">{rejectionReason || "We couldn't fulfill this order. Please contact support."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-4 left-0 w-full h-0.5 bg-border -z-0">
                    <div
                        className="h-full bg-secondary transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentStepIndex / (STEPS.length - 1)) * 100)}%` }}
                    />
                </div>

                {STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex || currentStepIndex === 4; // 4 means delivered fully done
                    const isActive = !isCompleted && (
                        (index === currentStepIndex) ||
                        (index === 0 && status === 'pending_review')
                    );

                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-secondary border-secondary text-secondary-foreground' :
                                        isActive ? 'bg-background border-secondary text-secondary shadow-[0_0_0_4px_rgba(var(--secondary-rgb),0.1)]' :
                                            'bg-muted border-border text-muted-foreground'
                                    }`}
                            >
                                {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest mt-3 transition-colors ${isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTracking;
