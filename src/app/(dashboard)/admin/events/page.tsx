import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { isApprovedTeacher } from "@/lib/auth/guards";
import { db } from "@/db";
import { listTeacherEvents } from "@/lib/events/service";
import { TeacherEventList } from "@/components/events/TeacherEventList";
import { ShieldAlert, Database, PlusCircle, ArrowLeft, Calendar } from "lucide-react";
import type { Event } from "@/db/schema";

export default async function AdminEventsPage() {
  const auth = await getServerAuthSession();

  // 1. Authorization Verification
  if (!auth || !isApprovedTeacher(auth.user)) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded border-2 border-[#171717] p-8 text-center shadow-brutal-xl space-y-4">
        <div className="w-14 h-14 rounded bg-[#FFDAD6] border-2 border-[#171717] flex items-center justify-center mx-auto text-[#F12D2D] shadow-brutal-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl uppercase font-black text-[#171717]">
          Faculty Authorization Required
        </h2>
        <p className="font-body text-xs text-[#5D3F3C] leading-relaxed">
          Access to this dashboard is restricted to approved faculty members and administrators
          of the Artificial Intelligence &amp; Data Science department.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal hover:bg-[#E9E2D5]"
          >
            Return to Student Portal
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded border-2 border-[#171717] p-6 sm:p-7 shadow-brutal-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#FFE23B] text-[#171717] border border-[#171717] font-heading text-[10px] uppercase font-black shadow-brutal-sm">
            <Calendar className="w-3.5 h-3.5 fill-[#171717]" />
            <span>Opportunity Management Desk</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171717]">
            Department Opportunities &amp; Events
          </h1>
          <p className="font-body text-xs text-[#5D3F3C]">
            Manage published hackathons, drafts, workshops, and student submission milestones.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#FFE23B]" />
          <span>Publish New Opportunity</span>
        </Link>
      </div>

      {/* Database Error Banner if any */}
      {dbError && (
        <div className="p-4 rounded bg-[#FFDAD6] border-2 border-[#171717] text-[#410002] text-xs flex items-start gap-3 shadow-brutal-sm">
          <Database className="w-5 h-5 text-[#F12D2D] shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-black text-sm uppercase">Database Offline</p>
            <p className="font-body text-xs mt-0.5">{dbError}</p>
          </div>
        </div>
      )}

      {/* Teacher Event List */}
      <TeacherEventList
        initialEvents={events}
        initialTotal={total}
        currentPage={1}
        totalPages={totalPages}
        currentUserId={auth.user.id}
        userRole={auth.user.role}
      />
    </div>
  );
}
