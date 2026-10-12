import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col justify-between font-sans">
      {/* Top Academic Ribbon */}
      <div className="bg-[#002244] text-white px-4 py-2 text-xs font-medium tracking-wide border-b border-[#C5A059]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#C5A059]" />
            <span className="font-bold tracking-wider text-slate-100">
              RAJALAKSHMI ENGINEERING COLLEGE (AUTONOMOUS)
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[#C5A059] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#003366] transition-colors"
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

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <p className="font-medium text-slate-700">Department of AI &amp; DS • Rajalakshmi Engineering College, Chennai</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Approved by AICTE • Affiliated to Anna University</p>
      </footer>
    </div>
  );
}
