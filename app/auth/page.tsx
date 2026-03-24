"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  completeSignup,
  loginWithEmailPassword,
  requestResetPassword,
  requestSignupOtp,
} from "@/app/actions/authActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Screen = "signin" | "signup" | "otp" | "success";
type AuthSlide = "toSignin" | "toSignup";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<Screen>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [authSlide, setAuthSlide] = useState<AuthSlide>("toSignin");
  const [isPending, startTransition] = useTransition();
  const nextPath = searchParams.get("next") || "/profile";
  const isSignupFlow = screen === "signup" || screen === "otp" || screen === "success";

  const onNextSignup = () => {
    startTransition(async () => {
      if (password !== confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }
      const res = await requestSignupOtp({ email });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setScreen("otp");
    });
  };

  const onLogin = () => {
    startTransition(async () => {
      const res = await loginWithEmailPassword({ email, password });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.push(nextPath);
      router.refresh();
    });
  };

  const onConfirmOtp = () => {
    startTransition(async () => {
      const res = await completeSignup({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setScreen("success");
    });
  };

  const onForgotPassword = () => {
    startTransition(async () => {
      const res = await requestResetPassword({ email });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
    });
  };

  const switchAuthScreen = (target: "signin" | "signup") => {
    setAuthSlide(target === "signup" ? "toSignup" : "toSignin");
    setScreen(target);
  };

  return (
    <main className="relative flex min-h-screen bg-gradient-to-br from-[#f3faf9] via-[#f8fffd] to-[#eef6ff] px-4 py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#57CC99]/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-[#38A3A5]/15 blur-3xl" />
      </div>
      <div className="mx-auto grid min-h-[78vh] w-full max-w-6xl items-center">
        <div className="relative w-full overflow-hidden rounded-2xl border bg-card shadow-2xl md:min-h-[640px]">
          <section
            className={`relative hidden min-h-[640px] md:absolute md:inset-y-0 md:left-0 md:block md:w-1/2 md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isSignupFlow ? "md:translate-x-full" : "md:translate-x-0"
            }`}
          >
            <div className="absolute inset-0 bg-[url('/assets/ctu-bg.jpeg')] bg-cover bg-right" />
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative flex h-full flex-col justify-end p-8 text-white">
              <h1 className="text-3xl font-bold leading-tight">CTU GO</h1>
              <p className="mt-3 text-sm text-white/90">
                Khám phá trường, kết nối bạn mới và tìm người hợp vibe ngay trong cộng đồng CTU.
              </p>
            </div>
          </section>

          <section
            className={`relative z-10 p-5 bg-white md:absolute md:inset-y-0 md:right-0 md:w-1/2 md:p-8 md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isSignupFlow ? "md:-translate-x-full" : "md:translate-x-0"
            }`}
          >
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl font-semibold text-[#22577A]">CTU GO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-0">
              {(screen === "signin" || screen === "signup") && (
                <div className="relative grid grid-cols-2 rounded-full bg-muted p-1">
                  <div
                    className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow transition-transform duration-300 ${
                      screen === "signup" ? "translate-x-[calc(100%+0.25rem)]" : "translate-x-0"
                    }`}
                  />
                  <button
                    type="button"
                    className={`relative z-10 rounded-full px-3 py-2 text-sm font-medium transition ${
                      screen === "signin" ? "text-[#22577A]" : "text-muted-foreground"
                    }`}
                    onClick={() => switchAuthScreen("signin")}
                    disabled={isPending}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    className={`relative z-10 rounded-full px-3 py-2 text-sm font-medium transition ${
                      screen === "signup" ? "text-[#22577A]" : "text-muted-foreground"
                    }`}
                    onClick={() => switchAuthScreen("signup")}
                    disabled={isPending}
                  >
                    Sign up
                  </button>
                </div>
              )}

              {screen === "signin" && (
                <div
                  className={`space-y-4 animate-in fade-in duration-300 ${
                    authSlide === "toSignin" ? "slide-in-from-left-4" : "slide-in-from-right-4"
                  }`}
                >
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                  <Button className="w-full bg-[#22577A] hover:bg-[#1A4864]" onClick={onLogin} disabled={isPending}>
                    Sign in
                  </Button>
                  <button
                    type="button"
                    className="text-sm text-[#22577A] hover:underline"
                    onClick={onForgotPassword}
                    disabled={isPending}
                  >
                    Forgot your password
                  </button>
                  <div className="text-sm text-muted-foreground">
                    Don&apos;t have an account{" "}
                    <button
                      type="button"
                      className="font-medium text-[#22577A] hover:underline"
                      onClick={() => switchAuthScreen("signup")}
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              )}

              {screen === "signup" && (
                <div
                  className={`space-y-4 animate-in fade-in duration-300 ${
                    authSlide === "toSignup" ? "slide-in-from-right-4" : "slide-in-from-left-4"
                  }`}
                >
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                  <Button
                    className="w-full bg-[#22577A] hover:bg-[#1A4864]"
                    onClick={onNextSignup}
                    disabled={isPending}
                  >
                    Next
                  </Button>
                </div>
              )}

              {screen === "otp" && (
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="OTP code"
                    maxLength={6}
                  />
                  <Button
                    className="w-full bg-[#22577A] hover:bg-[#1A4864]"
                    onClick={onConfirmOtp}
                    disabled={isPending}
                  >
                    Confirm
                  </Button>
                </div>
              )}

              {screen === "success" && (
                <div className="space-y-4">
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                    Đăng ký thành công
                  </div>
                  <Button
                    className="w-full bg-[#22577A] hover:bg-[#1A4864]"
                    onClick={() => {
                      setScreen("signin");
                      router.push("/auth");
                    }}
                    disabled={isPending}
                  >
                    Go to Sign in
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
