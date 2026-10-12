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
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans">
      <FacultyHeader
        userRole={auth?.user.role}
        userName={auth?.user.name}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="font-semibold text-slate-700">
            Department of Artificial Intelligence &amp; Data Science • Rajalakshmi Engineering College (Autonomous)
          </p>
          <p className="text-[11px] text-slate-400">
            Faculty Event Governance &amp; Administration Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
