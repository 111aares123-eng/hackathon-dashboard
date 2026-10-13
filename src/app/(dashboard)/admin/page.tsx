import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { db } from "@/db";
import { getAdminDashboardMetrics } from "@/lib/admin/service";
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
  Star,
  Zap,
  TrendingUp,
  Download,
  Bell,
  Settings,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const auth = await getServerAuthSession();

  // 1. Authorization: Only administrators permitted
  if (!auth || auth.user.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded border-2 border-[#171717] p-8 text-center shadow-brutal-xl space-y-4">
        <div className="w-14 h-14 rounded bg-[#FFDAD6] border-2 border-[#171717] flex items-center justify-center mx-auto text-[#F12D2D] shadow-brutal-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl uppercase font-black text-[#171717]">
          Department Administrator Access Required
        </h2>
        <p className="font-body text-xs text-[#5D3F3C] leading-relaxed">
          Access to this central governance matrix is restricted exclusively to designated Head of Department and administrative faculty of Rajalakshmi Engineering College.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1748F5] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md transition-all"
          >
            Go to Faculty Events View
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

  const initials = auth.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col w-full gap-8 -mt-2">
      {/* Top Marquee Ticker */}
      <div className="w-full bg-[#FFE23B] text-[#171717] py-2 overflow-hidden border-y-2 border-[#171717] select-none shadow-brutal-sm">
        <div className="animate-marquee items-center gap-6 font-heading text-xs uppercase tracking-wider font-extrabold">
          <span className="flex items-center gap-1 font-bold">
            <CheckCircle className="w-4 h-4 text-[#171717]" />
            REC AUTONOMOUS • AI &amp; DS GOVERNANCE CONTROL TOWER
          </span>
          <span>★</span>
          <span>SPRING 2025 SEMESTER APPROVAL CYCLE ACTIVE</span>
          <span>★</span>
          <span className="bg-[#F12D2D] text-white px-2 py-0.5 rounded shadow-brutal-sm">
            OD ATTENDANCE DESK: 3 ON-DUTY PETITIONS LIVE
          </span>
          <span>★</span>
          <span>FACULTY ONBOARDING DEADLINE: FEB 28</span>
          <span>★</span>
          <span>ANNA UNIVERSITY REGULATION 2021/2023 COMPLIANT</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Administrative Header & Status Pill Box */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-[#F12D2D] text-white font-heading text-xs uppercase font-extrabold rounded border-2 border-[#171717] shadow-brutal-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                HOD / EXECUTIVE LEVEL
              </span>
              <span className="px-2.5 py-1 bg-[#E9E2D5] text-[#171717] font-heading text-xs uppercase font-extrabold rounded border-2 border-[#171717] shadow-brutal-sm">
                DEPARTMENT OF AI &amp; DS
              </span>
              <span className="px-2.5 py-1 bg-[#FFE23B] text-[#171717] font-heading text-xs uppercase font-extrabold rounded border-2 border-[#171717] shadow-brutal-sm flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-[#171717]" />
                NAAC A++ PROTOCOL
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl uppercase text-[#171717] tracking-tight leading-none mt-1 font-black">
              GOVERNANCE &amp; APPROVAL MATRIX
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#5D3F3C] max-w-2xl font-medium">
              Coordinate academic on-duty sanctions, verify credentialed faculty mentors, and authorize departmental hackathons and research challenges.
            </p>
          </div>

          {/* Quick Action Pill Group */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/admin/audit-logs"
              className="px-4 py-2 bg-white text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:-translate-y-0.5 hover:shadow-brutal-md transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#1748F5]" />
              <span>Export Audit Logs</span>
            </Link>
            <Link
              href="/admin/events/new"
              className="px-4 py-2 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:-translate-y-0.5 hover:shadow-brutal-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-[#FFE23B]" />
              <span>Launch Event Wizard</span>
            </Link>
          </div>
        </div>

        {/* Database Error Banner if any */}
        {dbError && (
          <div className="p-4 rounded bg-[#FFDAD6] border-2 border-[#171717] text-[#410002] text-xs flex items-start gap-3 shadow-brutal-sm">
            <Database className="w-5 h-5 text-[#F12D2D] shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-black text-sm uppercase">PostgreSQL Standby Mode</p>
              <p className="font-body text-xs mt-0.5">{dbError}</p>
            </div>
          </div>
        )}

        {/* Main Workspace: Sub-sidebar + Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Collapsible Left Admin Sub-Sidebar (3 Cols) */}
          <aside className="lg:col-span-3 flex flex-col gap-5">
            {/* HOD Profile Card with Neo-brutalist Badge */}
            <div className="bg-white p-4 rounded border-2 border-[#171717] shadow-brutal-md flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#FFE23B] rounded-full opacity-60 pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded bg-[#F12D2D] text-white flex items-center justify-center border-2 border-[#171717] shadow-brutal-sm font-display text-base uppercase font-black">
                    {initials}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FFE23B] border border-[#171717] rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 fill-[#171717]" />
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading text-sm text-[#171717] font-extrabold truncate">
                    {auth.user.name}
                  </span>
                  <span className="font-heading text-[10px] text-[#F12D2D] uppercase font-black">
                    HOD - AI &amp; Data Science
                  </span>
                  <span className="font-body text-[11px] text-[#5D3F3C] truncate font-mono">
                    Staff: {auth.user.staffId || "REC-HOD-001"}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#171717]/20 flex items-center justify-between font-heading text-[11px]">
                <span className="text-[#5D3F3C]">Signature Auth:</span>
                <span className="bg-[#1748F5] text-white px-2 py-0.5 rounded font-black uppercase border border-[#171717] shadow-brutal-sm">
                  PGP Active
                </span>
              </div>
            </div>

            {/* Navigation Sub-Menu */}
            <nav className="bg-white p-2 rounded border-2 border-[#171717] shadow-brutal-md flex flex-col gap-1 font-heading text-xs font-bold uppercase">
              <Link
                href="/admin"
                className="px-3 py-2 bg-[#F12D2D] text-white rounded border border-[#171717] shadow-brutal-sm flex items-center justify-between"
              >
                <span>Overview &amp; KPIs</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admin/teachers"
                className="px-3 py-2 bg-[#FFF9E9] text-[#171717] hover:bg-[#E9E2D5] rounded transition-all flex items-center justify-between"
              >
                <span>Staff Verification</span>
                <span className="px-1.5 py-0.5 bg-[#F12D2D] text-white text-[10px] font-black rounded border border-[#171717]">
                  {metrics?.pendingTeacherRequests || 0} REQ
                </span>
              </Link>
              <Link
                href="/admin/events/new"
                className="px-3 py-2 bg-[#FFF9E9] text-[#171717] hover:bg-[#E9E2D5] rounded transition-all flex items-center justify-between"
              >
                <span>Event Wizard</span>
                <Zap className="w-4 h-4 text-[#F12D2D]" />
              </Link>
              <Link
                href="/admin/events"
                className="px-3 py-2 bg-[#FFF9E9] text-[#171717] hover:bg-[#E9E2D5] rounded transition-all flex items-center justify-between"
              >
                <span>Manage Events</span>
                <span className="text-[#1748F5]">({metrics?.publishedEventsCount || 0})</span>
              </Link>
              <Link
                href="/admin/audit-logs"
                className="px-3 py-2 bg-[#FFF9E9] text-[#171717] hover:bg-[#E9E2D5] rounded transition-all flex items-center justify-between"
              >
                <span>Audit Compliance</span>
                <FileText className="w-4 h-4 text-[#5D3F3C]" />
              </Link>
            </nav>

            {/* Department Accolade Graphic Box */}
            <div className="bg-[#1748F5] p-4 rounded border-2 border-[#171717] text-white shadow-brutal-md flex flex-col gap-2 relative overflow-hidden">
              <span className="font-heading text-[10px] bg-[#FFE23B] text-[#171717] border border-[#171717] px-2 py-0.5 rounded w-fit font-black uppercase shadow-brutal-sm">
                AI &amp; DS INSIGHT
              </span>
              <span className="font-display text-lg uppercase leading-tight font-black">
                94.6% ON-DUTY COMPLIANCE
              </span>
              <p className="font-body text-xs text-white/90 leading-relaxed">
                All AI &amp; DS students participating in approved Hackathons and IEEE Conferences auto-qualify for laboratory attendance exemption.
              </p>
            </div>
          </aside>

          {/* Main Center Panel (9 Cols) */}
          <section className="lg:col-span-9 flex flex-col gap-8">
            {/* Top 4 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* KPI 1: Total Students Active */}
              <div className="bg-[#FFE23B] text-[#171717] p-4 rounded border-2 border-[#171717] shadow-brutal flex flex-col justify-between gap-3 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs uppercase tracking-wider font-extrabold">
                    TOTAL SCHOLARS
                  </span>
                  <div className="w-7 h-7 rounded border border-[#171717] bg-[#171717] text-[#FFE23B] flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-none">
                    {metrics ? metrics.totalStudents : 1420}
                  </span>
                  <div className="flex items-center gap-1 font-heading text-[10px] font-bold mt-1 text-[#5D3F3C]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>VERIFIED ACCOUNTS</span>
                  </div>
                </div>
                {/* Inline SVG Sparkline */}
                <div className="w-full h-6 pt-1">
                  <svg
                    className="w-full h-full stroke-[#171717] fill-none stroke-[2.5]"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 24"
                  >
                    <polyline points="0,20 15,18 30,14 45,17 60,9 75,12 90,4 100,2" />
                  </svg>
                </div>
              </div>

              {/* KPI 2: Mentor Pool */}
              <div className="bg-white text-[#171717] p-4 rounded border-2 border-[#171717] shadow-brutal flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs uppercase tracking-wider font-extrabold text-[#5D3F3C]">
                    MENTOR POOL
                  </span>
                  <div className="w-7 h-7 rounded border border-[#171717] bg-[#1748F5] text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-none">
                    {metrics ? metrics.totalTeachers + metrics.totalAdmins : 38}
                  </span>
                  <div className="flex items-center gap-1 font-heading text-[10px] font-bold mt-1 text-[#1748F5]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>FACULTY ONBOARDED</span>
                  </div>
                </div>
                <div className="w-full bg-[#E9E2D5] h-2.5 rounded-full overflow-hidden border border-[#171717]">
                  <div className="bg-[#1748F5] h-full w-[95%]" />
                </div>
              </div>

              {/* KPI 3: Pending Queue */}
              <div className="bg-[#F12D2D] text-white p-4 rounded border-2 border-[#171717] shadow-brutal flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs uppercase tracking-wider font-extrabold">
                    PENDING QUEUE
                  </span>
                  <div className="w-7 h-7 rounded border border-[#171717] bg-white text-[#F12D2D] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-none">
                    {metrics ? `${metrics.pendingTeacherRequests} REQS` : "4 REQS"}
                  </span>
                  <div className="flex items-center gap-1 font-heading text-[10px] font-bold mt-1 text-white/90">
                    <span>ACTION REQUIRED</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-heading text-[10px] bg-white text-[#F12D2D] px-2 py-0.5 rounded border border-[#171717] w-fit font-black uppercase">
                  <span>Avg: 3.2 hrs</span>
                </div>
              </div>

              {/* KPI 4: Active Live Events */}
              <div className="bg-[#1748F5] text-white p-4 rounded border-2 border-[#171717] shadow-brutal flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs uppercase tracking-wider font-extrabold">
                    LIVE STREAMS
                  </span>
                  <div className="w-7 h-7 rounded border border-[#171717] bg-[#FFE23B] text-[#171717] flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-none">
                    {metrics ? metrics.publishedEventsCount : 14}
                  </span>
                  <div className="flex items-center gap-1 font-heading text-[10px] font-bold mt-1 text-white/90">
                    <span>
                      {metrics ? `${metrics.draftEventsCount} DRAFTS STAGED` : "6 HACK • 5 WRK"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between font-heading text-[10px] text-[#FFE23B] font-bold">
                  <span>Footprint</span>
                  <span>100% active</span>
                </div>
              </div>
            </div>

            {/* Quick Action Matrix Tile */}
            <div className="bg-white p-6 rounded border-2 border-[#171717] shadow-brutal-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-display text-xl uppercase font-black text-[#171717]">
                  Faculty Verification &amp; Governance Center
                </h3>
                <p className="font-body text-xs text-[#5D3F3C]">
                  Review credential submissions from teaching staff or publish new department hackathons.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/admin/teachers"
                  className="px-4 py-2.5 bg-[#FFE23B] text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm hover:shadow-brutal transition-all"
                >
                  Review Faculty Queue ({metrics?.pendingTeacherRequests || 0})
                </Link>
                <Link
                  href="/admin/events"
                  className="px-4 py-2.5 bg-[#1748F5] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm hover:shadow-brutal transition-all"
                >
                  Manage Opportunities
                </Link>
              </div>
            </div>

            {/* Recent Audit Compliance Trail */}
            {metrics?.recentAuditLogs && metrics.recentAuditLogs.length > 0 && (
              <div className="bg-white p-6 rounded border-2 border-[#171717] shadow-brutal-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl uppercase font-black text-[#171717]">
                    Recent Governance Audit Trail
                  </h3>
                  <Link
                    href="/admin/audit-logs"
                    className="font-heading text-xs text-[#1748F5] uppercase font-extrabold hover:underline"
                  >
                    View All Logs →
                  </Link>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left font-body text-xs">
                    <thead className="bg-[#E9E2D5] font-heading text-xs uppercase font-extrabold border-2 border-[#171717]">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-[#171717]">Action</th>
                        <th className="py-2.5 px-3 border-r border-[#171717]">Actor</th>
                        <th className="py-2.5 px-3 border-r border-[#171717]">Target Entity</th>
                        <th className="py-2.5 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-2 border-[#171717]">
                      {metrics.recentAuditLogs.slice(0, 5).map((log) => (
                        <tr key={log.id} className="hover:bg-[#FFF9E9] transition-colors">
                          <td className="py-2 px-3 border-r border-[#171717]">
                            <span className="px-2 py-0.5 rounded font-heading text-[10px] font-black uppercase bg-[#FFE23B] border border-[#171717]">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-2 px-3 border-r border-[#171717] font-medium">
                            {log.actor?.name || log.actor?.email || "System"}
                          </td>
                          <td className="py-2 px-3 border-r border-[#171717] font-mono text-[11px]">
                            {log.targetType} ({log.targetId ? log.targetId.slice(0, 8) : "N/A"})
                          </td>
                          <td className="py-2 px-3 text-[#5D3F3C]">
                            {new Date(log.createdAt).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
