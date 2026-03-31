// src/hooks/useOrders.ts
import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import { ordersApi } from '../lib/api';

// ─── Customer: My Orders ───────────────────────────────────────────────────────
export const useMyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('townteam_user');
    if (!token) return;
    setLoading(true);
    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch my orders:", err);
      // Fallback to localStorage for guest orders
      try {
        const stored = localStorage.getItem('townteam_orders');
        if (stored) setOrders(JSON.parse(stored));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
};

// ─── Admin: All Orders ─────────────────────────────────────────────────────────
export const useAdminOrders = (params?: { status?: string; archived?: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getAll(params);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.archived]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: OrderStatus, rejectionReason?: string) => {
    const data = await ordersApi.updateStatus(id, status, rejectionReason);
    setOrders(prev => prev.map(o => o.id === id ? data.order : o));
    return data.order;
  };

  const archiveOrder = async (id: string, archived: boolean) => {
    const data = await ordersApi.archive(id, archived);
    setOrders(prev => prev.map(o => o.id === id ? data.order : o));
    return data.order;
  };

  const deleteOrder = async (id: string) => {
    await ordersApi.delete(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return { orders, loading, refetch: fetchOrders, updateStatus, archiveOrder, deleteOrder };
};
