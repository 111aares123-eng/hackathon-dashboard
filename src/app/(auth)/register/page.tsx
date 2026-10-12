"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/lib/auth/actions";
import { validateSafeRedirect } from "@/lib/auth/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, UserPlus, ShieldAlert, Eye, EyeOff } from "lucide-react";

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

      const target = `/verify-email?sent=true&email=${encodeURIComponent(formData.email)}&redirect=${encodeURIComponent(redirectTarget)}`;
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration error.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#002244] border border-[#003366] text-[#C5A059] flex items-center justify-center mx-auto shadow-xs">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rajalakshmi Engineering College • AI &amp; DS Department
          </p>
        </div>
      </div>

      {/* Security & Role Notice */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#003366] mt-0.5 shrink-0" />
        <span className="leading-relaxed text-[11px]">
          <strong>Role Notice:</strong> Registration creates a <em>Student</em> account under departmental policy.
          Faculty publishing privileges require departmental administrative authorization.
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <Input
            id="reg-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. S. Aadhithya"
            required
            autoComplete="name"
            className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
            Institutional Email Address <span className="text-rose-500">*</span>
          </label>
          <Input
            id="reg-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@rajalakshmi.edu.in"
            required
            autoComplete="email"
            className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Must be an institutional address ending in @rajalakshmi.edu.in
          </p>
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
            Create Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
              autoComplete="new-password"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-regno" className="block text-xs font-semibold text-slate-700 mb-1">
              Roll / Reg Number
            </label>
            <Input
              id="reg-regno"
              name="registerNumber"
              value={formData.registerNumber}
              onChange={handleChange}
              placeholder="e.g. 210701045"
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
          </div>

          <div>
            <label htmlFor="reg-dept" className="block text-xs font-semibold text-slate-700 mb-1">
              Department
            </label>
            <Input
              id="reg-dept"
              name="department"
              value={formData.department}
              readOnly
              className="text-xs sm:text-sm bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold gap-1.5 py-2.5 shadow-sm mt-3 transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          <span>{isLoading ? "Creating Account..." : "Create Student Account"}</span>
        </Button>
      </form>

      {/* Footer Link */}
      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        <span>Already have an account? </span>
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
          className="font-semibold text-[#003366] hover:text-[#002244] underline-offset-2 hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
          Loading registration portal...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
