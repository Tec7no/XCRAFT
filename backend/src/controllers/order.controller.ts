import { Request, Response } from "express";
import Order from "../models/order.model";

// CREATE order (customer)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.create(req.body);
    return res.status(201).json({ success: true, data: order });
  } catch (error: any) {
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
    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET single order
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, data: order });
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
    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ARCHIVE order (admin)
export const archiveOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, data: order });
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