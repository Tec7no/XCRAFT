import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  getMyOrders,
  updateOrderStatus,
  archiveOrder,
  deleteOrder,
} from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

// Customer
router.post("/", createOrder);
router.get("/my", authMiddleware, getMyOrders);

// Admin only
router.get("/", authMiddleware, adminMiddleware, getOrders);
router.get("/:id", authMiddleware, adminMiddleware, getOrder);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.patch("/:id/archive", authMiddleware, adminMiddleware, archiveOrder);
router.delete("/:id", authMiddleware, adminMiddleware, deleteOrder);

export default router;