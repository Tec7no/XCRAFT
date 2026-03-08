import { Router } from "express";
import { sendOtp, verifyOtp, signup, loginUser, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

/*
==============================
Public Routes
==============================
*/

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/*
==============================
Protected Routes
==============================
*/

router.get("/profile", authMiddleware, (req: any, res) => {
  res.json({
    message: "User profile",
    user: req.user
  });
});

export default router;