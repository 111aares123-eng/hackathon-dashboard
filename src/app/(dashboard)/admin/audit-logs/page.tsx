import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { db } from "@/db";
import { listAuditLogs } from "@/lib/admin/service";
import { AuditLogsViewer } from "@/components/admin/AuditLogsViewer";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Database, ArrowLeft, FileText } from "lucide-react";
import type { AuditLog } from "@/db/schema";

interface AuditLogsPageProps {
  searchParams?: Promise<{
    page?: string;
    action?: string;
    search?: string;
  }>;
}

export default async function AdminAuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const auth = await getServerAuthSession();

  // 1. Authorization: Only administrators permitted
  if (!auth || auth.user.role !== "ADMIN") {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Department Administrator Access Required
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Access to the immutable governance audit log is restricted exclusively to authorized administrators.
        </p>
        <div className="pt-2">
          <Link href="/admin/events">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              Return to Events Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const page = Number(resolvedParams?.page || 1);
  const action = resolvedParams?.action;
  const search = resolvedParams?.search;

  // 2. Query Audit Logs
  let logs: (AuditLog & { actor?: { name: string; email: string; role: string } | null })[] = [];
  let total = 0;
  let totalPages = 1;
  let dbError: string | null = null;

  try {
    const result = await listAuditLogs(db, auth.user, {
      page,
      pageSize: 30,
      action,
      search,
    });
    logs = result.items;
    total = result.total;
    totalPages = result.totalPages;
  } catch (error) {
    dbError =
      error instanceof Error ? error.message : "Unable to establish connection to PostgreSQL.";
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-1">
        <Link
          href="/admin"
          className="text-xs font-semibold text-slate-500 hover:text-[#003366] inline-flex items-center gap-1 mb-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Governance Overview
        </Link>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#003366]" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Governance &amp; Security Audit Trail
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Complete, append-only history of departmental registrations, faculty approvals, privilege revocations, and opportunity mutations.
        </p>
      </div>

      {/* Database Error Fallback */}
      {dbError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <Database className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-sm">PostgreSQL Standby / Connection Offline</p>
            <p className="text-amber-800 leading-relaxed">
              Unable to query audit records ({dbError}). When PostgreSQL is started, this view records every security-sensitive operation automatically.
            </p>
          </div>
        </div>
      )}

      {/* Audit Logs Viewer Component */}
      {!dbError && (
        <AuditLogsViewer
          initialLogs={logs}
          totalLogs={total}
          currentPage={page}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}
