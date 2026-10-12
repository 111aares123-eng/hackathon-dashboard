"use client";

import { useState } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TeacherApprovalWithUser } from "@/lib/admin/service";
import type { User } from "@/db/schema";
import {
  processTeacherApprovalAction,
  revokeTeacherAction,
} from "@/lib/admin/actions";

interface TeacherApprovalsManagerProps {
  initialRequests: TeacherApprovalWithUser[];
  activeFaculty: User[];
  currentAdminId: string;
}

export function TeacherApprovalsManager({
  initialRequests,
  activeFaculty,
  currentAdminId,
}: TeacherApprovalsManagerProps) {
  const [requests, setRequests] = useState<TeacherApprovalWithUser[]>(initialRequests);
  const [faculty, setFaculty] = useState<User[]>(activeFaculty);
  const [activeTab, setActiveTab] = useState<"pending" | "faculty">("pending");

  // Approval Decision Modal State
  const [decisionModal, setDecisionModal] = useState<{
    request: TeacherApprovalWithUser;
    decision: "APPROVE" | "REJECT";
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Revocation Modal State
  const [revokeModalUser, setRevokeModalUser] = useState<User | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState(false);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  const handleDecisionSubmit = async () => {
    if (!decisionModal) return;

    setIsSubmittingDecision(true);
    setNotification(null);

    try {
      const result = await processTeacherApprovalAction({
        requestId: decisionModal.request.id,
        decision: decisionModal.decision,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      if (!result.success) {
        setNotification({
          type: "error",
          message: result.error || "Failed to process decision.",
        });
        return;
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === decisionModal.request.id
            ? {
                ...r,
                status: decisionModal.decision === "APPROVE" ? "APPROVED" : "REJECTED",
                reviewedAt: new Date(),
                reviewNotes: reviewNotes.trim() || null,
              }
            : r
        )
      );

      if (decisionModal.decision === "APPROVE") {
        setFaculty((prev) => [
          ...prev,
          {
            id: decisionModal.request.user.id,
            name: decisionModal.request.user.name,
            email: decisionModal.request.user.email,
            role: "TEACHER",
            isApprovedTeacher: true,
            department: decisionModal.request.department,
            staffId: decisionModal.request.staffId,
            designation: decisionModal.request.designation,
            registerNumber: decisionModal.request.user.registerNumber,
            passwordHash: null,
            emailVerified: null,
            image: null,
            phoneNumber: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }

      setNotification({
        type: "success",
        message: `Faculty authorization request for "${decisionModal.request.user.name}" has been ${
          decisionModal.decision === "APPROVE" ? "approved" : "rejected"
        }.`,
      });

      setDecisionModal(null);
      setReviewNotes("");
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Error submitting decision.",
      });
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleRevokeSubmit = async () => {
    if (!revokeModalUser) return;

    setIsSubmittingRevoke(true);
    setNotification(null);

    try {
      const result = await revokeTeacherAction({
        targetUserId: revokeModalUser.id,
        reason: revokeReason.trim() || undefined,
      });

      if (!result.success) {
        setNotification({
          type: "error",
          message: result.error || "Failed to revoke faculty privileges.",
        });
        return;
      }

      setFaculty((prev) => prev.filter((f) => f.id !== revokeModalUser.id));

      setNotification({
        type: "success",
        message: `Publishing privileges revoked for "${revokeModalUser.name}". Account demoted to Student.`,
      });

      setRevokeModalUser(null);
      setRevokeReason("");
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Error revoking privileges.",
      });
    } finally {
      setIsSubmittingRevoke(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-3 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "pending"
              ? "bg-[#003366] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Pending Approvals</span>
          <span
            className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === "pending"
                ? "bg-[#C5A059] text-slate-900"
                : "bg-slate-100 text-slate-600 font-semibold"
            }`}
          >
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("faculty")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "faculty"
              ? "bg-[#003366] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Authorized Faculty Directory</span>
          <span
            className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === "faculty"
                ? "bg-[#C5A059] text-slate-900"
                : "bg-slate-100 text-slate-600 font-semibold"
            }`}
          >
            {faculty.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Pending Requests */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">All Faculty Requests Reviewed</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                There are no pending teacher access authorization requests awaiting administrative review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((req) => {
                const isSelf = req.userId === currentAdminId;
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 transition-all hover:border-[#003366]/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                          <span>{req.user.name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            Staff ID: {req.staffId}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.user.email} • {req.department}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending Decision
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">Designation</span>
                        <span className="text-slate-800 font-bold">{req.designation}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">Submitted Date</span>
                        <span className="text-slate-800 font-medium">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">Proof Documentation</span>
                        {req.proofUrl ? (
                          <a
                            href={req.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#003366] hover:underline font-bold"
                          >
                            <span>Inspect Faculty Proof</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic font-medium">None attached</span>
                        )}
                      </div>
                    </div>

                    {/* Self-approval Warning if logged-in admin submitted request */}
                    {isSelf && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Self-Approval Safeguard:</strong> You cannot authorize your own faculty application. Another department administrator must review this request.
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSelf}
                        onClick={() =>
                          setDecisionModal({ request: req, decision: "REJECT" })
                        }
                        className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50 font-semibold gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Request
                      </Button>

                      <Button
                        size="sm"
                        disabled={isSelf}
                        onClick={() =>
                          setDecisionModal({ request: req, decision: "APPROVE" })
                        }
                        className="text-xs bg-[#003366] hover:bg-[#002244] text-white font-semibold gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Faculty Status
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Active Faculty Directory */}
      {activeTab === "faculty" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Authorized Department Faculty &amp; Coordinators ({faculty.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Only authorized faculty may publish departmental opportunities
            </span>
          </div>

          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Department / Designation</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {faculty.map((f) => {
                  const isCurrentAdmin = f.id === currentAdminId;
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{f.name}</span>
                        <span className="text-slate-500 text-[11px]">{f.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                        {f.staffId || "N/A"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-semibold block">
                          {f.designation || "Faculty Coordinator"}
                        </span>
                        <span className="text-slate-500 text-[11px]">{f.department}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            f.role === "ADMIN"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : "bg-sky-100 text-sky-900 border-sky-300"
                          }`}
                        >
                          {f.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isCurrentAdmin ? (
                          <span className="text-[11px] text-slate-400 italic font-medium">
                            (Current User)
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRevokeModalUser(f);
                              setRevokeReason("");
                            }}
                            className="text-[11px] h-7 text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold gap-1"
                          >
                            <UserX className="w-3 h-3" />
                            Revoke Access
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decision Confirmation Modal (Approve or Reject) */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" data-lenis-prevent>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  decisionModal.decision === "APPROVE"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-rose-50 text-rose-600 border border-rose-200"
                }`}
              >
                {decisionModal.decision === "APPROVE" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {decisionModal.decision === "APPROVE"
                    ? "Confirm Faculty Authorization"
                    : "Reject Faculty Request"}
                </h3>
                <p className="text-xs text-slate-500">
                  Applicant: <strong>{decisionModal.request.user.name}</strong> ({decisionModal.request.user.email})
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Decision Notes / Justification (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  decisionModal.decision === "APPROVE"
                    ? "e.g. Verified with Department Staff Directory"
                    : "e.g. Staff ID could not be verified; please resubmit with departmental proof"
                }
                rows={3}
                className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#003366] text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmittingDecision}
                onClick={() => setDecisionModal(null)}
                className="text-xs font-semibold"
              >
                Dismiss
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSubmittingDecision}
                onClick={handleDecisionSubmit}
                className={`text-xs font-semibold gap-1.5 text-white ${
                  decisionModal.decision === "APPROVE"
                    ? "bg-[#003366] hover:bg-[#002244]"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isSubmittingDecision && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {decisionModal.decision === "APPROVE" ? "Grant Faculty Role" : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Revocation Confirmation Modal */}
      {revokeModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" data-lenis-prevent>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Revoke Publishing Privileges
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Revoking privileges from <strong>{revokeModalUser.name}</strong> will demote their account back to a Student role and disable event publishing.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Reason for Revocation (Optional)
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. End of tenure as departmental event coordinator"
                rows={3}
                className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#003366] text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmittingRevoke}
                onClick={() => setRevokeModalUser(null)}
                className="text-xs font-semibold"
              >
                Dismiss
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSubmittingRevoke}
                onClick={handleRevokeSubmit}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                {isSubmittingRevoke && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Revocation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
