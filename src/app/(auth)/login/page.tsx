"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/auth/actions";
import { validateSafeRedirect } from "@/lib/auth/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, LogIn, Shield, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = validateSafeRedirect(searchParams.get("redirect"), "/");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAction({ email, password });
      if (!result.success) {
        setError(result.error || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      router.push(redirectTarget);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#DAD7CD] shadow-sm p-6 sm:p-8 space-y-6">
      {/* Title with Academic Shield */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#344E41] border border-[#344E41] text-[#C5D86D] flex items-center justify-center mx-auto shadow-xs">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#202820] tracking-tight">
            Sign In to Portal
          </h1>
          <p className="text-xs text-[#586B5A] mt-0.5 font-mono">
            [AUTH // AI &amp; DATA SCIENCE DEPT]
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-[#202820] mb-1 font-mono">
            Department Email Address
          </label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@rajalakshmi.edu.in"
            required
            autoComplete="email"
            className="text-xs sm:text-sm bg-[#F5F3EB]/60 border-[#DAD7CD] focus:bg-white focus:ring-2 focus:ring-[#344E41]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="block text-xs font-semibold text-[#202820] font-mono">
              Password
            </label>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              className="text-xs sm:text-sm bg-[#F5F3EB]/60 border-[#DAD7CD] pr-10 focus:bg-white focus:ring-2 focus:ring-[#344E41]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-[#586B5A] hover:text-[#202820] focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#344E41] hover:bg-[#25392F] text-white text-xs font-semibold gap-1.5 py-2.5 shadow-sm mt-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogIn className="w-3.5 h-3.5 text-[#C5D86D]" />
          )}
          <span>{isLoading ? "Authenticating..." : "Sign In to Account"}</span>
        </Button>
      </form>

      {/* Footer Link */}
      <div className="pt-4 border-t border-[#DAD7CD]/50 text-center text-xs text-[#586B5A]">
        <span>Don&apos;t have an account yet? </span>
        <Link
          href={`/register?redirect=${encodeURIComponent(redirectTarget)}`}
          className="font-semibold text-[#344E41] hover:text-[#25392F] underline-offset-2 hover:underline"
        >
          Register student account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl border border-[#DAD7CD] p-8 text-center text-xs text-[#586B5A]">
          Loading sign in portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
