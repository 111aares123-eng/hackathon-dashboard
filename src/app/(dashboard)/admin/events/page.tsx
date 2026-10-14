import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { isApprovedTeacher } from "@/lib/auth/guards";
import { db } from "@/db";
import { listTeacherEvents } from "@/lib/events/service";
import { TeacherEventList } from "@/components/events/TeacherEventList";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Database, PlusCircle, ArrowLeft } from "lucide-react";
import type { Event } from "@/db/schema";

export default async function AdminEventsPage() {
  const auth = await getServerAuthSession();

  // 1. Authorization Verification
  if (!auth || !isApprovedTeacher(auth.user)) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-xl border border-[#DAD7CD] p-8 text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#202820] tracking-tight">
          Faculty Authorization Required
        </h2>
        <p className="text-xs text-[#586B5A] leading-relaxed">
          Access to this dashboard is restricted to approved faculty members and administrators
          of the Artificial Intelligence &amp; Data Science department.
        </p>
        <p className="text-xs text-[#586B5A]/80 italic">
          If you are a faculty coordinator, please ensure your account has been authorized by the
          Head of Department or Department Administrator.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs font-semibold border-[#DAD7CD] text-[#344E41] hover:bg-[#F5F3EB]">
              Return to Student Portal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch Persisted Events
  let events: Event[] = [];
  let total = 0;
  let totalPages = 1;
  let dbError: string | null = null;

  try {
    const result = await listTeacherEvents(db, auth.user, { page: 1, pageSize: 20 });
    events = result.items;
    total = result.total;
    totalPages = result.totalPages;
  } catch (error) {
    dbError =
      error instanceof Error ? error.message : "Unable to establish connection to PostgreSQL.";
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="bg-white rounded-xl border border-[#DAD7CD] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          {auth.user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#586B5A] hover:text-[#344E41] inline-flex items-center gap-1 mb-1 transition-colors font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Governance Overview
            </Link>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-[#202820] tracking-tight">
            Faculty Opportunity Management
          </h1>
          <p className="text-xs text-[#586B5A]">
            Create, publish, edit, and track upcoming departmental hackathons, workshops, and internships.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/events/new">
            <Button size="sm" className="bg-[#344E41] hover:bg-[#25392F] text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer">
              <PlusCircle className="w-3.5 h-3.5 text-[#C5D86D]" />
              Publish Opportunity
            </Button>
          </Link>
        </div>
      </div>

      {/* Database Connection Notice if PostgreSQL container is idle */}
      {dbError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <Database className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-sm">Local PostgreSQL Service in Standby</p>
            <p className="text-amber-800 leading-relaxed">
              Event services and validation are ready. To connect to a live local database, start
              Docker Desktop and run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">docker compose up -d</code>, or configure a hosted connection string in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">.env.local</code>.
            </p>
          </div>
        </div>
      )}

      {/* Events List Component */}
      {!dbError && (
        <TeacherEventList
          initialEvents={events}
          initialTotal={total}
          currentPage={1}
          totalPages={totalPages}
          currentUserId={auth.user.id}
          userRole={auth.user.role}
        />
      )}
    </div>
  );
}
