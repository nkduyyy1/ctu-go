"use server";

import { revalidatePath } from "next/cache";

import { sendOtpEmail } from "@/lib/email";
import { withActionLog } from "@/lib/server-action-log";
import { generateOtp, hashOtp } from "@/lib/security";
import {
  completeSignupSchema,
  emailSchema,
  loginSchema,
  otpSchema,
} from "@/lib/validation/auth";
import { createServiceRoleClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";

export async function completeSignup(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
}) {
  return withActionLog("auth/completeSignup", async () => {
  const parsed = completeSignupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Thông tin đăng ký không hợp lệ" };
  }
  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { success: false, message: "Mật khẩu xác nhận không khớp" };
  }

  const supabase = await createClient();
  const email = parsed.data.email.toLowerCase().trim();
  const verifyResult = await verifyOtpToken({
    email,
    otp: parsed.data.otp,
  });

  if (!verifyResult.success) {
    return verifyResult;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data.user) {
    return {
      success: false,
      message:
        "Không tạo được tài khoản. Kiểm tra email xác nhận từ Supabase hoặc tắt Confirm email.",
    };
  }

  const profileError = await upsertProfileForEmail(
    data.user.id,
    email,
    `${parsed.data.firstName.trim()} ${parsed.data.lastName.trim()}`.trim()
  );
  if (profileError) {
    return { success: false, message: profileError.message };
  }

  revalidatePath("/profile");
  return { success: true, message: "Đăng ký thành công" };
  });
}

export async function requestSignupOtp(input: { email: string }) {
  return withActionLog("auth/requestSignupOtp", async () => {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Email không hợp lệ" };
  }

  const supabase = await createClient();
  const email = parsed.data.email.toLowerCase().trim();
  const otp = generateOtp(6);
  const otpHash = hashOtp(email, otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: deactivateError } = await supabase
    .from("email_otp_tokens")
    .update({ is_active: false })
    .eq("email", email)
    .eq("purpose", "signup")
    .eq("is_active", true);

  if (deactivateError) {
    return { success: false, message: deactivateError.message };
  }

  const { error: createError } = await supabase.from("email_otp_tokens").insert({
    email,
    otp_hash: otpHash,
    purpose: "signup",
    expires_at: expiresAt,
    max_attempts: 5,
    attempt_count: 0,
    is_active: true,
  });

  if (createError) {
    return { success: false, message: createError.message };
  }

  try {
    await sendOtpEmail({ email, otp });
  } catch (error) {
    console.error("requestSignupOtp sendOtpEmail failed", error);
    return { success: false, message: "Gửi OTP thất bại" };
  }

  return { success: true, message: "OTP đăng ký đã được gửi vào email" };
  });
}

async function verifyOtpToken(input: { email: string; otp: string }) {
  const parsed = otpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "OTP không hợp lệ" };
  }

  const supabase = await createClient();
  const email = parsed.data.email.toLowerCase().trim();
  const providedHash = hashOtp(email, parsed.data.otp);
  const now = new Date().toISOString();

  const { data: token, error: tokenError } = await supabase
    .from("email_otp_tokens")
    .select("*")
    .eq("email", email)
    .eq("purpose", "signup")
    .eq("is_active", true)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tokenError) {
    return { success: false, message: tokenError.message };
  }

  if (!token) {
    return { success: false, message: "OTP đã hết hạn hoặc không tồn tại" };
  }

  if (token.attempt_count >= token.max_attempts) {
    await supabase
      .from("email_otp_tokens")
      .update({ is_active: false })
      .eq("id", token.id);
    return { success: false, message: "OTP đã vượt quá số lần thử" };
  }

  if (token.otp_hash !== providedHash) {
    await supabase
      .from("email_otp_tokens")
      .update({ attempt_count: token.attempt_count + 1 })
      .eq("id", token.id);
    return { success: false, message: "OTP không đúng" };
  }

  const { error: consumeError } = await supabase
    .from("email_otp_tokens")
    .update({
      is_active: false,
      consumed_at: new Date().toISOString(),
      attempt_count: token.attempt_count + 1,
    })
    .eq("id", token.id);

  if (consumeError) {
    return { success: false, message: consumeError.message };
  }

  return { success: true, message: "Xác thực OTP thành công" };
}

export async function loginWithEmailPassword(input: {
  email: string;
  password: string;
}) {
  return withActionLog("auth/loginWithEmailPassword", async () => {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Thông tin đăng nhập không hợp lệ" };
  }

  const supabase = await createClient();
  const email = parsed.data.email.toLowerCase().trim();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email_verified")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return { success: false, message: profileError.message };
  }

  if (!profile?.email_verified) {
    await supabase.auth.signOut();
    return { success: false, message: "Tài khoản chưa xác thực OTP" };
  }

  return { success: true, message: "Đăng nhập thành công" };
  });
}

export async function logoutUser() {
  return withActionLog("auth/logoutUser", async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
  });
}

export async function requestResetPassword(input: { email: string }) {
  return withActionLog("auth/requestResetPassword", async () => {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Email không hợp lệ" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth`
      : undefined,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Đã gửi email đặt lại mật khẩu" };
  });
}

async function upsertProfileForEmail(userId: string, email: string, username: string) {
  const row = {
    id: userId,
    email,
    full_name: username,
    email_verified: true,
  };
  const admin = createServiceRoleClient();
  if (admin) {
    const { error } = await admin.from("profiles").upsert(row, { onConflict: "id" });
    return error;
  }
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(row, { onConflict: "id" });
  return error;
}
