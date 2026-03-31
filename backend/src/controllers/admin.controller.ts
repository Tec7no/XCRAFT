import { Request, Response } from "express";
import User from "../models/user.model";
import Order from "../models/order.model";
import Product from "../models/product.model";

// GET all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalProducts, totalOrders, pendingOrders, recentOrders] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: "pending_review" }),
        Order.find().sort({ createdAt: -1 }).limit(5),
      ]);

    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "shipping"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
