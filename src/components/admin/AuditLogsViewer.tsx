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
  ShieldCheck,
} from "lucide-react";
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

const actionBadges: Record<string, { label: string; bg: string; text: string }> = {
  USER_REGISTERED: { label: "User Registered", bg: "bg-[#D9FF38]", text: "text-[#171717]" },
  TEACHER_APPROVAL_REQUESTED: { label: "Approval Requested", bg: "bg-[#FFE23B]", text: "text-[#171717]" },
  TEACHER_APPROVED: { label: "Faculty Approved", bg: "bg-[#D9FF38]", text: "text-[#171717]" },
  TEACHER_REJECTED: { label: "Faculty Rejected", bg: "bg-[#F12D2D]", text: "text-white" },
  TEACHER_REVOKED: { label: "Faculty Revoked", bg: "bg-[#F12D2D]", text: "text-white" },
  EVENT_CREATED: { label: "Event Draft Created", bg: "bg-[#E9E2D5]", text: "text-[#171717]" },
  EVENT_UPDATED: { label: "Event Updated", bg: "bg-[#E9E2D5]", text: "text-[#171717]" },
  EVENT_PUBLISHED: { label: "Event Published", bg: "bg-[#1748F5]", text: "text-white" },
  EVENT_CANCELLED: { label: "Event Cancelled", bg: "bg-[#F12D2D]", text: "text-white" },
  ADMIN_BOOTSTRAP: { label: "Admin Bootstrapped", bg: "bg-[#FFE23B]", text: "text-[#171717]" },
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
      log.targetType.toLowerCase().includes(q) ||
      (log.actor?.name && log.actor.name.toLowerCase().includes(q)) ||
      (log.actor?.email && log.actor.email.toLowerCase().includes(q));

    return matchesAction && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="bg-[#E9E2D5] p-4 rounded border-2 border-[#171717] shadow-brutal-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by actor name, email, or target ID..."
            className="w-full bg-white text-[#171717] border-2 border-[#171717] rounded py-2 pl-9 pr-3 font-body text-xs shadow-brutal-sm outline-none focus:shadow-brutal-blue"
          />
          <Search className="w-4 h-4 text-[#171717] absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-white border-2 border-[#171717] rounded py-1.5 px-3 font-heading text-xs uppercase font-bold shadow-brutal-sm outline-none"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {Object.keys(actionBadges).map((act) => (
              <option key={act} value={act}>
                {actionBadges[act].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded border-2 border-[#171717] p-12 text-center shadow-brutal-md space-y-2">
          <div className="w-12 h-12 rounded bg-[#FFE23B] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
            <FileText className="w-6 h-6 text-[#171717]" />
          </div>
          <h4 className="font-display text-lg uppercase font-black text-[#171717]">
            No Matching Governance Audit Logs
          </h4>
          <p className="font-body text-xs text-[#5D3F3C]">
            Try adjusting your search criteria or reset action filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs">
              <thead className="bg-[#E9E2D5] font-heading text-xs uppercase font-extrabold border-b-2 border-[#171717]">
                <tr>
                  <th className="py-3 px-4 border-r border-[#171717]">Action</th>
                  <th className="py-3 px-4 border-r border-[#171717]">Actor</th>
                  <th className="py-3 px-4 border-r border-[#171717]">Target Entity</th>
                  <th className="py-3 px-4 border-r border-[#171717]">Timestamp</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#171717]">
                {filteredLogs.map((log) => {
                  const badge = actionBadges[log.action] || {
                    label: log.action,
                    bg: "bg-[#E9E2D5]",
                    text: "text-[#171717]",
                  };
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#FFF9E9] transition-colors"
                    >
                      <td className="py-3 px-4 border-r border-[#171717]">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded border border-[#171717] font-heading text-[10px] font-black uppercase shadow-brutal-sm ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 border-r border-[#171717]">
                        <div className="font-bold text-[#171717]">
                          {log.actor?.name || "System Automated"}
                        </div>
                        <div className="text-[11px] text-[#5D3F3C]">
                          {log.actor?.email || "internal@rajalakshmi.edu.in"}
                        </div>
                      </td>

                      <td className="py-3 px-4 border-r border-[#171717] font-mono text-[11px]">
                        <span className="font-bold uppercase text-[#171717]">{log.targetType}:</span>{" "}
                        {log.targetId ? log.targetId.slice(0, 12) + "..." : "N/A"}
                      </td>

                      <td className="py-3 px-4 border-r border-[#171717] text-[#5D3F3C] whitespace-nowrap">
                        <div className="font-bold text-[#171717]">
                          {new Date(log.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px]">
                          {new Date(log.createdAt).toLocaleTimeString("en-IN")}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleExpand(log.id)}
                          className="px-2.5 py-1 bg-white text-[#171717] border border-[#171717] rounded font-heading text-[10px] uppercase font-bold shadow-brutal-sm hover:bg-[#E9E2D5] cursor-pointer"
                        >
                          {isExpanded ? "Hide" : "Inspect"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
