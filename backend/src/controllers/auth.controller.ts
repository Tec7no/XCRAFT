import { Request, Response } from "express";
import { generateOtp, checkOtp } from "../services/otp.service";
import { sendMail } from "../utils/mail";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    const otp = generateOtp(email);
    await sendMail(email, `Your verification code is: ${otp}. Valid for 5 minutes.`);
    return res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP required" });
    const valid = checkOtp(email, otp);
    if (!valid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    return res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone, verified: true });
    return res.json({ success: true, message: "Account created successfully", user });
  } catch (error: any) {
    console.error("Signup Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "If the email exists, a reset link has been sent" });
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: "15m" });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendMail(email, `Reset your password: ${resetLink}`);
    return res.json({ success: true, message: "If the email exists, a reset link has been sent" });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { name, phone, addresses } = req.body;
    const update: Record<string, any> = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (addresses) update.addresses = addresses;
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};