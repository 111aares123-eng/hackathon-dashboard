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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // Local filter for search and dropdowns
  const filteredEvents = events.filter((ev) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      ev.title.toLowerCase().includes(q) ||
      ev.organizer.toLowerCase().includes(q) ||
      ev.venue.toLowerCase().includes(q);
    const matchesCat = selectedCategory === "ALL" || ev.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || ev.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handlePublish = async (eventId: string) => {
    setActionLoadingId(eventId);
    setActionMessage(null);
    try {
      const result = await publishEventAction(eventId);
      if (result.success && result.data) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, status: "PUBLISHED", publishedAt: new Date() } : e))
        );
        setActionMessage({ type: "success", text: "Opportunity published successfully! It is now visible to students." });
      } else {
        setActionMessage({ type: "error", text: result.error || "Failed to publish opportunity." });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Error publishing opportunity." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalEvent) return;
    if (!cancelReasonInput || cancelReasonInput.trim().length < 5) {
      setCancelReasonError("Please provide a cancellation reason with at least 5 characters.");
      return;
    }

    setActionLoadingId(cancelModalEvent.id);
    setActionMessage(null);
    try {
      const result = await cancelEventAction(cancelModalEvent.id, cancelReasonInput.trim());
      if (result.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === cancelModalEvent.id ? { ...e, status: "CANCELLED" } : e))
        );
        setActionMessage({
          type: "success",
          text: `Opportunity "${cancelModalEvent.title}" has been cancelled. Recorded in immutable audit log.`,
        });
        setCancelModalEvent(null);
        setCancelReasonInput("");
      } else {
        setActionMessage({ type: "error", text: result.error || "Failed to cancel opportunity." });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Error cancelling opportunity." });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-xs ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, organizer or venue..."
            className="pl-9 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-md border border-slate-200 px-2.5 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#003366]"
            >
              <option value="ALL">All Categories</option>
              {eventCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-md border border-slate-200 px-2.5 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#003366]"
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
      </div>

      {/* Events Table / Responsive Card View */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No departmental opportunities found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {events.length === 0
              ? "You haven't created any events yet. Publish an upcoming hackathon, workshop, or seminar to get started."
              : "No events matched your current search filters. Try clearing your filters."}
          </p>
          {events.length === 0 && (
            <div className="pt-2">
              <Link href="/admin/events/new">
                <Button size="sm" className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" />
                  Publish First Opportunity
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Opportunity</th>
                  <th scope="col" className="px-4 py-3.5">Category &amp; Mode</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Schedule</th>
                  <th scope="col" className="px-4 py-3.5">Registration Deadline</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredEvents.map((ev) => {
                  const deadlineInfo = formatDeadline(ev.registrationDeadline);
                  const isAuthor = currentUserId ? ev.authorId === currentUserId : true;
                  const canManage = userRole === "ADMIN" || isAuthor;

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Title & Organizer */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm max-w-xs truncate">
                          {ev.title}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5 truncate max-w-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{ev.organizer} • {ev.venue}</span>
                        </div>
                      </td>

                      {/* Category & Mode */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <CategoryBadge category={ev.category} />
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {ev.mode}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={ev.status} />
                      </td>

                      {/* Event Dates */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                          <span>{formatDate(ev.startDate)}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 pl-4.5">to {formatDate(ev.endDate)}</div>
                      </td>

                      {/* Registration Deadline */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className={deadlineInfo.isPast ? "text-rose-600 font-bold" : "text-slate-700"}>
                            {deadlineInfo.formatted}
                          </span>
                        </div>
                        {deadlineInfo.isPast ? (
                          <span className="text-[10px] text-rose-600 font-bold block">Closed</span>
                        ) : deadlineInfo.diffDays <= 3 ? (
                          <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            {deadlineInfo.diffDays === 0 ? "Closes today!" : `${deadlineInfo.diffDays} days left`}
                          </span>
                        ) : null}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Official URL preview */}
                          <a
                            href={ev.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Open Official Registration Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {canManage ? (
                            <>
                              {/* Edit Button */}
                              <Link href={`/admin/events/${ev.id}/edit`}>
                                <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 font-semibold gap-1 border-slate-300 text-slate-700">
                                  <Edit2 className="w-3 h-3 text-slate-500" />
                                  Edit
                                </Button>
                              </Link>

                              {/* Publish Draft Action */}
                              {ev.status === "DRAFT" && (
                                <Button
                                  size="sm"
                                  disabled={actionLoadingId === ev.id}
                                  onClick={() => handlePublish(ev.id)}
                                  className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1"
                                >
                                  {actionLoadingId === ev.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                  Publish
                                </Button>
                              )}

                              {/* Cancel Action */}
                              {ev.status === "PUBLISHED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={actionLoadingId === ev.id}
                                  onClick={() => {
                                    setCancelModalEvent(ev);
                                    setCancelReasonInput("");
                                    setCancelReasonError(null);
                                  }}
                                  className="h-7 text-xs px-2 text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold gap-1"
                                >
                                  {actionLoadingId === ev.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                  Cancel
                                </Button>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic font-medium">Read only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer info & Count */}
          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing <strong>{filteredEvents.length}</strong> of {initialTotal} department opportunities
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </span>
            <span>REC AI &amp; DS Faculty Management</span>
          </div>
        </div>
      )}

      {/* Cancellation Modal Dialog */}
      {cancelModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" data-lenis-prevent>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Cancel Department Opportunity</h3>
                <p className="text-xs text-slate-500">
                  Cancelling <strong>{cancelModalEvent.title}</strong> will display cancellation notices to all students.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mandatory Cancellation Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={cancelReasonInput}
                onChange={(e) => {
                  setCancelReasonInput(e.target.value);
                  if (cancelReasonError) setCancelReasonError(null);
                }}
                placeholder="e.g. Rescheduled due to semester examination clash / Postponed by organizers"
                rows={3}
                className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#003366] text-slate-900"
              />
              {cancelReasonError && (
                <p className="text-xs text-rose-600 font-medium">{cancelReasonError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={actionLoadingId === cancelModalEvent.id}
                onClick={() => setCancelModalEvent(null)}
                className="text-xs font-semibold"
              >
                Dismiss
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={actionLoadingId === cancelModalEvent.id}
                onClick={handleConfirmCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                {actionLoadingId === cancelModalEvent.id && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
