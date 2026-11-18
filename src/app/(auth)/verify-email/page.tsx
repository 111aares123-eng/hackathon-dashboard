"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailAction, resendVerificationAction } from "@/lib/auth/actions";
import { validateSafeRedirect } from "@/lib/auth/validation";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Sparkles,
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
          result.error ||
            "The verification link is invalid, malformed, or has expired (exceeded 30 minutes)."
        );
      }
    }

    verify(tokenToVerify);

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle manual resend request
  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendLoading(true);
    setResendFeedback(null);

    try {
      const result = await resendVerificationAction(resendEmail);
      if (result.success) {
        setResendFeedback({
          success: true,
          message:
            result.data?.message ||
            "Verification email dispatched. If the address is registered and unverified, check your inbox or server console.",
        });
      } else {
        setResendFeedback({
          success: false,
          message: result.error || "Unable to send verification email.",
        });
      }
    } catch (err) {
      setResendFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Network error during resend.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-xl p-6 sm:p-8 space-y-6">
      {/* 1. VERIFYING STATE */}
      {status === "verifying" && (
        <div className="text-center space-y-4 py-6">
          <div className="w-14 h-14 rounded bg-[#FFE23B] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
            <Loader2 className="w-7 h-7 text-[#171717] animate-spin" />
          </div>
          <div>
            <h1 className="font-display text-2xl uppercase font-black text-[#171717]">
              Verifying Institutional Email
            </h1>
            <p className="font-body text-xs text-[#5D3F3C] mt-1 font-medium">
              Validating cryptographic token against Rajalakshmi Engineering College registry...
            </p>
          </div>
        </div>
      )}

      {/* 2. SUCCESS STATE */}
      {status === "success" && (
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded bg-[#D9FF38] border-2 border-[#171717] text-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
            <CheckCircle2 className="w-7 h-7 text-[#171717]" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#D9FF38] text-[#171717] border border-[#171717] font-heading text-[10px] uppercase font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Institutional Ownership</span>
            </div>
            <h1 className="font-display text-2xl uppercase font-black text-[#171717] pt-1">
              Email Verified Successfully!
            </h1>
            <p className="font-body text-xs text-[#5D3F3C] max-w-sm mx-auto">
              Your institutional email <strong className="text-[#171717]">{verifiedEmail}</strong> has been authenticated. You now have full access to save opportunities and submit project registrations.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={redirectTarget}
              className="w-full py-3 px-4 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Opportunities</span>
              <ArrowRight className="w-4 h-4 text-[#FFE23B]" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. ERROR STATE */}
      {status === "error" && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded bg-[#FFDAD6] border-2 border-[#171717] text-[#F12D2D] flex items-center justify-center mx-auto shadow-brutal-sm">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display text-xl uppercase font-black text-[#171717]">
                Verification Failed or Expired
              </h1>
              <p className="font-body text-xs text-[#5D3F3C] mt-1">
                {errorMessage || "The link is invalid or has expired."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. IDLE / RESEND FORM */}
      {(status === "idle" || status === "error") && (
        <div className="space-y-4">
          {sentParam && status === "idle" && (
            <div className="p-4 rounded bg-[#FFF9E9] border-2 border-[#171717] shadow-brutal-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold text-[#171717] uppercase">
                <Mail className="w-4 h-4 text-[#F12D2D]" />
                <span>Verification Link Dispatched</span>
              </div>
              <p className="font-body text-xs text-[#5D3F3C]">
                We sent an authentication link to{" "}
                <strong className="text-[#171717]">{emailParam || "your email"}</strong>. Click the link within 30 minutes to activate your account.
              </p>
            </div>
          )}

          <div className="pt-2">
            <h3 className="font-heading text-xs uppercase font-extrabold text-[#171717] mb-2 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-[#1748F5]" />
              <span>Request New Verification Link</span>
            </h3>

            {resendFeedback && (
              <div
                className={`p-3 rounded border-2 border-[#171717] text-xs mb-3 shadow-brutal-sm font-medium ${
                  resendFeedback.success
                    ? "bg-[#D9FF38] text-[#171717]"
                    : "bg-[#FFDAD6] text-[#410002]"
                }`}
              >
                {resendFeedback.message}
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="student@rajalakshmi.edu.in"
                  required
                  className="w-full bg-white text-[#171717] placeholder:text-[#5D3F3C]/60 border-2 border-[#171717] rounded px-3 py-2 font-body text-sm shadow-brutal-sm focus:outline-none focus:shadow-brutal-blue transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={resendLoading}
                className="w-full py-2.5 px-4 bg-[#1748F5] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending Token...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-[#FFE23B]" />
                    <span>Dispatch Verification Email</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="font-heading text-xs text-[#5D3F3C] hover:text-[#171717] uppercase font-bold"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#5D3F3C] bg-white border-2 border-[#171717] rounded shadow-brutal">
          Loading verification portal...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
