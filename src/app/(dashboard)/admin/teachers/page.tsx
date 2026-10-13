import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { db } from "@/db";
import {
  listTeacherApprovalRequests,
  listFacultyMembers,
  type TeacherApprovalWithUser,
} from "@/lib/admin/service";
import { TeacherApprovalsManager } from "@/components/admin/TeacherApprovalsManager";
import { ShieldAlert, Database, ArrowLeft, ShieldCheck, UserCheck } from "lucide-react";
import type { User } from "@/db/schema";

export default async function AdminTeachersPage() {
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
          Faculty verification and authorization controls are restricted exclusively to designated Head of Department and administrators.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal hover:bg-[#E9E2D5]"
          >
            Return to Events Dashboard
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded border-2 border-[#171717] p-6 shadow-brutal-lg space-y-2">
        <Link
          href="/admin"
          className="font-heading text-xs uppercase font-extrabold text-[#5D3F3C] hover:text-[#171717] inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Governance Overview</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#FFE23B] border-2 border-[#171717] flex items-center justify-center shadow-brutal-sm">
            <UserCheck className="w-4 h-4 text-[#171717]" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171717]">
            Faculty Access &amp; Credentials Governance
          </h1>
        </div>
        <p className="font-body text-xs text-[#5D3F3C]">
          Review faculty verification requests, grant event publishing roles, and manage active teacher credentials for REC AI &amp; DS.
        </p>
      </div>

      {/* Database Error Fallback */}
      {dbError && (
        <div className="p-4 rounded bg-[#FFDAD6] border-2 border-[#171717] text-[#410002] text-xs flex items-start gap-3 shadow-brutal-sm">
          <Database className="w-5 h-5 text-[#F12D2D] shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-black text-sm uppercase">Database Standby</p>
            <p className="font-body text-xs mt-0.5">{dbError}</p>
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
