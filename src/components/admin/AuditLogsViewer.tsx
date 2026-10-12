"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AuditLog } from "@/db/schema";

interface AuditLogWithActor extends AuditLog {
  actor?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

interface AuditLogsViewerProps {
  initialLogs: AuditLogWithActor[];
  totalLogs: number;
  currentPage: number;
  totalPages: number;
}

const actionBadges: Record<string, { label: string; bg: string; text: string; border: string }> = {
  USER_REGISTERED: { label: "User Registered", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  TEACHER_APPROVAL_REQUESTED: { label: "Approval Requested", bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  TEACHER_APPROVED: { label: "Faculty Approved", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  TEACHER_REJECTED: { label: "Faculty Rejected", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  TEACHER_REVOKED: { label: "Faculty Revoked", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  EVENT_CREATED: { label: "Event Draft Created", bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
  EVENT_UPDATED: { label: "Event Updated", bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
  EVENT_PUBLISHED: { label: "Event Published", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  EVENT_CANCELLED: { label: "Event Cancelled", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  ADMIN_BOOTSTRAP: { label: "Admin Bootstrapped", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
};

export function AuditLogsViewer({
  initialLogs,
  totalLogs,
  currentPage,
  totalPages,
}: AuditLogsViewerProps) {
  const [logs] = useState<AuditLogWithActor[]>(initialLogs);
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === "ALL" || log.action === selectedAction;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      log.targetId.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.actor?.name && log.actor.name.toLowerCase().includes(q)) ||
      (log.actor?.email && log.actor.email.toLowerCase().includes(q));

    return matchesAction && matchesSearch;
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-5">
      {/* Search and Action Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, email, action or resource ID..."
            className="pl-9 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#003366]"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="USER_REGISTERED">User Registrations</option>
            <option value="TEACHER_APPROVAL_REQUESTED">Approval Requests</option>
            <option value="TEACHER_APPROVED">Faculty Approvals</option>
            <option value="TEACHER_REJECTED">Faculty Rejections</option>
            <option value="TEACHER_REVOKED">Faculty Revocations</option>
            <option value="EVENT_CREATED">Event Drafts</option>
            <option value="EVENT_PUBLISHED">Event Publications</option>
            <option value="EVENT_CANCELLED">Event Cancellations</option>
            <option value="ADMIN_BOOTSTRAP">Admin Bootstrap</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#003366]" />
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Immutable Governance Audit Trail ({totalLogs} Total Records)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Append-only • Security Hardened
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-1">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">No audit events match current criteria</p>
            <p className="text-slate-400">Audit events will populate automatically as users and faculty perform actions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Metadata Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => {
                  const badge = actionBadges[log.action] || {
                    label: log.action,
                    bg: "bg-slate-100",
                    text: "text-slate-800",
                    border: "border-slate-200",
                  };
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-sans font-medium">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border font-sans ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {log.actor ? (
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {log.actor.name}
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              {log.actor.email} • {log.actor.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">System / Unauthenticated</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="font-bold text-slate-800 block text-[11px]">
                          {log.targetType}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 block truncate max-w-[140px]" title={log.targetId}>
                          {log.targetId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {log.metadata ? (
                          <div className="space-y-1">
                            <button
                              onClick={() =>
                                setExpandedLogId(isExpanded ? null : log.id)
                              }
                              className="text-[11px] text-[#003366] hover:underline flex items-center gap-1 font-bold"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{isExpanded ? "Collapse" : "Inspect Payload"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                            {isExpanded && (
                              <pre
                                className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[10px] overflow-x-auto max-w-sm font-mono mt-1 border border-slate-800 shadow-xs"
                                data-lenis-prevent
                              >
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-sans font-medium">
          <span>
            Displaying <strong>{filteredLogs.length}</strong> of {totalLogs} logged events • Page {currentPage} of {totalPages}
          </span>
          <span className="text-slate-600">
            REC AI &amp; DS Department Governance
          </span>
        </div>
      </div>
    </div>
  );
}
