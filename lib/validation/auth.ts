import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export const emailSchema = z.object({
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export const signupStepSchema = z
  .object({
    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    firstName: z.string().trim().min(1, "Vui lòng nhập tên").max(50, "Tối đa 50 ký tự"),
    lastName: z.string().trim().min(1, "Vui lòng nhập họ").max(50, "Tối đa 50 ký tự"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(8, "Mật khẩu tối thiểu 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const otpInputSchema = z.object({
  otp: z
    .string()
    .min(1, "Nhập mã OTP")
    .length(6, "Mã OTP phải đủ 6 chữ số")
    .regex(/^\d+$/, "Chỉ được nhập chữ số"),
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const completeSignupSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  otp: z.string().length(6),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupStepValues = z.infer<typeof signupStepSchema>;
export type OtpFormValues = z.infer<typeof otpInputSchema>;
