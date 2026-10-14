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
    <div className="bg-white rounded-xl border border-[#DAD7CD] shadow-sm p-6 sm:p-8 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#344E41] border border-[#344E41] text-[#C5D86D] flex items-center justify-center mx-auto shadow-xs">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#202820] tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-[#586B5A] mt-0.5 font-mono">
            [ENROLLMENT // AI &amp; DS DEPARTMENT]
          </p>
        </div>
      </div>

      {/* Security & Role Notice */}
      <div className="p-3.5 rounded-lg bg-[#F5F3EB] border border-[#DAD7CD] text-[#202820] text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#344E41] mt-0.5 shrink-0" />
        <span className="leading-relaxed text-[11px] text-[#586B5A]">
          <strong className="text-[#202820]">Role Notice:</strong> Registration creates a <em>Student</em> account under departmental policy.
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
          <label htmlFor="reg-name" className="block text-xs font-semibold text-[#202820] mb-1 font-mono">
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
            className="text-xs sm:text-sm bg-[#F5F3EB]/60 border-[#DAD7CD] focus:bg-white focus:ring-2 focus:ring-[#344E41]"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-[#202820] mb-1 font-mono">
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
            className="text-xs sm:text-sm bg-[#F5F3EB]/60 border-[#DAD7CD] focus:bg-white focus:ring-2 focus:ring-[#344E41]"
          />
          <p className="text-[11px] text-[#586B5A] mt-1">
            Must be an institutional address ending in @rajalakshmi.edu.in
          </p>
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-[#202820] mb-1 font-mono">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-regno" className="block text-xs font-semibold text-[#202820] mb-1 font-mono">
              Roll / Reg Number
            </label>
            <Input
              id="reg-regno"
              name="registerNumber"
              value={formData.registerNumber}
              onChange={handleChange}
              placeholder="e.g. 210701045"
              className="text-xs sm:text-sm bg-[#F5F3EB]/60 border-[#DAD7CD] focus:bg-white focus:ring-2 focus:ring-[#344E41]"
            />
          </div>

          <div>
            <label htmlFor="reg-dept" className="block text-xs font-semibold text-[#202820] mb-1 font-mono">
              Department
            </label>
            <Input
              id="reg-dept"
              name="department"
              value={formData.department}
              readOnly
              className="text-xs sm:text-sm bg-[#F5F3EB] text-[#586B5A] cursor-not-allowed border-[#DAD7CD]"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#344E41] hover:bg-[#25392F] text-white text-xs font-semibold gap-1.5 py-2.5 shadow-sm mt-3 transition-all cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UserPlus className="w-3.5 h-3.5 text-[#C5D86D]" />
          )}
          <span>{isLoading ? "Creating Account..." : "Create Student Account"}</span>
        </Button>
      </form>

      {/* Footer Link */}
      <div className="pt-4 border-t border-[#DAD7CD]/50 text-center text-xs text-[#586B5A]">
        <span>Already have an account? </span>
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
          className="font-semibold text-[#344E41] hover:text-[#25392F] underline-offset-2 hover:underline"
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
        <div className="bg-white rounded-xl border border-[#DAD7CD] p-8 text-center text-xs text-[#586B5A]">
          Loading registration portal...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
