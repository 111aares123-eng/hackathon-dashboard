import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, GraduationCap } from "lucide-react";
import { EditorialBackground } from "@/components/layout/EditorialBackground";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between font-sans selection:bg-[#344E41] selection:text-[#F5F3EB] relative">
      <EditorialBackground variant="auth" />
      {/* Top Botanical Ribbon */}
      <div className="bg-[#344E41] text-white px-4 py-2 text-xs font-medium tracking-wide border-b border-[#A3B18A]/30 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#C5D86D]" />
            <span className="font-bold tracking-wider text-[#F5F3EB]">
              RAJALAKSHMI ENGINEERING COLLEGE (AUTONOMOUS)
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[#C5D86D] font-semibold text-[11px] font-mono">
            <Sparkles className="w-3 h-3" />
            <span>[DEPT // AI &amp; DATA SCIENCE]</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#586B5A] hover:text-[#344E41] transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities Portal</span>
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4 relative z-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#586B5A] border-t border-[#DAD7CD] bg-white/95 backdrop-blur-xs relative z-10">
        <p className="font-medium text-[#202820]">Department of AI &amp; DS • Rajalakshmi Engineering College, Chennai</p>
        <p className="text-[11px] text-[#586B5A]/80 mt-0.5">Approved by AICTE • Affiliated to Anna University</p>
      </footer>
    </div>
  );
}
