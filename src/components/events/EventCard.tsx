"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  ArrowRight,
  AlertCircle,
  Tag,
  Loader2,
  Building2,
} from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { StatusBadge } from "./StatusBadge";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import type { Event } from "@/db/schema";
import { toggleSaveEventAction } from "@/lib/events/saved-actions";

interface EventCardProps {
  event: Event;
  isSavedInitially?: boolean;
  isAuthenticated?: boolean;
}

export function EventCard({
  event,
  isSavedInitially = false,
  isAuthenticated = false,
}: EventCardProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(isSavedInitially);
  const [isSaving, setIsSaving] = useState(false);

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

  const deadline = formatDeadline(event.registrationDeadline);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${event.slug}`);
      return;
    }

    setIsSaving(true);
    try {
      const result = await toggleSaveEventAction(event.id);
      if (result.success && typeof result.isSaved === "boolean") {
        setIsSaved(result.isSaved);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SpotlightCard
      spotlightColor="rgba(0, 51, 102, 0.07)"
      size={380}
      className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#003366]/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group h-full"
    >
      {/* Top Banner or Category Header */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <CategoryBadge category={event.category} />
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                {event.mode}
              </span>
              {event.status !== "PUBLISHED" && <StatusBadge status={event.status} />}
            </div>

            <button
              onClick={handleToggleBookmark}
              disabled={isSaving}
              aria-label={isSaved ? "Remove from saved opportunities" : "Save this opportunity"}
              className={`p-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003366] ${
                isSaved
                  ? "bg-[#FAF6ED] text-[#C5A059] border border-[#C5A059]/40 hover:bg-[#F3EAD5]"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
              title={isSaved ? "Saved in your opportunities" : "Save opportunity"}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#C5A059]" : ""}`} />
              )}
            </button>
          </div>

          <Link href={`/events/${event.slug}`} className="block">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#003366] transition-colors leading-snug line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.organizer}</span>
          </p>

          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
            {event.summary}
          </p>
        </div>

        {/* Schedule & Logistics */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#003366] shrink-0" />
            <span className="font-medium text-slate-800">
              {formatDate(event.startDate)}
              {event.startDate !== event.endDate && ` – ${formatDate(event.endDate)}`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className={deadline.isPast ? "text-rose-600 font-semibold" : "text-slate-700 font-medium"}>
                Deadline: {deadline.formatted}
              </span>
            </div>

            {deadline.isPast ? (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Closed
              </span>
            ) : deadline.diffDays <= 3 ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                {deadline.diffDays === 0 ? "Closes today!" : `${deadline.diffDays}d left`}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 truncate text-slate-500 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-1">
              <Tag className="w-3 h-3 text-slate-300" />
              {event.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/70 font-medium"
                >
                  #{tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-[10px] text-slate-400 font-medium">+{event.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="bg-slate-50/90 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800">
            {event.fee?.toLowerCase().includes("free") || !event.fee ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                Free Entry
              </span>
            ) : (
              <span className="text-slate-800 font-bold text-xs">
                Fee: {event.fee}
              </span>
            )}
          </span>
        </div>

        <Link
          href={`/events/${event.slug}`}
          className="text-xs font-bold text-[#003366] hover:text-[#002244] flex items-center gap-1 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </SpotlightCard>
  );
}
