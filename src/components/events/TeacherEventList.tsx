"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Edit2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  AlertTriangle,
  PlusCircle,
  Loader2,
  MapPin,
  Zap,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CategoryBadge } from "./CategoryBadge";
import type { Event } from "@/db/schema";
import { eventCategories, eventStatuses } from "@/validators/event";
import { publishEventAction, cancelEventAction } from "@/lib/events/actions";

interface TeacherEventListProps {
  initialEvents: Event[];
  initialTotal: number;
  currentPage: number;
  totalPages: number;
  currentUserId?: string;
  userRole?: string;
}

export function TeacherEventList({
  initialEvents,
  initialTotal,
  currentPage,
  totalPages,
  currentUserId,
  userRole,
}: TeacherEventListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [cancelModalEvent, setCancelModalEvent] = useState<Event | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState<string | null>(null);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDeadline = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const isPast = d < now;
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      formatted: d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      isPast,
      diffDays,
    };
  };

  const filteredEvents = events.filter((ev) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      ev.title.toLowerCase().includes(q) ||
      ev.organizer.toLowerCase().includes(q) ||
      ev.summary.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === "ALL" || ev.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || ev.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handlePublish = async (eventId: string) => {
    setActionLoadingId(eventId);
    setActionMessage(null);

    try {
      const result = await publishEventAction(eventId);
      if (!result.success) {
        setActionMessage({ type: "error", text: result.error || "Failed to publish event." });
        return;
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, status: "PUBLISHED" as const, publishedAt: new Date() }
            : e
        )
      );

      setActionMessage({
        type: "success",
        text: `Opportunity published successfully to Student Hub!`,
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error publishing opportunity.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalEvent) return;

    if (!cancelReasonInput.trim()) {
      setCancelReasonError("Please provide an administrative cancellation reason.");
      return;
    }

    setActionLoadingId(cancelModalEvent.id);
    setCancelReasonError(null);

    try {
      const result = await cancelEventAction(
        cancelModalEvent.id,
        cancelReasonInput.trim()
      );

      if (!result.success) {
        setActionMessage({ type: "error", text: result.error || "Failed to cancel event." });
        setCancelModalEvent(null);
        return;
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === cancelModalEvent.id ? { ...e, status: "CANCELLED" as const } : e
        )
      );

      setActionMessage({
        type: "success",
        text: `Event "${cancelModalEvent.title}" has been marked as cancelled.`,
      });

      setCancelModalEvent(null);
      setCancelReasonInput("");
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error cancelling event.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded border-2 border-[#171717] text-xs font-bold flex items-center justify-between shadow-brutal-sm ${
            actionMessage.type === "success"
              ? "bg-[#D9FF38] text-[#171717]"
              : "bg-[#FFDAD6] text-[#410002]"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-lg font-black ml-3 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Retro Filters Bar */}
      <div className="bg-[#E9E2D5] p-4 rounded border-2 border-[#171717] shadow-brutal-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities by title, organizer, or venue..."
            className="w-full bg-white text-[#171717] border-2 border-[#171717] rounded py-2 pl-9 pr-3 font-body text-xs shadow-brutal-sm outline-none focus:shadow-brutal-blue"
          />
          <Search className="w-4 h-4 text-[#171717] absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border-2 border-[#171717] rounded py-1.5 px-3 font-heading text-xs uppercase font-bold shadow-brutal-sm outline-none"
          >
            <option value="ALL">All Categories</option>
            {eventCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border-2 border-[#171717] rounded py-1.5 px-3 font-heading text-xs uppercase font-bold shadow-brutal-sm outline-none"
          >
            <option value="ALL">All Statuses</option>
            {eventStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table / Responsive View */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded border-2 border-[#171717] p-12 text-center shadow-brutal-md space-y-3">
          <div className="w-12 h-12 rounded bg-[#FFE23B] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
            <Calendar className="w-6 h-6 text-[#171717]" />
          </div>
          <h4 className="font-display text-lg uppercase font-black text-[#171717]">
            No Departmental Opportunities Found
          </h4>
          <p className="font-body text-xs text-[#5D3F3C] max-w-sm mx-auto">
            {events.length === 0
              ? "You haven't created any events yet. Publish an upcoming hackathon, workshop, or seminar to get started."
              : "No events matched your current search filters. Try clearing your filters."}
          </p>
          {events.length === 0 && (
            <div className="pt-2">
              <Link
                href="/admin/events/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md"
              >
                <PlusCircle className="w-4 h-4 text-[#FFE23B]" />
                <span>Publish First Opportunity</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs">
              <thead className="bg-[#E9E2D5] font-heading text-xs uppercase font-extrabold border-b-2 border-[#171717]">
                <tr>
                  <th className="py-3 px-4 border-r border-[#171717]">Opportunity</th>
                  <th className="py-3 px-4 border-r border-[#171717]">Track &amp; Mode</th>
                  <th className="py-3 px-4 border-r border-[#171717]">Status</th>
                  <th className="py-3 px-4 border-r border-[#171717]">Schedule</th>
                  <th className="py-3 px-4 border-r border-[#171717]">Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#171717]">
                {filteredEvents.map((ev) => {
                  const deadlineInfo = formatDeadline(ev.registrationDeadline);
                  const isAuthor = currentUserId ? ev.authorId === currentUserId : true;
                  const canManage = userRole === "ADMIN" || isAuthor;

                  return (
                    <tr key={ev.id} className="hover:bg-[#FFF9E9] transition-colors">
                      {/* Title & Organizer */}
                      <td className="py-3 px-4 border-r border-[#171717]">
                        <div className="font-heading font-extrabold text-[#171717] text-sm max-w-xs truncate uppercase">
                          {ev.title}
                        </div>
                        <div className="text-[#5D3F3C] text-[11px] mt-0.5 truncate max-w-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#1748F5] shrink-0" />
                          <span>{ev.organizer} • {ev.venue}</span>
                        </div>
                      </td>

                      {/* Category & Mode */}
                      <td className="py-3 px-4 border-r border-[#171717] whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <CategoryBadge category={ev.category} />
                          <span className="text-[10px] font-heading font-bold uppercase text-[#5D3F3C]">
                            {ev.mode}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 border-r border-[#171717] whitespace-nowrap">
                        <StatusBadge status={ev.status} />
                      </td>

                      {/* Event Dates */}
                      <td className="py-3 px-4 border-r border-[#171717] whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-[#171717]">
                          <Calendar className="w-3.5 h-3.5 text-[#1748F5]" />
                          <span>{formatDate(ev.startDate)}</span>
                        </div>
                        <div className="text-[11px] text-[#5D3F3C]">to {formatDate(ev.endDate)}</div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-4 border-r border-[#171717] whitespace-nowrap">
                        <div className="font-bold text-[#171717]">
                          {deadlineInfo.formatted}
                        </div>
                        {deadlineInfo.isPast ? (
                          <span className="text-[10px] text-[#F12D2D] font-black uppercase block">
                            Closed
                          </span>
                        ) : deadlineInfo.diffDays <= 3 ? (
                          <span className="text-[10px] text-[#F12D2D] font-black uppercase block">
                            {deadlineInfo.diffDays === 0 ? "Closes today!" : `${deadlineInfo.diffDays}d left`}
                          </span>
                        ) : null}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ev.status === "DRAFT" && canManage && (
                            <button
                              type="button"
                              disabled={actionLoadingId === ev.id}
                              onClick={() => handlePublish(ev.id)}
                              className="px-2.5 py-1 bg-[#D9FF38] text-[#171717] border border-[#171717] font-heading text-[11px] uppercase font-black rounded shadow-brutal-sm hover:shadow-brutal cursor-pointer disabled:opacity-50"
                            >
                              Publish
                            </button>
                          )}

                          {canManage && ev.status !== "CANCELLED" && (
                            <Link
                              href={`/admin/events/${ev.id}/edit`}
                              className="px-2.5 py-1 bg-white text-[#171717] border border-[#171717] font-heading text-[11px] uppercase font-bold rounded shadow-brutal-sm hover:bg-[#E9E2D5]"
                            >
                              Edit
                            </Link>
                          )}

                          {canManage && ev.status !== "CANCELLED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalEvent(ev);
                                setCancelReasonInput("");
                                setCancelReasonError(null);
                              }}
                              className="px-2.5 py-1 bg-white text-[#F12D2D] border border-[#171717] font-heading text-[11px] uppercase font-bold rounded shadow-brutal-sm hover:bg-[#FFDAD6] cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}

                          <Link
                            href={`/events/${ev.slug}`}
                            className="p-1 text-[#1748F5] hover:text-[#171717]"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalEvent && (
        <div className="fixed inset-0 bg-[#171717]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-xl max-w-lg w-full overflow-hidden space-y-4">
            <div className="bg-[#F12D2D] text-white p-4 border-b-2 border-[#171717] flex items-center justify-between">
              <span className="font-heading text-sm font-black uppercase">
                Cancel Department Opportunity
              </span>
              <button
                onClick={() => setCancelModalEvent(null)}
                className="text-lg font-black cursor-pointer text-white"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="font-body text-sm text-[#171717]">
                Are you sure you want to cancel{" "}
                <strong className="text-[#F12D2D]">&quot;{cancelModalEvent.title}&quot;</strong>? This will display an official cancellation notice to all scholars.
              </p>

              <div>
                <label className="font-heading text-xs uppercase font-extrabold text-[#171717] block mb-1">
                  Reason for Cancellation:
                </label>
                <textarea
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="e.g. Rescheduled due to Anna University examinations..."
                  className="w-full p-2.5 border-2 border-[#171717] rounded font-body text-xs shadow-brutal-sm outline-none"
                  rows={3}
                />
                {cancelReasonError && (
                  <p className="text-xs text-[#F12D2D] font-bold mt-1">{cancelReasonError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalEvent(null)}
                  className="px-4 py-2 bg-white text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal-sm cursor-pointer"
                >
                  Keep Event
                </button>
                <button
                  type="button"
                  disabled={actionLoadingId === cancelModalEvent.id}
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === cancelModalEvent.id ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
