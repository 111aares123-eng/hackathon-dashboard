import { ReactNode } from "react";
import { getServerAuthSession } from "@/lib/auth/server";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ShieldCheck } from "lucide-react";

export default async function StudentPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getServerAuthSession();

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans">
        <StudentHeader user={auth?.user} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white mt-12 py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <p className="font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                Department of Artificial Intelligence &amp; Data Science
              </p>
              <p className="text-slate-600 text-[11px]">
                Rajalakshmi Engineering College (Autonomous) • Affiliated to Anna University, Chennai
              </p>
              <p className="text-[11px] text-slate-400">
                Rajalakshmi Nagar, Thandalam, Chennai - 602 105 • NAAC &apos;A++&apos; Accredited
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <p>Official Department Opportunities Portal</p>
              <p className="font-mono text-[10px] text-slate-400 mt-0.5">REC AI &amp; DS Academic Affairs</p>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
