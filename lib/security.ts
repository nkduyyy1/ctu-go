import { createHash, randomInt } from "crypto";

export function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(randomInt(min, max + 1));
}

export function hashOtp(email: string, otp: string) {
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    throw new Error("OTP_SECRET is not configured");
  }
  return createHash("sha256").update(`${email}:${otp}:${secret}`).digest("hex");
}
