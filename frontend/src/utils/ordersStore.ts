import { Order, OrderStatus } from '@/types';
import { getStorageItem, setStorageItem } from './storage';

const ORDERS_KEY = 'orders';

/**
 * Get all orders from localStorage
 */
export function listOrders(): Order[] {
    return getStorageItem<Order[]>(ORDERS_KEY, []);
}

/**
 * Get a single order by ID
 */
export function getOrder(id: string): Order | undefined {
    const orders = listOrders();
    return orders.find(o => o.id === id);
}

/**
 * Create a new order and persist it
 */
export function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const orders = listOrders();

    const newOrder: Order = {
        ...orderData,
        id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // Add to beginning (newest first)
    const updated = [newOrder, ...orders];
    setStorageItem(ORDERS_KEY, updated);

    // Dispatch storage event for cross-component sync
    window.dispatchEvent(new Event('storage'));

    return newOrder;
}

/**
 * Update order status
 */
export function updateOrderStatus(
    id: string,
    status: OrderStatus,
    rejectionReason?: string
): Order | undefined {
    const orders = listOrders();
    const idx = orders.findIndex(o => o.id === id);

    if (idx === -1) return undefined;

    orders[idx] = {
        ...orders[idx],
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        updatedAt: new Date().toISOString(),
    };

    setStorageItem(ORDERS_KEY, orders);
    window.dispatchEvent(new Event('storage'));

    return orders[idx];
}

/**
 * Toggle archive status of an order
 */
export function archiveOrder(id: string, archived: boolean): Order | undefined {
    const orders = listOrders();
    const idx = orders.findIndex(o => o.id === id);

    if (idx === -1) return undefined;

    orders[idx] = {
        ...orders[idx],
        archived,
        updatedAt: new Date().toISOString(),
    };

    setStorageItem(ORDERS_KEY, orders);
    window.dispatchEvent(new Event('storage'));

    return orders[idx];
}

/**
 * Delete an order (admin only)
 */
export function deleteOrder(id: string): boolean {
    const orders = listOrders();
    const filtered = orders.filter(o => o.id !== id);

    if (filtered.length === orders.length) return false;

    setStorageItem(ORDERS_KEY, filtered);
    window.dispatchEvent(new Event('storage'));

    return true;
}
