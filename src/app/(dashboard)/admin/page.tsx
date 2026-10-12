import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { db } from "@/db";
import { getAdminDashboardMetrics } from "@/lib/admin/service";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  FileText,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Clock,
  ArrowRight,
  Database,
  PlusCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const auth = await getServerAuthSession();

  // 1. Authorization: Only administrators permitted
  if (!auth || auth.user.role !== "ADMIN") {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Department Administrator Access Required
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Access to this central governance dashboard is restricted exclusively to designated Head of Department and administrative faculty of Rajalakshmi Engineering College.
        </p>
        <div className="pt-2">
          <Link href="/admin/events">
            <Button variant="outline" size="sm" className="text-xs">
              Go to Faculty Events View
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Query Aggregate Governance Metrics
  let metrics = null;
  let dbError: string | null = null;

  try {
    metrics = await getAdminDashboardMetrics(db, auth.user);
  } catch (error) {
    dbError =
      error instanceof Error ? error.message : "Unable to establish connection to PostgreSQL.";
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#002244]/5 text-[#003366] border border-[#003366]/15">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>AI &amp; DS Department Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Governance &amp; Approvals Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Welcome, <strong>{auth.user.name}</strong>. Manage opportunity publication, faculty credentials, and audit compliance trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/teachers">
            <Button size="sm" className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold gap-1.5 shadow-xs">
              <UserCheck className="w-3.5 h-3.5" />
              Review Approvals
            </Button>
          </Link>
          <Link href="/admin/events/new">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-slate-300 text-slate-700">
              <PlusCircle className="w-3.5 h-3.5" />
              Publish Opportunity
            </Button>
          </Link>
        </div>
      </div>

      {/* Database Error Card (Shown when DB is offline) */}
      {dbError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <Database className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-sm">PostgreSQL Service Standby</p>
            <p className="text-amber-800 leading-relaxed">
              Live statistics are currently in standby mode ({dbError}). To review real persisted data, start PostgreSQL with <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">docker compose up -d</code> or configure <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">.env.local</code>.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Registered Students */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-[#003366]/30 transition-all">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Students</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-slate-900">{metrics.totalStudents}</span>
              <span className="text-[11px] text-slate-500 font-medium">Verified accounts</span>
            </div>
          </div>

          {/* Card 2: Authorized Faculty */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-[#003366]/30 transition-all">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Authorized Faculty</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF6ED] text-[#C5A059] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-slate-900">
                {metrics.totalTeachers + metrics.totalAdmins}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {metrics.totalTeachers} Teachers • {metrics.totalAdmins} Admins
              </span>
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-[#003366]/30 transition-all">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Approvals</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-slate-900">
                {metrics.pendingTeacherRequests}
              </span>
              <Link
                href="/admin/teachers"
                className="text-[11px] font-bold text-[#003366] hover:underline"
              >
                Review requests &rarr;
              </Link>
            </div>
          </div>

          {/* Card 4: Event Counts */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-[#003366]/30 transition-all">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Events</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-slate-900">
                {metrics.publishedEventsCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {metrics.draftEventsCount} Drafts • {metrics.cancelledEventsCount} Cancelled
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Governance Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation & Governance Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Administrative Modules
          </h2>

          <div className="space-y-3">
            <Link
              href="/admin/teachers"
              className="block bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#003366]/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#003366] transition-colors">
                      Faculty Approvals &amp; Roles
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Review requests, grant credentials, or revoke publishing permissions.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#003366] mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            <Link
              href="/admin/events"
              className="block bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#003366]/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#003366] transition-colors">
                      Department Events Oversight
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Inspect opportunities across all teachers and manage lifecycle states.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#003366] mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="block bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#003366]/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#003366] transition-colors">
                      Security &amp; Governance Audit Trail
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Inspect append-only logs for registrations, approvals, and cancellations.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#003366] mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Audit Activities Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent Activity Feed
            </h2>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-bold text-[#003366] hover:underline"
            >
              View Complete Audit Log &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {!metrics || metrics.recentAuditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                <Clock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No recent activity recorded.</p>
                <p className="text-slate-400">Events will populate automatically as faculty and students interact.</p>
              </div>
            ) : (
              metrics.recentAuditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {log.targetType}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      By <strong>{log.actor?.name || "System"}</strong> ({log.actor?.email || "system@rec.local"})
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium">
                    {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
