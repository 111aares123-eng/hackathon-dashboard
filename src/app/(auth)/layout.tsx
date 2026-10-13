import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFF9E9] text-[#171717] flex flex-col justify-between font-body">
      {/* Top Accredited Banner */}
      <div className="bg-[#FFE23B] text-[#171717] border-b-2 border-[#171717] py-1.5 px-4 overflow-hidden select-none">
        <div className="flex items-center justify-center gap-3 font-heading text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap">
          <Star className="w-3.5 h-3.5 fill-[#171717]" />
          <span>RAJALAKSHMI ENGINEERING COLLEGE (AUTONOMOUS)</span>
          <Star className="w-3.5 h-3.5 fill-[#171717]" />
          <span>AI &amp; DS IDENTITY PORTAL</span>
          <Star className="w-3.5 h-3.5 fill-[#171717]" />
          <span>NAAC A++ ACCREDITED</span>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto px-4 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-heading text-xs font-bold text-[#5D3F3C] hover:text-[#F12D2D] uppercase transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities Portal</span>
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#5D3F3C] border-t-2 border-[#171717] bg-white font-medium">
        <p className="font-heading uppercase font-bold text-[#171717]">
          Department of AI &amp; DS • Rajalakshmi Engineering College, Chennai
        </p>
        <p className="text-[11px] mt-0.5">Approved by AICTE • Affiliated to Anna University</p>
      </footer>
    </div>
  );
}
