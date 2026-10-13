"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/lib/auth/actions";
import { validateSafeRedirect } from "@/lib/auth/validation";
import { AlertCircle, Loader2, UserPlus, ShieldAlert, Eye, EyeOff, Sparkles } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = validateSafeRedirect(searchParams.get("redirect"), "/");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    registerNumber: "",
    department: "Artificial Intelligence and Data Science",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerAction({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        registerNumber: formData.registerNumber || undefined,
      });

      if (!result.success) {
        setError(result.error || "Registration failed.");
        setIsLoading(false);
        return;
      }

      const target = `/verify-email?sent=true&email=${encodeURIComponent(
        formData.email
      )}&redirect=${encodeURIComponent(redirectTarget)}`;
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration error.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-xl p-6 sm:p-8 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded bg-[#FFE23B] border-2 border-[#171717] text-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
          <UserPlus className="w-6 h-6 text-[#171717]" />
        </div>
        <div>
          <h1 className="font-display text-2xl uppercase font-black text-[#171717] tracking-tight">
            Create Student Account
          </h1>
          <p className="font-body text-xs text-[#5D3F3C] mt-0.5 font-medium">
            Rajalakshmi Engineering College • AI &amp; DS Department
          </p>
        </div>
      </div>

      {/* Security & Role Notice */}
      <div className="p-3.5 rounded bg-[#FFF9E9] border-2 border-[#171717] text-[#5D3F3C] text-xs flex items-start gap-2.5 shadow-brutal-sm">
        <ShieldAlert className="w-4 h-4 text-[#F12D2D] mt-0.5 shrink-0" />
        <span className="leading-relaxed text-[11px] font-medium">
          <strong className="text-[#171717]">Institutional Policy:</strong> Registration requires an exact <code className="font-bold text-[#F12D2D]">@rajalakshmi.edu.in</code> student email. Faculty accounts require HOD administrative authorization.
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded bg-[#FFDAD6] border-2 border-[#171717] text-[#410002] text-xs flex items-start gap-2.5 shadow-brutal-sm">
          <AlertCircle className="w-4 h-4 text-[#F12D2D] mt-0.5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="reg-name"
            className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1"
          >
            Full Name <span className="text-[#F12D2D]">*</span>
          </label>
          <input
            id="reg-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. S. Aadhithya"
            required
            autoComplete="name"
            className="w-full bg-white text-[#171717] placeholder:text-[#5D3F3C]/60 border-2 border-[#171717] rounded px-3 py-2 font-body text-sm shadow-brutal-sm focus:outline-none focus:shadow-brutal-blue transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="reg-email"
            className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1"
          >
            Institutional Email <span className="text-[#F12D2D]">*</span>
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@rajalakshmi.edu.in"
            required
            autoComplete="email"
            className="w-full bg-white text-[#171717] placeholder:text-[#5D3F3C]/60 border-2 border-[#171717] rounded px-3 py-2 font-body text-sm shadow-brutal-sm focus:outline-none focus:shadow-brutal-blue transition-all"
          />
          <p className="text-[11px] text-[#5D3F3C] mt-1 font-medium">
            Must end with <code className="font-bold text-[#F12D2D]">@rajalakshmi.edu.in</code>
          </p>
        </div>

        <div>
          <label
            htmlFor="reg-number"
            className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1"
          >
            College Register Number (Optional)
          </label>
          <input
            id="reg-number"
            name="registerNumber"
            value={formData.registerNumber}
            onChange={handleChange}
            placeholder="e.g. 210701001"
            className="w-full bg-white text-[#171717] placeholder:text-[#5D3F3C]/60 border-2 border-[#171717] rounded px-3 py-2 font-body text-sm shadow-brutal-sm focus:outline-none focus:shadow-brutal-blue transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="reg-password"
            className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1"
          >
            Password (Min 8 Characters) <span className="text-[#F12D2D]">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-white text-[#171717] placeholder:text-[#5D3F3C]/60 border-2 border-[#171717] rounded px-3 py-2 pr-10 font-body text-sm shadow-brutal-sm focus:outline-none focus:shadow-brutal-blue transition-all"
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

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase tracking-wider font-extrabold rounded shadow-brutal hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-[#FFE23B]" />
                <span>Register Student Account</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Links */}
      <div className="pt-4 border-t-2 border-[#171717]/10 text-center space-y-2">
        <p className="font-body text-xs text-[#5D3F3C]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-heading font-extrabold text-[#1748F5] uppercase hover:underline"
          >
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#5D3F3C] bg-white border-2 border-[#171717] rounded shadow-brutal">
          Loading registration portal...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
