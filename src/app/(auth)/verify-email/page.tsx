"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailAction, resendVerificationAction } from "@/lib/auth/actions";
import { validateSafeRedirect } from "@/lib/auth/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email") || "";
  const sentParam = searchParams.get("sent") === "true";
  const redirectTarget = validateSafeRedirect(searchParams.get("redirect"), "/");

  // State management
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : sentParam ? "idle" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string>(emailParam);

  // Resend form state
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Auto-verify when a token is provided in query params
  useEffect(() => {
    if (!token) return;

    const tokenToVerify: string = token;
    let isMounted = true;
    async function verify(verifiedToken: string) {
      setStatus("verifying");
      setErrorMessage(null);

      const result = await verifyEmailAction(verifiedToken);
      if (!isMounted) return;

      if (result.success && result.data) {
        setStatus("success");
        setVerifiedEmail(result.data.email);
      } else {
        setStatus("error");
        setErrorMessage(
          result.error || "This verification link is invalid, expired, or has already been redeemed."
        );
      }
    }

    verify(tokenToVerify);

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendFeedback(null);

    const emailToUse = resendEmail.trim().toLowerCase();
    if (!emailToUse) {
      setResendFeedback({
        success: false,
        message: "Please enter your institutional email address.",
      });
      return;
    }

    setResendLoading(true);
    try {
      const result = await resendVerificationAction(emailToUse);
      if (result.success && result.data) {
        setResendFeedback({
          success: true,
          message: result.data.message,
        });
      } else {
        setResendFeedback({
          success: false,
          message: result.error || "Failed to process resend request. Please try again later.",
        });
      }
    } catch (err) {
      setResendFeedback({
        success: false,
        message: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* 1. Verifying in progress */}
      {status === "verifying" && (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#003366] flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Verifying Institutional Email
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Validating cryptographic verification token with Rajalakshmi Engineering College portal records...
            </p>
          </div>
        </div>
      )}

      {/* 2. Verification Success */}
      {status === "success" && (
        <div className="text-center py-4 space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Email Verified Successfully!
            </h1>
            <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
              {verifiedEmail ? (
                <>
                  Your institutional email <strong className="text-slate-900">{verifiedEmail}</strong> has been
                  confirmed.
                </>
              ) : (
                "Your institutional email ownership has been confirmed."
              )}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              Student bookmarking and full portal privileges are now active.
            </p>
          </div>

          <div className="pt-2">
            <Link href={redirectTarget}>
              <Button className="w-full bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold gap-2 py-2.5">
                <span>Continue to Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Verification Error or Link Expired */}
      {status === "error" && (
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Verification Link Invalid or Expired
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {errorMessage || "This verification link could not be validated."}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Links expire after 30 minutes</p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                For security, single-use verification links expire after 30 minutes. You can request a fresh link below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sent Notice / Resend Form (shown when sentParam is true or on error or idle) */}
      {status !== "success" && status !== "verifying" && (
        <div className="space-y-5">
          {sentParam && status !== "error" && (
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#003366] flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Check Your College Inbox
              </h1>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                We sent a single-use verification link to{" "}
                <strong className="text-slate-900">{emailParam || "your institutional address"}</strong>.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] text-left flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
                <span>
                  Please click the link in your email to activate student opportunity saving and discovery features.
                  The link will expire in <strong>30 minutes</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Resend Form */}
          <div className="pt-2 border-t border-slate-100">
            <h2 className="text-xs font-semibold text-slate-700 mb-2">
              Didn&apos;t receive the link or need a new one?
            </h2>

            {resendFeedback && (
              <div
                className={`p-3 rounded-lg text-xs mb-3 flex items-start gap-2 ${
                  resendFeedback.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {resendFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] leading-relaxed">{resendFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-3">
              <div>
                <label htmlFor="resend-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email Address
                </label>
                <Input
                  id="resend-email"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="student@rajalakshmi.edu.in"
                  required
                  className="text-xs bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <Button
                type="submit"
                disabled={resendLoading}
                variant="outline"
                className="w-full text-xs font-semibold gap-1.5 py-2 border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                {resendLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCw className="w-3.5 h-3.5" />
                )}
                <span>{resendLoading ? "Requesting Fresh Link..." : "Resend Verification Email"}</span>
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        <Link
          href="/"
          className="font-semibold text-[#003366] hover:text-[#002244] underline-offset-2 hover:underline"
        >
          Return to Opportunities Catalog
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
          Loading verification portal...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
