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
      spotlightColor="rgba(163, 177, 138, 0.12)"
      size={380}
      className="bg-white rounded-xl border border-[#DAD7CD] shadow-xs hover:shadow-sm hover:border-[#A3B18A] transition-all duration-200 flex flex-col justify-between overflow-hidden group h-full"
    >
      {/* Top Banner or Category Header */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <CategoryBadge category={event.category} />
              <span className="text-xs font-semibold text-[#344E41] bg-[#F5F3EB] px-2.5 py-0.5 rounded border border-[#DAD7CD]">
                {event.mode}
              </span>
              {event.status !== "PUBLISHED" && <StatusBadge status={event.status} />}
            </div>

            <button
              onClick={handleToggleBookmark}
              disabled={isSaving}
              aria-label={isSaved ? "Remove from saved opportunities" : "Save this opportunity"}
              className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] focus-visible:ring-offset-2 touch-manipulation shrink-0 ${
                isSaved
                  ? "bg-[#344E41] text-[#C5D86D] border border-[#344E41] hover:bg-[#263A30]"
                  : "text-[#586B5A] hover:text-[#202820] hover:bg-[#F5F3EB] border border-[#DAD7CD]"
              }`}
              title={isSaved ? "Saved in your opportunities" : "Save opportunity"}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#586B5A]" />
              ) : (
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#C5D86D] text-[#C5D86D]" : ""}`} />
              )}
            </button>
          </div>

          <Link
            href={`/events/${event.slug}`}
            className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] focus-visible:ring-offset-2"
          >
            <h3 className="text-base font-bold text-[#202820] group-hover:text-[#344E41] transition-colors leading-snug line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-[#586B5A] font-medium mt-1.5 flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-[#586B5A] shrink-0" />
            <span className="truncate">{event.organizer}</span>
          </p>

          <p className="text-xs text-[#344E41]/85 mt-2.5 line-clamp-2 leading-relaxed">
            {event.summary}
          </p>
        </div>

        {/* Schedule & Logistics */}
        <div className="pt-3 border-t border-[#DAD7CD]/80 space-y-2 text-xs text-[#586B5A]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#344E41] shrink-0" />
            <span className="font-semibold text-[#202820]">
              {formatDate(event.startDate)}
              {event.startDate !== event.endDate && ` – ${formatDate(event.endDate)}`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#586B5A] shrink-0" />
              <span className={deadline.isPast ? "text-rose-700 font-bold" : "text-[#344E41] font-semibold"}>
                Deadline: {deadline.formatted}
              </span>
            </div>

            {deadline.isPast ? (
              <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Closed
              </span>
            ) : deadline.diffDays <= 3 ? (
              <span className="text-xs font-bold text-[#243314] bg-[#C5D86D]/35 px-2 py-0.5 rounded border border-[#C5D86D]/70 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-[#243314]" />
                {deadline.diffDays === 0 ? "Closes today!" : `${deadline.diffDays}d left`}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 truncate text-[#586B5A] text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#586B5A] shrink-0" />
            <span className="truncate font-medium">{event.venue}</span>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-1">
              <Tag className="w-3 h-3 text-[#586B5A]" />
              {event.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-[#F5F3EB] text-[#344E41] px-2 py-0.5 rounded border border-[#DAD7CD] font-medium"
                >
                  #{tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-xs text-[#586B5A] font-semibold">+{event.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="bg-[#F5F3EB]/70 px-5 py-3 border-t border-[#DAD7CD] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#202820]">
            {event.fee?.toLowerCase().includes("free") || !event.fee ? (
              <span className="text-[#202820] font-bold bg-[#A3B18A]/25 px-2.5 py-0.5 rounded border border-[#A3B18A]/50 text-xs">
                Free Entry
              </span>
            ) : (
              <span className="text-[#202820] font-bold text-xs">
                Fee: {event.fee}
              </span>
            )}
          </span>
        </div>

        <Link
          href={`/events/${event.slug}`}
          className="text-xs font-bold text-[#344E41] hover:text-[#202820] flex items-center gap-1 transition-colors rounded px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] focus-visible:ring-offset-2"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </SpotlightCard>
  );
}
