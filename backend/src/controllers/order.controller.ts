import { Request, Response } from "express";
import Order from "../models/order.model";
import Product from "../models/product.model";
import { recordCouponUsage } from "./coupon.controller";

const makeVariantKey = (size: string, color: string) => `${size}__${color}`;

// CREATE order (customer) + decrement stock
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, customer, payment, subtotal, discount, delivery, total } = req.body;

    // Get userId from token if logged in
    const userId = (req as any).user?.userId || null;

    // 1. Validate + decrement stock in DB
    for (const item of items || []) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product "${item.name}" not found` });
      }

      if (product.variantStock && item.size && item.color) {
        const key = makeVariantKey(item.size, item.color);
        const available = (product.variantStock as any).get ? 
          (product.variantStock as any).get(key) ?? 0 : 
          (product.variantStock as any)[key] ?? 0;

        if (available < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `"${item.name}" (${item.size}/${item.color}) - only ${available} available`
          });
        }

        // Decrement variant stock
        if ((product.variantStock as any).set) {
          (product.variantStock as any).set(key, available - item.quantity);
        } else {
          (product.variantStock as any)[key] = available - item.quantity;
        }

        // Recalculate total stock
        const variantObj = (product.variantStock as any).toObject ? 
          (product.variantStock as any).toObject() : product.variantStock;
        product.stock = Object.values(variantObj as Record<string, number>)
          .reduce((sum: number, qty) => sum + (Number(qty) || 0), 0);

      } else {
        // Fallback: simple stock
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `"${item.name}" - only ${product.stock} available`
          });
        }
        product.stock = Math.max(0, product.stock - item.quantity);
      }

      product.markModified('variantStock');
      await product.save();
    }

    // 2. Create order
    const order = await Order.create({
      userId,
      items,
      customer,
      payment,
      subtotal,
      discount,
      delivery,
      total,
      status: 'pending_review',
      archived: false,
    });

    // 3. Record coupon usage if a coupon was applied
    const { couponCode } = req.body;
    if (couponCode && discount > 0) {
      await recordCouponUsage(couponCode, order._id.toString(), userId || undefined);
    }

    return res.status(201).json({ success: true, order });
  } catch (error: any) {
    console.error('Create order error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// GET all orders (admin)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, archived } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (archived !== undefined) filter.archived = archived === "true";
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET single order (admin)
export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET my orders (customer)
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE order status (admin)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status, rejectionReason } = req.body;
    const update: any = { status };
    if (status === "rejected" && rejectionReason) update.rejectionReason = rejectionReason;
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ARCHIVE order (admin)
export const archiveOrder = async (req: Request, res: Response) => {
  try {
    const { archived } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { archived: archived ?? true }, 
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE order (admin)
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
