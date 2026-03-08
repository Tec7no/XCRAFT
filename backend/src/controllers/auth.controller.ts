import { Request, Response } from "express";
import { generateOtp, checkOtp } from "../services/otp.service";
import { sendMail } from "../utils/mail";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/*
==============================
Send OTP
==============================
*/

export const sendOtp = async (req: Request, res: Response) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const otp = generateOtp(email);

    await sendMail(email, otp);

    return res.json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {

    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

/*
==============================
Verify OTP
==============================
*/

export const verifyOtp = async (req: Request, res: Response) => {

  try {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required"
      });
    }

    const valid = checkOtp(email, otp);

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or expired OTP"
      });
    }

    return res.json({
      success: true,
      message: "OTP verified"
    });

  } catch (error) {

    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

/*
==============================
Signup
==============================
*/

export const signup = async (req: Request, res: Response) => {

  try {

    const {
      name,
      email,
      password,
      confirmPassword,
      phone
    } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      verified: true
    });

    return res.json({
      success: true,
      message: "Account created successfully",
      user
    });

  } catch (error: any) {

  console.error("Verify OTP Error:", error);

  return res.status(500).json({
    success: false,
    message: error.message
  });
}
};

/*
==============================
Login
==============================
*/

export const loginUser = async (req: Request, res: Response) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    // check email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    // generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        verified: user.verified
      }
    });

  } catch (error: any) {

    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

// Forget password

export const forgotPassword = async (req: Request, res: Response) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "If the email exists, a reset link has been sent"
      });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendMail(
      email,
      `Reset your password: ${resetLink}`
    );

    res.json({
      success: true,
      message: "If the email exists, a reset link has been sent"
    });

  } catch (error: any) {

    console.error("Forgot Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

// Reset password

export const resetPassword = async (req: Request, res: Response) => {

  try {

    const { token, password } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.userId, {
      password: hashedPassword
    });

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: "Invalid or expired token"
    });

  }

};