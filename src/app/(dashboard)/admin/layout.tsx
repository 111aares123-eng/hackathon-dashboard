import { ReactNode } from "react";
import { getServerAuthSession } from "@/lib/auth/server";
import { FacultyHeader } from "@/components/layout/FacultyHeader";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getServerAuthSession();

  return (
    <div className="min-h-screen bg-[#FFF9E9] text-[#171717] flex flex-col font-body selection:bg-[#F12D2D] selection:text-white">
      <FacultyHeader
        userRole={auth?.user.role}
        userName={auth?.user.name}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {children}
      </main>
      <footer className="border-t-2 border-[#171717] bg-white py-4 text-center text-xs text-[#5D3F3C]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left font-medium">
          <p className="font-heading uppercase font-bold text-[#171717]">
            Department of AI &amp; DS • Rajalakshmi Engineering College (Autonomous)
          </p>
          <p className="text-[11px] font-mono">
            Faculty Governance &amp; Administration Control Tower
          </p>
        </div>
      </footer>
    </div>
  );
}
