import { Router } from "express";
import { getUsers, deleteUser, getDashboardStats } from "../controllers/admin.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

// All admin routes are protected
router.use(adminMiddleware);

router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

export default router;
