import { Router } from "express";
import { getSettings, saveSettings } from "../controllers/sitesettings.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

// Public - frontend reads settings
router.get("/", getSettings);

// Admin only - save settings
router.post("/", authMiddleware, adminMiddleware, saveSettings);

export default router;
