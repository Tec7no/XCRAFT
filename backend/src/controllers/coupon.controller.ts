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
    const { code, type, value, minOrderAmount } = req.body;
    if (!code || !type || value === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: "Coupon code already exists" });
    const coupon = await Coupon.create({ code, type, value, minOrderAmount, active: true, usageCount: 0 });
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

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid or inactive coupon" });
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount is ${coupon.minOrderAmount} EGP` });
    }
    return res.json({ success: true, coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
