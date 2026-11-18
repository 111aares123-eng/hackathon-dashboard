"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/auth/actions";
import { validateSafeRedirect } from "@/lib/auth/validation";
import { AlertCircle, Loader2, LogIn, Eye, EyeOff, Sparkles, Shield } from "lucide-react";

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
    <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-xl p-6 sm:p-8 space-y-6">
      {/* Title Header with Sticker Badge */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded bg-[#FFE23B] border-2 border-[#171717] text-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
          <Sparkles className="w-6 h-6 text-[#171717]" />
        </div>
        <div>
          <h1 className="font-display text-2xl uppercase font-black text-[#171717] tracking-tight">
            Sign In to Portal
          </h1>
          <p className="font-body text-xs text-[#5D3F3C] mt-0.5 font-medium">
            REC Artificial Intelligence &amp; Data Science Account
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded bg-[#FFDAD6] border-2 border-[#171717] text-[#410002] text-xs flex items-start gap-2.5 shadow-brutal-sm">
          <AlertCircle className="w-4 h-4 text-[#F12D2D] mt-0.5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block font-heading text-xs uppercase font-extrabold text-[#171717]"
          >
            Institutional Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@rajalakshmi.edu.in"
            required
            autoComplete="email"
            className="w-full bg-white text-[#171717] placeholder:text-[#5D3F3C]/60 border-2 border-[#171717] rounded px-3 py-2.5 font-body text-sm shadow-brutal-sm focus:outline-none focus:shadow-brutal-blue transition-all"
          />
          <p className="text-[11px] text-[#5D3F3C] font-medium">
            Must end with <code className="font-bold text-[#F12D2D]">@rajalakshmi.edu.in</code>
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block font-heading text-xs uppercase font-extrabold text-[#171717]"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-white text-[#171717] placeholder:text-[#5D3F3C]/60 border-2 border-[#171717] rounded px-3 py-2.5 pr-10 font-body text-sm shadow-brutal-sm focus:outline-none focus:shadow-brutal-blue transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D3F3C] hover:text-[#171717] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase tracking-wider font-extrabold rounded shadow-brutal hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 text-[#FFE23B]" />
              <span>Sign In to Dashboard</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="pt-4 border-t-2 border-[#171717]/10 text-center space-y-2">
        <p className="font-body text-xs text-[#5D3F3C]">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-heading font-extrabold text-[#1748F5] uppercase hover:underline"
          >
            Create Account
          </Link>
        </p>
        <p className="text-[11px] text-[#5D3F3C]">
          Institutional governance access restricted to REC AI &amp; DS department scholars and faculty.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#5D3F3C] bg-white border-2 border-[#171717] rounded shadow-brutal">
          Loading login portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
