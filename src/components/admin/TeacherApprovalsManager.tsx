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
  FileText,
  Check,
} from "lucide-react";
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
          message: result.error || "Failed to process approval request.",
        });
        return;
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === decisionModal.request.id
            ? { ...r, status: decisionModal.decision === "APPROVE" ? "APPROVED" : "REJECTED" }
            : r
        )
      );

      if (decisionModal.decision === "APPROVE") {
        setFaculty((prev) => [
          ...prev,
          {
            id: decisionModal.request.userId,
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
          className={`p-4 rounded border-2 border-[#171717] text-xs font-bold flex items-center justify-between shadow-brutal-sm ${
            notification.type === "success"
              ? "bg-[#D9FF38] text-[#171717]"
              : "bg-[#FFDAD6] text-[#410002]"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-lg font-black ml-3 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-[#171717] pb-3">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-heading text-xs uppercase font-extrabold rounded border-2 border-[#171717] transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "pending"
              ? "bg-[#F12D2D] text-white shadow-brutal-sm"
              : "bg-white text-[#171717] hover:bg-[#E9E2D5]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Pending Approvals</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-black ${
              activeTab === "pending"
                ? "bg-[#FFE23B] text-[#171717]"
                : "bg-[#E9E2D5] text-[#171717]"
            }`}
          >
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("faculty")}
          className={`px-4 py-2 font-heading text-xs uppercase font-extrabold rounded border-2 border-[#171717] transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "faculty"
              ? "bg-[#1748F5] text-white shadow-brutal-sm"
              : "bg-white text-[#171717] hover:bg-[#E9E2D5]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Authorized Faculty Directory</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-black ${
              activeTab === "faculty"
                ? "bg-[#FFE23B] text-[#171717]"
                : "bg-[#E9E2D5] text-[#171717]"
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
            <div className="bg-white rounded border-2 border-[#171717] p-12 text-center shadow-brutal-md space-y-2">
              <div className="w-12 h-12 rounded bg-[#D9FF38] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
                <CheckCircle2 className="w-6 h-6 text-[#171717]" />
              </div>
              <h3 className="font-display text-lg uppercase font-black text-[#171717]">
                All Faculty Requests Reviewed
              </h3>
              <p className="font-body text-xs text-[#5D3F3C] max-w-sm mx-auto leading-relaxed">
                There are no pending teacher access authorization requests awaiting administrative review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingRequests.map((req) => {
                const isSelf = req.userId === currentAdminId;
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded border-2 border-[#171717] shadow-brutal-md p-5 space-y-4 hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b-2 border-[#171717] pb-3">
                        <div>
                          <span className="font-heading text-xs uppercase text-[#1748F5] font-extrabold tracking-wide block">
                            STAFF ID: {req.staffId}
                          </span>
                          <h4 className="font-display text-lg font-black uppercase text-[#171717] mt-0.5">
                            {req.user.name}
                          </h4>
                          <p className="font-body text-xs text-[#5D3F3C]">
                            {req.user.email}
                          </p>
                        </div>

                        <span className="px-2 py-0.5 bg-[#FFE23B] text-[#171717] border border-[#171717] font-heading text-[10px] uppercase font-black rounded shadow-brutal-sm shrink-0">
                          PENDING
                        </span>
                      </div>

                      <div className="space-y-1 font-body text-xs">
                        <div>
                          <span className="font-heading text-[10px] text-[#5D3F3C] uppercase font-bold block">
                            Designation &amp; Department
                          </span>
                          <span className="font-bold text-[#171717]">
                            {req.designation} • {req.department}
                          </span>
                        </div>

                        <div className="pt-1">
                          <span className="font-heading text-[10px] text-[#5D3F3C] uppercase font-bold block">
                            Proof Document
                          </span>
                          {req.proofUrl ? (
                            <a
                              href={req.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#1748F5] hover:underline font-bold"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Inspect Faculty Proof</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[#5D3F3C] italic">None attached</span>
                          )}
                        </div>
                      </div>

                      {isSelf && (
                        <div className="p-2.5 rounded bg-[#FFF9E9] border border-[#171717] text-[#171717] text-[11px] flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#F12D2D] shrink-0" />
                          <span>Self-Approval Safeguard active. Another administrator must review.</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-[#171717]/10">
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => setDecisionModal({ request: req, decision: "APPROVE" })}
                        className="py-2 px-3 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm hover:shadow-brutal disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>APPROVE</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => setDecisionModal({ request: req, decision: "REJECT" })}
                        className="py-2 px-3 bg-white text-[#F12D2D] border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm hover:bg-[#FFDAD6] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>REJECT</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Authorized Faculty Directory */}
      {activeTab === "faculty" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {faculty.map((fac) => (
              <div
                key={fac.id}
                className="bg-white rounded border-2 border-[#171717] shadow-brutal-md p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2 border-b-2 border-[#171717] pb-2.5">
                    <div>
                      <span className="font-heading text-xs uppercase text-[#1748F5] font-extrabold block">
                        STAFF ID: {fac.staffId || "REC-FAC"}
                      </span>
                      <h4 className="font-display text-lg font-black uppercase text-[#171717] mt-0.5">
                        {fac.name}
                      </h4>
                      <p className="font-body text-xs text-[#5D3F3C]">{fac.email}</p>
                    </div>

                    <span className="px-2 py-0.5 bg-[#D9FF38] text-[#171717] border border-[#171717] font-heading text-[10px] uppercase font-black rounded shadow-brutal-sm">
                      VERIFIED
                    </span>
                  </div>

                  <div className="font-body text-xs text-[#171717]">
                    <span className="font-bold">{fac.designation || "Assistant Professor"}</span>
                    <p className="text-[#5D3F3C] text-[11px]">{fac.department}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#171717]/20">
                  <button
                    type="button"
                    onClick={() => setRevokeModalUser(fac)}
                    className="w-full py-1.5 px-3 bg-white text-[#F12D2D] border-2 border-[#171717] font-heading text-[11px] uppercase font-bold rounded shadow-brutal-sm hover:bg-[#FFDAD6] cursor-pointer"
                  >
                    Revoke Publishing Privileges
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {decisionModal && (
        <div className="fixed inset-0 bg-[#171717]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-xl max-w-lg w-full overflow-hidden space-y-4">
            <div className="bg-[#FFE23B] p-4 border-b-2 border-[#171717] flex items-center justify-between">
              <span className="font-heading text-sm font-black uppercase text-[#171717]">
                Confirm Decision: {decisionModal.decision}
              </span>
              <button
                onClick={() => setDecisionModal(null)}
                className="text-lg font-black cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="font-body text-sm text-[#171717]">
                Are you sure you want to <strong>{decisionModal.decision.toLowerCase()}</strong> the faculty privileges request for{" "}
                <strong className="text-[#1748F5]">{decisionModal.request.user.name}</strong>?
              </p>

              <div>
                <label className="font-heading text-xs uppercase font-extrabold text-[#171717] block mb-1">
                  Optional Review Notes / Justification:
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter audit rationale..."
                  className="w-full p-2.5 border-2 border-[#171717] rounded font-body text-xs shadow-brutal-sm outline-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModal(null)}
                  className="px-4 py-2 bg-white text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDecision}
                  onClick={handleDecisionSubmit}
                  className="px-4 py-2 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingDecision ? "Processing..." : `Confirm ${decisionModal.decision}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revocation Modal */}
      {revokeModalUser && (
        <div className="fixed inset-0 bg-[#171717]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-xl max-w-lg w-full overflow-hidden space-y-4">
            <div className="bg-[#F12D2D] text-white p-4 border-b-2 border-[#171717] flex items-center justify-between">
              <span className="font-heading text-sm font-black uppercase">
                Revoke Faculty Publishing Privileges
              </span>
              <button
                onClick={() => setRevokeModalUser(null)}
                className="text-lg font-black cursor-pointer text-white"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="font-body text-sm text-[#171717]">
                This will immediately remove faculty event-creation permissions for{" "}
                <strong className="text-[#F12D2D]">{revokeModalUser.name}</strong> and demote their role to Student.
              </p>

              <div>
                <label className="font-heading text-xs uppercase font-extrabold text-[#171717] block mb-1">
                  Reason for Revocation:
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Sabbatical, department transfer, or role reassignment"
                  className="w-full p-2.5 border-2 border-[#171717] rounded font-body text-xs shadow-brutal-sm outline-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalUser(null)}
                  className="px-4 py-2 bg-white text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingRevoke}
                  onClick={handleRevokeSubmit}
                  className="px-4 py-2 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingRevoke ? "Revoking..." : "Revoke Privileges"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
