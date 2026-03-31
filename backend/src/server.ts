import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";
import couponRoutes from "./routes/coupon.routes";
import siteSettingsRoutes from "./routes/sitesettings.routes";
import { connectDB } from "./config/db";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/coupons", couponRoutes);
app.use("/site-settings", siteSettingsRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "🔥 XCraft API is running" });
});

connectDB();

app.listen(5000, () => {
  console.log("🔥 Server running on http://localhost:5000");
});