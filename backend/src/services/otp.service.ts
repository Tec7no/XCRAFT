import crypto from "crypto";

type OTPRecord = {
  otpHash: string;
  expiresAt: number;
  attempts: number;
};

const otpStore = new Map<string, OTPRecord>();

const OTP_EXPIRY = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export const generateOtp = (email: string) => {

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  otpStore.set(email, {
    otpHash,
    expiresAt: Date.now() + OTP_EXPIRY,
    attempts: 0
  });

  return otp;
};

export const checkOtp = (email: string, otp: string) => {

  const record = otpStore.get(email);

  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return false;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email);
    return false;
  }

  const otpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  record.attempts++;

  if (otpHash !== record.otpHash) {
    return false;
  }

  otpStore.delete(email);
  return true;
};