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
  USER_REGISTERED: { label: "User Registered", bg: "bg-[#F5F3EB]", text: "text-[#202820]", border: "border-[#DAD7CD]" },
  TEACHER_APPROVAL_REQUESTED: { label: "Approval Requested", bg: "bg-[#F5F3EB]", text: "text-[#344E41]", border: "border-[#A3B18A]/50" },
  TEACHER_APPROVED: { label: "Faculty Approved", bg: "bg-[#A3B18A]/25", text: "text-[#2B4035]", border: "border-[#A3B18A]/60" },
  TEACHER_REJECTED: { label: "Faculty Rejected", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  TEACHER_REVOKED: { label: "Faculty Revoked", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  EVENT_CREATED: { label: "Event Draft Created", bg: "bg-[#F5F3EB]", text: "text-[#586B5A]", border: "border-[#DAD7CD]" },
  EVENT_UPDATED: { label: "Event Updated", bg: "bg-[#F5F3EB]", text: "text-[#586B5A]", border: "border-[#DAD7CD]" },
  EVENT_PUBLISHED: { label: "Event Published", bg: "bg-[#344E41]/10", text: "text-[#25392F]", border: "border-[#344E41]/30" },
  EVENT_CANCELLED: { label: "Event Cancelled", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  ADMIN_BOOTSTRAP: { label: "Admin Bootstrapped", bg: "bg-[#C5D86D]/25", text: "text-[#243314]", border: "border-[#C5D86D]/60" },
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
      <div className="bg-white p-4 rounded-xl border border-[#DAD7CD] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#586B5A] absolute left-3.5 top-3" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, email, action or resource ID..."
            className="pl-9 text-xs sm:text-sm bg-[#F5F3EB]/60 border-[#DAD7CD] focus:bg-white focus:ring-2 focus:ring-[#344E41]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#586B5A] shrink-0" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="text-xs bg-[#F5F3EB] border border-[#DAD7CD] rounded-md px-3 py-2 text-[#202820] font-semibold focus:outline-none focus:ring-1 focus:ring-[#344E41]"
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
      <div className="bg-white rounded-xl border border-[#DAD7CD] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DAD7CD] bg-[#F5F3EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#344E41]" />
            <h3 className="text-xs font-bold text-[#202820] tracking-wide uppercase font-mono">
              Immutable Governance Audit Trail ({totalLogs} Total Records)
            </h3>
          </div>
          <span className="text-[11px] text-[#586B5A] font-medium font-mono">
            [SECURITY // HARDENED COMPLIANCE]
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#586B5A] space-y-1">
            <Clock className="w-8 h-8 text-[#DAD7CD] mx-auto mb-2" />
            <p className="font-bold text-[#202820] text-sm">No audit events match current criteria</p>
            <p className="text-[#586B5A]">Audit events will populate automatically as users and faculty perform actions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F3EB] text-[#344E41] font-bold border-b border-[#DAD7CD] text-[11px] uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Metadata Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DAD7CD]/50 font-mono text-[11px]">
                {filteredLogs.map((log) => {
                  const badge = actionBadges[log.action] || {
                    label: log.action,
                    bg: "bg-[#F5F3EB]",
                    text: "text-[#202820]",
                    border: "border-[#DAD7CD]",
                  };
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <tr key={log.id} className="hover:bg-[#F5F3EB]/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#586B5A] font-sans font-medium">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {log.actor ? (
                          <div>
                            <span className="font-bold text-[#202820] block">
                              {log.actor.name}
                            </span>
                            <span className="text-[#586B5A] text-[10px]">
                              {log.actor.email} • {log.actor.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#586B5A] italic">System / Unauthenticated</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="font-bold text-[#202820] block text-[11px] font-mono">
                          {log.targetType}
                        </span>
                        <span className="font-mono text-[10px] text-[#586B5A] block truncate max-w-[140px]" title={log.targetId}>
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
                              className="text-[11px] text-[#344E41] hover:underline flex items-center gap-1 font-bold cursor-pointer font-mono"
                            >
                              <Eye className="w-3 h-3 text-[#C5D86D]" />
                              <span>{isExpanded ? "Collapse" : "Inspect Payload"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                            {isExpanded && (
                              <pre
                                className="bg-[#202820] text-[#F5F3EB] p-2.5 rounded-lg text-[10px] overflow-x-auto max-w-sm font-mono mt-1 border border-[#344E41] shadow-xs"
                                data-lenis-prevent
                              >
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#586B5A] italic">None</span>
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
        <div className="bg-[#F5F3EB] px-4 py-2.5 border-t border-[#DAD7CD] flex items-center justify-between text-xs text-[#586B5A] font-mono font-medium">
          <span>
            Displaying <strong className="text-[#202820]">{filteredLogs.length}</strong> of {totalLogs} logged events • Page {currentPage} of {totalPages}
          </span>
          <span className="text-[#344E41]">
            [AUDIT // AI &amp; DS GOVERNANCE]
          </span>
        </div>
      </div>
    </div>
  );
}
