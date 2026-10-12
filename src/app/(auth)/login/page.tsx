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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Title with Academic Shield */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#002244] border border-[#003366] text-[#C5A059] flex items-center justify-center mx-auto shadow-xs">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Sign In to Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Artificial Intelligence &amp; Data Science Department Account
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
          <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
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
            className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
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
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 pr-10 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold gap-1.5 py-2.5 shadow-sm mt-2 transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogIn className="w-3.5 h-3.5" />
          )}
          <span>{isLoading ? "Authenticating..." : "Sign In to Account"}</span>
        </Button>
      </form>

      {/* Footer Link */}
      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        <span>Don&apos;t have an account yet? </span>
        <Link
          href={`/register?redirect=${encodeURIComponent(redirectTarget)}`}
          className="font-semibold text-[#003366] hover:text-[#002244] underline-offset-2 hover:underline"
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
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
          Loading sign in portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
