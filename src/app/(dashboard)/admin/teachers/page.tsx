import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { db } from "@/db";
import {
  listTeacherApprovalRequests,
  listFacultyMembers,
  type TeacherApprovalWithUser,
} from "@/lib/admin/service";
import { TeacherApprovalsManager } from "@/components/admin/TeacherApprovalsManager";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Database, ArrowLeft, ShieldCheck } from "lucide-react";
import type { User } from "@/db/schema";

export default async function AdminTeachersPage() {
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
          Faculty verification and authorization controls are restricted exclusively to designated Head of Department and administrators.
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

  // 2. Query Requests and Active Faculty
  let requests: TeacherApprovalWithUser[] = [];
  let faculty: User[] = [];
  let dbError: string | null = null;

  try {
    requests = await listTeacherApprovalRequests(db, auth.user, "PENDING");
    faculty = await listFacultyMembers(db, auth.user);
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
          <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Faculty Access &amp; Credentials Governance
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Review faculty verification requests, grant event publishing roles, and manage active teacher credentials for REC AI &amp; DS.
        </p>
      </div>

      {/* Database Error Fallback */}
      {dbError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <Database className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-sm">PostgreSQL Standby / Connection Offline</p>
            <p className="text-amber-800 leading-relaxed">
              Unable to query faculty applicants ({dbError}). Start local PostgreSQL with <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">docker compose up -d</code> to inspect live applicants.
            </p>
          </div>
        </div>
      )}

      {/* Main Manager Component */}
      {!dbError && (
        <TeacherApprovalsManager
          initialRequests={requests}
          activeFaculty={faculty}
          currentAdminId={auth.user.id}
        />
      )}
    </div>
  );
}
