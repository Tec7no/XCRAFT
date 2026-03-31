import { Router } from "express";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

// Public - validate coupon at checkout
router.post("/validate", validateCoupon);

// Admin only
router.get("/", authMiddleware, adminMiddleware, getCoupons);
router.post("/", authMiddleware, adminMiddleware, createCoupon);
router.patch("/:id", authMiddleware, adminMiddleware, updateCoupon);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCoupon);

export default router;
