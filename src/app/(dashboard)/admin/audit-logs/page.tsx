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
      <div className="max-w-2xl mx-auto my-12 bg-[#FFF9E9] rounded-2xl border-2 border-black p-8 text-center shadow-brutal space-y-4">
        <div className="w-14 h-14 rounded-xl bg-[#F12D2D] border-2 border-black flex items-center justify-center mx-auto text-white shadow-brutal-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black uppercase text-black font-display tracking-tight">
          Department Administrator Access Required
        </h2>
        <p className="text-xs text-neutral-700 font-medium leading-relaxed">
          Access to the immutable governance audit log is restricted exclusively to authorized department administrators.
        </p>
        <div className="pt-2">
          <Link href="/admin/events">
            <Button variant="default" size="sm" className="text-xs font-bold uppercase tracking-wider">
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
      <div className="bg-white rounded-2xl border-2 border-black p-5 sm:p-6 shadow-brutal-sm space-y-2">
        <Link
          href="/admin"
          className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Governance Overview
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFE23B] border-2 border-black shadow-brutal-sm text-black">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-black font-display tracking-tight">
              Governance &amp; Security Audit Trail
            </h1>
            <p className="text-xs text-neutral-600 font-medium">
              Complete, append-only history of departmental registrations, faculty approvals, privilege revocations, and opportunity mutations.
            </p>
          </div>
        </div>
      </div>

      {/* Database Error Fallback */}
      {dbError && (
        <div className="p-5 rounded-2xl bg-[#FFE23B] border-2 border-black text-black text-xs flex items-start gap-3 shadow-brutal-sm">
          <Database className="w-5 h-5 text-black mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-black text-sm uppercase tracking-wide">PostgreSQL Standby / Connection Offline</p>
            <p className="text-neutral-800 leading-relaxed font-medium">
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
