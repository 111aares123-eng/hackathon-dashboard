import { ReactNode } from "react";
import { getServerAuthSession } from "@/lib/auth/server";
import { FacultyHeader } from "@/components/layout/FacultyHeader";
import { EditorialBackground } from "@/components/layout/EditorialBackground";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getServerAuthSession();

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans selection:bg-[#344E41] selection:text-[#F5F3EB] relative">
      <EditorialBackground variant="admin" />
      <FacultyHeader
        userRole={auth?.user.role}
        userName={auth?.user.name}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {children}
      </main>
      <footer className="border-t border-[#DAD7CD] bg-white/95 backdrop-blur-xs py-5 text-center text-xs text-[#586B5A] relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="font-semibold text-[#202820]">
            Department of Artificial Intelligence &amp; Data Science • Rajalakshmi Engineering College (Autonomous)
          </p>
          <p className="text-[11px] text-[#586B5A] font-mono">
            [GOVERNANCE // FACULTY &amp; ADMIN PORTAL]
          </p>
        </div>
      </footer>
    </div>
  );
}
