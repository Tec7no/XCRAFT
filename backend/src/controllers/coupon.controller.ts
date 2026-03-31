import { Request, Response } from "express";
import Coupon from "../models/coupon.model";

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json({ success: true, coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, type, value, minOrderAmount, maxUsage } = req.body;
    if (!code || !type || value === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: "Coupon code already exists" });
    const coupon = await Coupon.create({
      code,
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      maxUsage: maxUsage || null,
      active: true,
      usageCount: 0,
      usedBy: [],
    });
    return res.status(201).json({ success: true, coupon });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    return res.json({ success: true, coupon });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    return res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Validate coupon at checkout (public)
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Coupon code required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid or inactive coupon" });

    // Check max usage
    if (coupon.maxUsage != null && coupon.usageCount >= coupon.maxUsage) {
      return res.status(400).json({ success: false, message: "This coupon has reached its usage limit" });
    }

    // Check min order amount
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${coupon.minOrderAmount} EGP`,
      });
    }

    return res.json({ success: true, coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Record coupon usage after order is placed
export const recordCouponUsage = async (
  code: string,
  orderId: string,
  userId?: string
): Promise<void> => {
  try {
    await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      {
        $inc: { usageCount: 1 },
        $push: { usedBy: { userId: userId || null, orderId, date: new Date() } },
      }
    );
  } catch (err) {
    console.error("Failed to record coupon usage:", err);
  }
};
