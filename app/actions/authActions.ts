"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { sendOtpEmail } from "@/lib/email";
import { generateOtp, hashOtp } from "@/lib/security";
import { createClient } from "@/supabase/server";

const completeSignupSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  otp: z.string().length(6),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function completeSignup(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
}) {
  const parsed = completeSignupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Thong tin dang ky khong hop le" };
  }
  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { success: false, message: "Mat khau xac nhan khong khop" };
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

  if (data.user) {
    await upsertProfileForEmail(
      data.user.id,
      email,
      `${parsed.data.firstName.trim()} ${parsed.data.lastName.trim()}`.trim()
    );
  }

  revalidatePath("/profile");
  return { success: true, message: "Dang ky thanh cong" };
}

export async function requestSignupOtp(input: { email: string }) {
  const parsed = z.object({ email: z.string().email() }).safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Email khong hop le" };
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
  } catch {
    return { success: false, message: "Gui OTP that bai" };
  }

  return { success: true, message: "OTP dang ky da duoc gui ve email" };
}

async function verifyOtpToken(input: { email: string; otp: string }) {
  const parsed = otpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "OTP khong hop le" };
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
    return { success: false, message: "OTP da het han hoac khong ton tai" };
  }

  if (token.attempt_count >= token.max_attempts) {
    await supabase
      .from("email_otp_tokens")
      .update({ is_active: false })
      .eq("id", token.id);
    return { success: false, message: "OTP da vuot qua so lan thu" };
  }

  if (token.otp_hash !== providedHash) {
    await supabase
      .from("email_otp_tokens")
      .update({ attempt_count: token.attempt_count + 1 })
      .eq("id", token.id);
    return { success: false, message: "OTP khong dung" };
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

  return { success: true, message: "Xac thuc OTP thanh cong" };
}

export async function loginWithEmailPassword(input: {
  email: string;
  password: string;
}) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Thong tin dang nhap khong hop le" };
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
    return { success: false, message: "Tai khoan chua xac thuc OTP" };
  }

  return { success: true, message: "Dang nhap thanh cong" };
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}

export async function requestResetPassword(input: { email: string }) {
  const parsed = z.object({ email: z.string().email() }).safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Email khong hop le" };
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

  return { success: true, message: "Da gui email dat lai mat khau" };
}

async function upsertProfileForEmail(userId: string, email: string, username: string) {
  const supabase = await createClient();
  await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: username,
      email_verified: true,
    },
    { onConflict: "id" }
  );
}
