import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import { connectDB } from "./config/db";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

connectDB();

app.listen(5000, () => {
  console.log("🔥 Server running on http://localhost:5000");
});