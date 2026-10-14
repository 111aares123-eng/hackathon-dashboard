"use client";

import { useState, useRef } from "react";
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
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

  const lastInvokedButtonRef = useRef<HTMLElement | null>(null);

  const closeDecisionModal = (force = false) => {
    if (!force && reviewNotes.trim().length > 0) {
      const confirmed = window.confirm(
        "You have entered decision notes. Discard unsaved input and close?"
      );
      if (!confirmed) return;
    }
    setDecisionModal(null);
    setReviewNotes("");
    setTimeout(() => {
      lastInvokedButtonRef.current?.focus();
    }, 0);
  };

  const closeRevokeModal = (force = false) => {
    if (!force && revokeReason.trim().length > 0) {
      const confirmed = window.confirm(
        "You have entered a revocation reason. Discard unsaved input and close?"
      );
      if (!confirmed) return;
    }
    setRevokeModalUser(null);
    setRevokeReason("");
    setTimeout(() => {
      lastInvokedButtonRef.current?.focus();
    }, 0);
  };

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

      closeDecisionModal(true);
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

      closeRevokeModal(true);
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
            className="text-[#586B5A] hover:text-[#202820] font-bold ml-3 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DAD7CD] pb-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "pending"
              ? "bg-[#344E41] text-white shadow-xs"
              : "bg-white text-[#202820] hover:bg-[#F5F3EB] border border-[#DAD7CD]"
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#C5D86D]" />
          <span>Pending Approvals</span>
          <span
            className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "pending"
                ? "bg-[#C5D86D] text-[#202820]"
                : "bg-[#F5F3EB] text-[#586B5A]"
            }`}
          >
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("faculty")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "faculty"
              ? "bg-[#344E41] text-white shadow-xs"
              : "bg-white text-[#202820] hover:bg-[#F5F3EB] border border-[#DAD7CD]"
          }`}
        >
          <Users className="w-4 h-4 text-[#A3B18A]" />
          <span>Authorized Faculty Directory</span>
          <span
            className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "faculty"
                ? "bg-[#C5D86D] text-[#202820]"
                : "bg-[#F5F3EB] text-[#586B5A]"
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
            <div className="bg-white rounded-xl border border-[#DAD7CD] p-12 text-center shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#F5F3EB] border border-[#DAD7CD] flex items-center justify-center mx-auto text-[#344E41]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#202820]">All Faculty Requests Reviewed</h3>
              <p className="text-xs text-[#586B5A] max-w-sm mx-auto leading-relaxed">
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
                    className="bg-white rounded-xl border border-[#DAD7CD] shadow-xs p-5 space-y-4 transition-all hover:border-[#344E41]/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DAD7CD]/50 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#202820] tracking-tight flex items-center gap-2">
                          <span>{req.user.name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-[#F5F3EB] text-[#344E41] font-semibold border border-[#DAD7CD]">
                            Staff ID: {req.staffId}
                          </span>
                        </h4>
                        <p className="text-xs text-[#586B5A] mt-0.5">
                          {req.user.email} • {req.department}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#F5F3EB] text-[#344E41] border border-[#DAD7CD] flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#344E41] animate-pulse" />
                          Pending Decision
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[#586B5A] block font-semibold text-[11px] uppercase tracking-wider font-mono">Designation</span>
                        <span className="text-[#202820] font-bold">{req.designation}</span>
                      </div>
                      <div>
                        <span className="text-[#586B5A] block font-semibold text-[11px] uppercase tracking-wider font-mono">Submitted Date</span>
                        <span className="text-[#202820] font-medium">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#586B5A] block font-semibold text-[11px] uppercase tracking-wider font-mono">Proof Documentation</span>
                        {req.proofUrl ? (
                          <a
                            href={req.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#344E41] hover:underline font-bold"
                          >
                            <span>Inspect Faculty Proof</span>
                            <ExternalLink className="w-3 h-3 text-[#C5D86D]" />
                          </a>
                        ) : (
                          <span className="text-[#586B5A] italic font-medium">None attached</span>
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
                        onClick={(e) => {
                          lastInvokedButtonRef.current = e.currentTarget;
                          setDecisionModal({ request: req, decision: "REJECT" });
                        }}
                        className="text-xs h-8 text-rose-700 border-rose-200 hover:bg-rose-50 font-semibold gap-1.5 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Request
                      </Button>

                      <Button
                        size="sm"
                        disabled={isSelf}
                        onClick={(e) => {
                          lastInvokedButtonRef.current = e.currentTarget;
                          setDecisionModal({ request: req, decision: "APPROVE" });
                        }}
                        className="text-xs h-8 bg-[#344E41] hover:bg-[#25392F] text-white font-semibold gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-[#344E41] focus-visible:ring-offset-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C5D86D]" />
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
        <div className="bg-white rounded-xl border border-[#DAD7CD] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DAD7CD] bg-[#F5F3EB] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#202820] tracking-wide uppercase font-mono">
              Authorized Department Faculty &amp; Coordinators ({faculty.length})
            </h3>
            <span className="text-[11px] text-[#586B5A] font-medium font-mono">
              [GOVERNANCE // FACULTY ARCHIVE]
            </span>
          </div>

          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F3EB] text-[#344E41] font-bold border-b border-[#DAD7CD] text-[11px] uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Department / Designation</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DAD7CD]/50">
                {faculty.map((f) => {
                  const isCurrentAdmin = f.id === currentAdminId;
                  return (
                    <tr key={f.id} className="hover:bg-[#F5F3EB]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#202820] block">{f.name}</span>
                        <span className="text-[#586B5A] text-[11px]">{f.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#344E41] font-semibold">
                        {f.staffId || "N/A"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[#202820] font-semibold block">
                          {f.designation || "Faculty Coordinator"}
                        </span>
                        <span className="text-[#586B5A] text-[11px]">{f.department}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
                            f.role === "ADMIN"
                              ? "bg-[#C5D86D]/30 text-[#243314] border-[#C5D86D]/60"
                              : "bg-[#A3B18A]/25 text-[#2B4035] border-[#A3B18A]/50"
                          }`}
                        >
                          {f.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isCurrentAdmin ? (
                          <span className="text-[11px] text-[#586B5A] italic font-medium font-mono">
                            (Current User)
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              lastInvokedButtonRef.current = e.currentTarget;
                              setRevokeModalUser(f);
                              setRevokeReason("");
                            }}
                            className="text-[11px] h-8 text-rose-700 border-rose-200 hover:bg-rose-50 font-semibold gap-1 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 cursor-pointer"
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
      <Dialog
        open={!!decisionModal}
        onOpenChange={(open, details) => {
          if (!open) {
            if (details.reason === "outside-press") {
              // Prevent silent dismiss on backdrop click
              return;
            }
            closeDecisionModal(false);
          }
        }}
        disablePointerDismissal={true}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogPopup aria-describedby="decision-modal-description">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  decisionModal?.decision === "APPROVE"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-rose-50 text-rose-600 border border-rose-200"
                }`}
              >
                {decisionModal?.decision === "APPROVE" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <DialogTitle>
                  {decisionModal?.decision === "APPROVE"
                    ? "Confirm Faculty Authorization"
                    : "Reject Faculty Request"}
                </DialogTitle>
                <DialogDescription id="decision-modal-description">
                  Applicant: <strong>{decisionModal?.request.user.name}</strong> ({decisionModal?.request.user.email})
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <label htmlFor="decision-review-notes" className="block text-xs font-semibold text-[#202820] font-mono">
                Decision Notes / Justification (Optional)
              </label>
              <textarea
                id="decision-review-notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  decisionModal?.decision === "APPROVE"
                    ? "e.g. Verified with Department Staff Directory"
                    : "e.g. Staff ID could not be verified; please resubmit with departmental proof"
                }
                rows={3}
                className="w-full text-xs rounded-md border border-[#DAD7CD] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#344E41] text-[#202820] bg-[#F5F3EB]/50"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmittingDecision}
                onClick={() => closeDecisionModal(false)}
                className="text-xs font-semibold h-8 px-3.5 border-[#DAD7CD] text-[#586B5A] hover:bg-[#F5F3EB] focus-visible:ring-2 focus-visible:ring-[#344E41] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSubmittingDecision}
                onClick={handleDecisionSubmit}
                className={`text-xs font-semibold gap-1.5 text-white h-8 px-3.5 focus-visible:ring-2 cursor-pointer ${
                  decisionModal?.decision === "APPROVE"
                    ? "bg-[#344E41] hover:bg-[#25392F] focus-visible:ring-[#344E41]"
                    : "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600"
                }`}
              >
                {isSubmittingDecision && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {decisionModal?.decision === "APPROVE" ? "Grant Faculty Role" : "Confirm Rejection"}
              </Button>
            </div>
          </DialogPopup>
        </DialogPortal>
      </Dialog>

      {/* Revocation Confirmation Modal */}
      <Dialog
        open={!!revokeModalUser}
        onOpenChange={(open, details) => {
          if (!open) {
            if (details.reason === "outside-press") {
              // Prevent silent dismiss on backdrop click
              return;
            }
            closeRevokeModal(false);
          }
        }}
        disablePointerDismissal={true}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogPopup aria-describedby="revoke-modal-description">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle>
                  Revoke Publishing Privileges
                </DialogTitle>
                <DialogDescription id="revoke-modal-description">
                  Revoking privileges from <strong>{revokeModalUser?.name}</strong> will demote their account back to a Student role and disable event publishing.
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <label htmlFor="revoke-reason-input" className="block text-xs font-semibold text-[#202820] font-mono">
                Reason for Revocation (Optional)
              </label>
              <textarea
                id="revoke-reason-input"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. End of tenure as departmental event coordinator"
                rows={3}
                className="w-full text-xs rounded-md border border-[#DAD7CD] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#344E41] text-[#202820] bg-[#F5F3EB]/50"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmittingRevoke}
                onClick={() => closeRevokeModal(false)}
                className="text-xs font-semibold h-8 px-3.5 border-[#DAD7CD] text-[#586B5A] hover:bg-[#F5F3EB] focus-visible:ring-2 focus-visible:ring-[#344E41] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSubmittingRevoke}
                onClick={handleRevokeSubmit}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-xs h-8 px-3.5 focus-visible:ring-2 focus-visible:ring-rose-600 cursor-pointer"
              >
                {isSubmittingRevoke && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Revocation
              </Button>
            </div>
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
