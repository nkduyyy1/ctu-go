"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  completePasswordReset,
  completeSignup,
  loginWithEmailPassword,
  requestPasswordResetOtp,
  requestSignupOtp,
} from "@/app/actions/authActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  completePasswordResetFormSchema,
  loginSchema,
  otpInputSchema,
  signupStepSchema,
  type CompletePasswordResetFormValues,
  type LoginFormValues,
  type OtpFormValues,
  type SignupStepValues,
} from "@/lib/validation/auth";

type Screen =
  | "signin"
  | "signup"
  | "otp"
  | "success"
  | "forgot-password"
  | "forgot-otp";

const OTP_RESEND_COOLDOWN_SEC = 60;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<Screen>("signin");
  const [isPending, startTransition] = useTransition();
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [signupOtpResendSec, setSignupOtpResendSec] = useState(0);
  const [forgotOtpResendSec, setForgotOtpResendSec] = useState(0);
  const [forgotResetEmail, setForgotResetEmail] = useState("");
  const nextPath = searchParams.get("next") || "/profile";

  const signInForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignupStepValues>({
    resolver: zodResolver(signupStepSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpInputSchema),
    defaultValues: { otp: "" },
  });

  const forgotCompleteForm = useForm<CompletePasswordResetFormValues>({
    resolver: zodResolver(completePasswordResetFormSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });

  const forgotForm = useForm<{ email: string }>({
    resolver: zodResolver(loginSchema.pick({ email: true })),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (signupOtpResendSec <= 0) return;
    const t = setInterval(() => setSignupOtpResendSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [signupOtpResendSec]);

  useEffect(() => {
    if (forgotOtpResendSec <= 0) return;
    const t = setInterval(() => setForgotOtpResendSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [forgotOtpResendSec]);

  const onLoginSubmit = signInForm.handleSubmit((data) => {
    startTransition(async () => {
      const res = await loginWithEmailPassword(data);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.push(nextPath);
      router.refresh();
    });
  });

  const onSignupSubmit = signUpForm.handleSubmit((data) => {
    startTransition(async () => {
      const res = await requestSignupOtp({ email: data.email });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setSignupOtpResendSec(OTP_RESEND_COOLDOWN_SEC);
      setScreen("otp");
    });
  });

  const onOtpSubmit = otpForm.handleSubmit((data) => {
    startTransition(async () => {
      const u = signUpForm.getValues();
      const res = await completeSignup({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        password: u.password,
        confirmPassword: u.confirmPassword,
        otp: data.otp,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setScreen("success");
    });
  });

  const sendPasswordResetOtpRequest = async (email: string) => {
    startTransition(async () => {
      const res = await requestPasswordResetOtp({ email });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      const normalized = email.toLowerCase().trim();
      setForgotResetEmail(normalized);
      signInForm.setValue("email", normalized);
      setForgotOtpResendSec(OTP_RESEND_COOLDOWN_SEC);
      forgotCompleteForm.reset({ otp: "", password: "", confirmPassword: "" });
      setScreen("forgot-otp");
    });
  };

  const onForgotPasswordSubmit = forgotForm.handleSubmit((data) => {
    void sendPasswordResetOtpRequest(data.email);
  });

  const onResendSignupOtp = () => {
    if (signupOtpResendSec > 0 || isPending) return;
    const email = signUpForm.getValues("email");
    startTransition(async () => {
      const res = await requestSignupOtp({ email });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setSignupOtpResendSec(OTP_RESEND_COOLDOWN_SEC);
      otpForm.reset({ otp: "" });
    });
  };

  const onForgotCompleteSubmit = forgotCompleteForm.handleSubmit((data) => {
    startTransition(async () => {
      const res = await completePasswordReset({
        email: forgotResetEmail,
        otp: data.otp,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      forgotCompleteForm.reset();
      setForgotResetEmail("");
      setScreen("signin");
    });
  });

  const onResendForgotOtp = () => {
    if (forgotOtpResendSec > 0 || isPending || !forgotResetEmail) return;
    startTransition(async () => {
      const res = await requestPasswordResetOtp({ email: forgotResetEmail });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setForgotOtpResendSec(OTP_RESEND_COOLDOWN_SEC);
      forgotCompleteForm.reset({ otp: "", password: "", confirmPassword: "" });
    });
  };

  const switchAuthScreen = (target: "signin" | "signup") => {
    if (target === "signin") {
      signInForm.setValue("email", signUpForm.getValues("email"));
      setScreen("signin");
    } else {
      signUpForm.setValue("email", signInForm.getValues("email"));
      setScreen("signup");
    }
  };

  const inputLg =
    "h-11 rounded-xl border-border/70 bg-muted/30 pl-10 shadow-none transition-colors focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-primary/20";
  const inputLgPassword = cn(inputLg, "pr-10");

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/15 via-background to-secondary/25 px-4 py-10 md:py-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="relative grid w-full overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl shadow-primary/5 ring-1 ring-black/5 md:min-h-[min(42rem,92vh)] md:grid-cols-2">
          <section className="relative hidden min-h-[22rem] md:block md:h-full md:min-h-0">
            <Image
              src="/assets/ctu-bg-2.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 0vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
            <div className="relative flex h-full min-h-[20rem] flex-col justify-end p-8 md:p-10">
              <div className="max-w-sm space-y-3 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  Cộng đồng sinh viên
                </p>
                <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                  CTU GO
                </h1>
                <p className="text-sm leading-relaxed text-white/90">
                  Khám phá trường, kết nối bạn mới và tìm người hợp vibe ngay trong cộng đồng CTU.
                </p>
              </div>
            </div>
          </section>

          <section className="relative z-10 flex min-h-[20rem] flex-col bg-card">
              <div className="relative h-40 w-full shrink-0 overflow-hidden md:hidden">
                <Image
                  src="/assets/ctu-bg-2.png"
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 px-5 pb-5 text-white">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-white/15 p-1">
                    <Image
                      src="/assets/cg-logo.png"
                      alt="CTU"
                      width={36}
                      height={36}
                      className="size-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/85">
                      Đại học Cần Thơ
                    </p>
                    <p className="text-base font-bold tracking-tight">CTU GO</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col px-5 py-8 md:px-10 md:py-10">
                <div className="mb-5 md:hidden">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {screen === "signin" && "Đăng nhập"}
                    {screen === "signup" && "Tạo tài khoản"}
                    {screen === "otp" && "Xác minh email"}
                    {screen === "success" && "Hoàn tất"}
                    {screen === "forgot-password" && "Quên mật khẩu"}
                    {screen === "forgot-otp" && "Đặt lại mật khẩu"}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {screen === "signin" && "Chào mừng bạn quay lại."}
                    {screen === "signup" && "Điền thông tin để bắt đầu."}
                    {screen === "otp" && "Nhập mã gửi đến email của bạn."}
                    {screen === "success" && "Tài khoản đã sẵn sàng."}
                    {screen === "forgot-password" && "Nhập email để nhận mã OTP đặt lại mật khẩu."}
                    {screen === "forgot-otp" &&
                      "Nhập mã OTP và mật khẩu mới đã gửi tới email của bạn."}
                  </p>
                </div>
                <div className="mb-6 hidden md:block">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                    {screen === "signin" && "Đăng nhập"}
                    {screen === "signup" && "Tạo tài khoản"}
                    {screen === "otp" && "Xác minh email"}
                    {screen === "success" && "Hoàn tất"}
                    {screen === "forgot-password" && "Quên mật khẩu"}
                    {screen === "forgot-otp" && "Đặt lại mật khẩu"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {screen === "signin" && "Chào mừng bạn quay lại."}
                    {screen === "signup" && "Điền thông tin để bắt đầu."}
                    {screen === "otp" && "Nhập mã gửi đến email của bạn."}
                    {screen === "success" && "Tài khoản đã sẵn sàng."}
                    {screen === "forgot-password" && "Nhập email để nhận mã OTP đặt lại mật khẩu."}
                    {screen === "forgot-otp" &&
                      "Nhập mã OTP và mật khẩu mới đã gửi tới email của bạn."}
                  </p>
                </div>

                <div className="flex w-full flex-1 flex-col space-y-6">
                  {(screen === "signin" || screen === "signup") && (
                    <div
                      className="grid grid-cols-2 gap-1 rounded-2xl bg-muted/60 p-1"
                      role="tablist"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={screen === "signin"}
                        className={cn(
                          "rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                          screen === "signin"
                            ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => switchAuthScreen("signin")}
                        disabled={isPending}
                      >
                        Đăng nhập
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={screen === "signup"}
                        className={cn(
                          "rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                          screen === "signup"
                            ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => switchAuthScreen("signup")}
                        disabled={isPending}
                      >
                        Đăng ký
                      </button>
                    </div>
                  )}

                  {screen === "signin" && (
                    <form className="space-y-4" onSubmit={onLoginSubmit} noValidate>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="signin-email" className="text-sm font-medium text-foreground">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            type="email"
                            autoComplete="email"
                            placeholder="ten@student.ctu.edu.vn"
                            aria-invalid={!!signInForm.formState.errors.email}
                            className={cn(inputLg, signInForm.formState.errors.email && "border-destructive")}
                            {...signInForm.register("email")}
                          />
                        </div>
                        <FieldError message={signInForm.formState.errors.email?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="signin-password" className="text-sm font-medium text-foreground">
                          Mật khẩu
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type={showSignInPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            aria-invalid={!!signInForm.formState.errors.password}
                            className={cn(inputLgPassword, signInForm.formState.errors.password && "border-destructive")}
                            {...signInForm.register("password")}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                            onClick={() => setShowSignInPassword((v) => !v)}
                            aria-label={showSignInPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          >
                            {showSignInPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        <FieldError message={signInForm.formState.errors.password?.message} />
                      </div>
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-base font-semibold"
                        disabled={isPending}
                      >
                        {isPending ? <Loader2 className="size-5 animate-spin" /> : "Đăng nhập"}
                      </Button>
                      <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
                        <button
                          type="button"
                          className="text-left text-sm font-medium text-primary hover:underline"
                          onClick={() => {
                            forgotForm.setValue("email", signInForm.getValues("email"));
                            setScreen("forgot-password");
                          }}
                          disabled={isPending}
                        >
                          Quên mật khẩu?
                        </button>
                        <p className="text-sm text-muted-foreground">
                          Chưa có tài khoản?{" "}
                          <button
                            type="button"
                            className="font-semibold text-primary hover:underline"
                            onClick={() => switchAuthScreen("signup")}
                          >
                            Đăng ký
                          </button>
                        </p>
                      </div>
                    </form>
                  )}

                  {screen === "signup" && (
                    <form className="space-y-4" onSubmit={onSignupSubmit} noValidate>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            autoComplete="email"
                            placeholder="ten@student.ctu.edu.vn"
                            aria-invalid={!!signUpForm.formState.errors.email}
                            className={cn(inputLg, signUpForm.formState.errors.email && "border-destructive")}
                            {...signUpForm.register("email")}
                          />
                        </div>
                        <FieldError message={signUpForm.formState.errors.email?.message} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                          <label htmlFor="signup-first" className="text-sm font-medium text-foreground">
                            Tên
                          </label>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="signup-first"
                              type="text"
                              autoComplete="given-name"
                              placeholder="Tên"
                              aria-invalid={!!signUpForm.formState.errors.firstName}
                              className={cn(inputLg, signUpForm.formState.errors.firstName && "border-destructive")}
                              {...signUpForm.register("firstName")}
                            />
                          </div>
                          <FieldError message={signUpForm.formState.errors.firstName?.message} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="signup-last" className="text-sm font-medium text-foreground">
                            Họ
                          </label>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="signup-last"
                              type="text"
                              autoComplete="family-name"
                              placeholder="Họ"
                              aria-invalid={!!signUpForm.formState.errors.lastName}
                              className={cn(inputLg, signUpForm.formState.errors.lastName && "border-destructive")}
                              {...signUpForm.register("lastName")}
                            />
                          </div>
                          <FieldError message={signUpForm.formState.errors.lastName?.message} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                          Mật khẩu
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Tối thiểu 8 ký tự"
                            aria-invalid={!!signUpForm.formState.errors.password}
                            className={cn(inputLgPassword, signUpForm.formState.errors.password && "border-destructive")}
                            {...signUpForm.register("password")}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                            onClick={() => setShowSignupPassword((v) => !v)}
                            aria-label={showSignupPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          >
                            {showSignupPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        <FieldError message={signUpForm.formState.errors.password?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="signup-confirm" className="text-sm font-medium text-foreground">
                          Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-confirm"
                            type={showSignupConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Nhập lại mật khẩu"
                            aria-invalid={!!signUpForm.formState.errors.confirmPassword}
                            className={cn(inputLgPassword, signUpForm.formState.errors.confirmPassword && "border-destructive")}
                            {...signUpForm.register("confirmPassword")}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                            onClick={() => setShowSignupConfirmPassword((v) => !v)}
                            aria-label={showSignupConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          >
                            {showSignupConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        <FieldError message={signUpForm.formState.errors.confirmPassword?.message} />
                      </div>
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-base font-semibold"
                        disabled={isPending}
                      >
                        {isPending ? <Loader2 className="size-5 animate-spin" /> : "Tiếp theo"}
                      </Button>
                      <p className="text-center text-sm text-muted-foreground">
                        Đã có tài khoản?{" "}
                        <button
                          type="button"
                          className="font-semibold text-primary hover:underline"
                          onClick={() => switchAuthScreen("signin")}
                        >
                          Đăng nhập
                        </button>
                      </p>
                    </form>
                  )}

                  {screen === "forgot-password" && (
                    <form className="space-y-5" onSubmit={onForgotPasswordSubmit} noValidate>
                      <Button
                        type="button"
                        variant="ghost"
                        className="-ml-2 h-9 gap-1 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setScreen("signin")}
                        disabled={isPending}
                      >
                        <ArrowLeft className="size-4" />
                        Quay lại đăng nhập
                      </Button>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="forgot-email"
                            type="email"
                            autoComplete="email"
                            placeholder="ten@student.ctu.edu.vn"
                            aria-invalid={!!forgotForm.formState.errors.email}
                            className={cn(
                              inputLg,
                              forgotForm.formState.errors.email && "border-destructive"
                            )}
                            {...forgotForm.register("email")}
                          />
                        </div>
                        <FieldError message={forgotForm.formState.errors.email?.message} />
                      </div>
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-base font-semibold"
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          "Gửi mã OTP"
                        )}
                      </Button>
                    </form>
                  )}

                  {screen === "forgot-otp" && (
                    <form className="space-y-5" onSubmit={onForgotCompleteSubmit} noValidate>
                      <Button
                        type="button"
                        variant="ghost"
                        className="-ml-2 h-9 gap-1 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setScreen("forgot-password");
                          forgotCompleteForm.reset({ otp: "", password: "", confirmPassword: "" });
                        }}
                        disabled={isPending}
                      >
                        <ArrowLeft className="size-4" />
                        Quay lại
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Mã OTP đã gửi tới{" "}
                        <span className="font-medium text-foreground">{forgotResetEmail}</span>.
                      </p>
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="forgot-otp-code"
                          className="flex items-center gap-2 text-sm font-medium text-foreground"
                        >
                          <KeyRound className="size-4 text-muted-foreground" aria-hidden />
                          Mã OTP
                        </label>
                        <Controller
                          control={forgotCompleteForm.control}
                          name="otp"
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="forgot-otp-code"
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              placeholder="••••••"
                              maxLength={6}
                              aria-invalid={!!forgotCompleteForm.formState.errors.otp}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                              className={cn(
                                "h-14 rounded-xl border-border/70 bg-muted/30 text-center font-mono text-2xl tracking-[0.45em] shadow-none focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-primary/20",
                                forgotCompleteForm.formState.errors.otp && "border-destructive"
                              )}
                            />
                          )}
                        />
                        <FieldError message={forgotCompleteForm.formState.errors.otp?.message} />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-xl text-sm font-semibold"
                        onClick={onResendForgotOtp}
                        disabled={isPending || forgotOtpResendSec > 0}
                      >
                        {forgotOtpResendSec > 0
                          ? `Gửi lại mã sau ${forgotOtpResendSec}s`
                          : "Gửi lại mã OTP"}
                      </Button>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="forgot-new-password" className="text-sm font-medium text-foreground">
                          Mật khẩu mới
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="forgot-new-password"
                            type={showResetNewPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Tối thiểu 8 ký tự"
                            aria-invalid={!!forgotCompleteForm.formState.errors.password}
                            className={cn(
                              inputLgPassword,
                              forgotCompleteForm.formState.errors.password && "border-destructive"
                            )}
                            {...forgotCompleteForm.register("password")}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                            onClick={() => setShowResetNewPassword((v) => !v)}
                            aria-label={showResetNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          >
                            {showResetNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        <FieldError message={forgotCompleteForm.formState.errors.password?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="forgot-confirm-password" className="text-sm font-medium text-foreground">
                          Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="forgot-confirm-password"
                            type={showResetConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Nhập lại mật khẩu"
                            aria-invalid={!!forgotCompleteForm.formState.errors.confirmPassword}
                            className={cn(
                              inputLgPassword,
                              forgotCompleteForm.formState.errors.confirmPassword && "border-destructive"
                            )}
                            {...forgotCompleteForm.register("confirmPassword")}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                            onClick={() => setShowResetConfirmPassword((v) => !v)}
                            aria-label={showResetConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          >
                            {showResetConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        <FieldError message={forgotCompleteForm.formState.errors.confirmPassword?.message} />
                      </div>
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-base font-semibold"
                        disabled={isPending}
                      >
                        {isPending ? <Loader2 className="size-5 animate-spin" /> : "Lưu mật khẩu mới"}
                      </Button>
                    </form>
                  )}

                  {screen === "otp" && (
                    <form className="space-y-5" onSubmit={onOtpSubmit} noValidate>
                      <Button
                        type="button"
                        variant="ghost"
                        className="-ml-2 h-9 gap-1 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setScreen("signup");
                          otpForm.reset({ otp: "" });
                        }}
                        disabled={isPending}
                      >
                        <ArrowLeft className="size-4" />
                        Quay lại
                      </Button>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="otp" className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <KeyRound className="size-4 text-muted-foreground" aria-hidden />
                          Mã OTP
                        </label>
                        <Controller
                          control={otpForm.control}
                          name="otp"
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="otp"
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              placeholder="••••••"
                              maxLength={6}
                              aria-invalid={!!otpForm.formState.errors.otp}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                              className={cn(
                                "h-14 rounded-xl border-border/70 bg-muted/30 text-center font-mono text-2xl tracking-[0.45em] shadow-none focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-primary/20",
                                otpForm.formState.errors.otp && "border-destructive"
                              )}
                            />
                          )}
                        />
                        <FieldError message={otpForm.formState.errors.otp?.message} />
                        <p className="text-xs text-muted-foreground">
                          Đã gửi mã 6 chữ số tới{" "}
                          <span className="font-medium text-foreground">
                            {signUpForm.getValues("email")}
                          </span>
                          .
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-xl text-sm font-semibold"
                        onClick={onResendSignupOtp}
                        disabled={isPending || signupOtpResendSec > 0}
                      >
                        {signupOtpResendSec > 0
                          ? `Gửi lại mã sau ${signupOtpResendSec}s`
                          : "Gửi lại mã OTP"}
                      </Button>
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-base font-semibold"
                        disabled={isPending}
                      >
                        {isPending ? <Loader2 className="size-5 animate-spin" /> : "Xác nhận"}
                      </Button>
                    </form>
                  )}

                  {screen === "success" && (
                    <div className="flex flex-col items-center space-y-6 py-4 text-center">
                      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                        <CheckCircle2 className="size-9" strokeWidth={1.75} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-lg font-semibold text-foreground">Đăng ký thành công</p>
                        <p className="text-sm text-muted-foreground">
                          Bạn có thể đăng nhập bằng email và mật khẩu vừa tạo.
                        </p>
                      </div>
                      <Button
                        className="h-11 w-full max-w-xs rounded-xl text-base font-semibold"
                        onClick={() => {
                          signInForm.setValue("email", signUpForm.getValues("email"));
                          signInForm.resetField("password");
                          signUpForm.reset();
                          otpForm.reset();
                          setScreen("signin");
                          router.push("/auth");
                        }}
                        disabled={isPending}
                      >
                        Đăng nhập ngay
                      </Button>
                    </div>
                  )}
                </div>
              </div>
          </section>
        </div>
      </div>
    </main>
  );
}
