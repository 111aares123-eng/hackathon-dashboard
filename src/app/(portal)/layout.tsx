import { ReactNode } from "react";
import { getServerAuthSession } from "@/lib/auth/server";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { EditorialBackground } from "@/components/layout/EditorialBackground";
import { ShieldCheck } from "lucide-react";

export default async function StudentPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getServerAuthSession();

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-transparent flex flex-col font-sans selection:bg-[#344E41] selection:text-[#F5F3EB] relative">
        <EditorialBackground variant="portal" />
        <StudentHeader user={auth?.user} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          {children}
        </main>
        <footer className="border-t border-[#DAD7CD] bg-white/95 backdrop-blur-xs mt-12 py-8 text-xs text-[#586B5A] relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <p className="font-bold text-[#202820] flex items-center justify-center sm:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#344E41]" />
                Department of Artificial Intelligence &amp; Data Science
              </p>
              <p className="text-[#586B5A] text-[11px]">
                Rajalakshmi Engineering College (Autonomous) • Affiliated to Anna University, Chennai
              </p>
              <p className="text-[11px] text-[#586B5A]/80">
                Rajalakshmi Nagar, Thandalam, Chennai - 602 105 • NAAC &apos;A++&apos; Accredited
              </p>
            </div>
            <div className="text-center sm:text-right text-[11px] text-[#586B5A]">
              <p className="font-medium text-[#202820]">Official Department Opportunities Portal</p>
              <p className="font-mono text-[10px] text-[#344E41] mt-0.5 tracking-wider">[REC // AI-DS AFFAIRS]</p>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
