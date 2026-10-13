import { ReactNode } from "react";
import { getServerAuthSession } from "@/lib/auth/server";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import Link from "next/link";
import { Zap, Star } from "lucide-react";

export default async function StudentPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getServerAuthSession();

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#FFF9E9] text-[#171717] flex flex-col font-body selection:bg-[#F12D2D] selection:text-white">
        <StudentHeader user={auth?.user} />
        <main className="flex-1 w-full pt-24 pb-12">
          {children}
        </main>
        
        {/* Neo-Brutalist Y2K Footer */}
        <footer className="w-full bg-white border-t-2 border-[#171717]">
          {/* Blue High-Voltage Academic Banner */}
          <div className="bg-[#1748F5] text-white px-4 sm:px-8 py-10 border-b-2 border-[#171717]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE23B] text-[#171717] border-2 border-[#171717] font-heading text-xs font-bold uppercase rounded-full shadow-brutal-sm w-fit">
                  <span>DEPARTMENT OF AI &amp; DS</span>
                  <Zap className="w-3.5 h-3.5 fill-[#171717]" />
                </div>
                <h3 className="font-display text-3xl sm:text-4xl uppercase text-white leading-none tracking-tight font-black">
                  HACK. BUILD.<br />DEPLOY.
                </h3>
                <p className="font-body text-sm text-white/90 max-w-sm leading-relaxed">
                  High-velocity engineering and competitive project acceleration platform for Artificial Intelligence and Data Science scholars at Rajalakshmi Engineering College.
                </p>
              </div>

              <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="font-heading text-xs uppercase font-extrabold text-[#FFE23B] tracking-wider">
                    ACADEMIC
                  </span>
                  <Link href="/#events-grid" className="text-xs text-white/80 hover:text-[#FFE23B] transition-colors">
                    Hackathon Portal
                  </Link>
                  <Link href="/saved" className="text-xs text-white/80 hover:text-[#FFE23B] transition-colors">
                    Student Vault
                  </Link>
                  <Link href="/admin" className="text-xs text-white/80 hover:text-[#FFE23B] transition-colors">
                    Faculty Mentors
                  </Link>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-heading text-xs uppercase font-extrabold text-[#FFE23B] tracking-wider">
                    INNOVATION
                  </span>
                  <span className="text-xs text-white/80">REC-IIC Cell</span>
                  <span className="text-xs text-white/80">Patent Hub</span>
                  <span className="text-xs text-white/80">Incubator Grants</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-heading text-xs uppercase font-extrabold text-[#FFE23B] tracking-wider">
                    GOVERNANCE
                  </span>
                  <span className="text-xs text-white/80">100% OD Policy</span>
                  <span className="text-xs text-white/80">Integrity Code</span>
                  <span className="text-xs text-white/80">Support Desk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-white border-2 border-[#171717] font-heading text-[11px] font-bold uppercase rounded shadow-brutal-sm">
                MADE FOR BUILDERS
              </span>
              <span className="px-2.5 py-1 bg-[#FFE23B] border-2 border-[#171717] text-[#171717] font-heading text-[11px] font-bold uppercase rounded shadow-brutal-sm">
                REC 2025
              </span>
              <span className="px-2.5 py-1 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-[11px] font-bold uppercase rounded shadow-brutal-sm">
                AI &amp; DS
              </span>
            </div>
            <div className="font-body text-xs text-[#5D3F3C] text-center md:text-right font-medium">
              &copy; 2025 Department of Artificial Intelligence &amp; Data Science, Rajalakshmi Engineering College (Autonomous).
            </div>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
