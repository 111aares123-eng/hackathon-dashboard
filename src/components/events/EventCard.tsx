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
  Sparkles,
  Loader2,
  Terminal,
  Trophy,
  CheckCircle,
} from "lucide-react";
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

  // Header banner color schemes
  const getHeaderStyle = (category: string) => {
    switch (category) {
      case "HACKATHON":
        return {
          bg: "bg-[#F12D2D] text-white",
          icon: <Terminal className="w-4 h-4 text-[#FFE23B]" />,
        };
      case "WORKSHOP":
        return {
          bg: "bg-[#1748F5] text-white",
          icon: <Sparkles className="w-4 h-4 text-[#FFE23B]" />,
        };
      case "COMPETITION":
        return {
          bg: "bg-[#FFE23B] text-[#171717]",
          icon: <Trophy className="w-4 h-4 text-[#171717]" />,
        };
      default:
        return {
          bg: "bg-[#E9E2D5] text-[#171717]",
          icon: <Sparkles className="w-4 h-4 text-[#1748F5]" />,
        };
    }
  };

  const headerStyle = getHeaderStyle(event.category);

  return (
    <article
      data-category={event.category.toLowerCase()}
      data-mode={event.mode.toLowerCase()}
      className="event-card-item group relative bg-white border-2 border-[#171717] rounded shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-xl transition-all flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Top Card Header Banner */}
        <div
          className={`px-4 py-2.5 border-b-2 border-[#171717] flex items-center justify-between ${headerStyle.bg}`}
        >
          <div className="flex items-center gap-1.5 font-heading text-xs uppercase font-extrabold tracking-wider">
            {headerStyle.icon}
            <span>
              {event.category} • {event.mode}
            </span>
          </div>

          <button
            onClick={handleToggleBookmark}
            disabled={isSaving}
            className="hover:scale-125 transition-transform cursor-pointer"
            title={isSaved ? "Remove from Student Vault" : "Save to Student Vault"}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-current" />
            ) : (
              <Bookmark
                className={`w-4 h-4 ${
                  isSaved ? "fill-current" : ""
                }`}
              />
            )}
          </button>
        </div>

        {/* Card Body Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          {/* Organizers & Faculty Stamp */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 font-heading text-xs uppercase font-bold text-[#1748F5] truncate max-w-[70%]">
              <CheckCircle className="w-3.5 h-3.5 text-[#1748F5] shrink-0" />
              <span className="truncate">{event.organizer}</span>
            </div>
            <span className="px-1.5 py-0.5 bg-[#D9FF38] text-[#171717] border border-[#171717] font-heading font-extrabold text-[10px] uppercase rounded shadow-brutal-sm">
              OD APPROVED
            </span>
          </div>

          {/* Title */}
          <Link href={`/events/${event.slug}`} className="block">
            <h3 className="font-display text-lg sm:text-xl uppercase text-[#171717] font-extrabold leading-tight group-hover:text-[#F12D2D] transition-colors line-clamp-2">
              {event.title}
            </h3>
          </Link>

          {/* Summary */}
          <p className="font-body text-xs text-[#5D3F3C] line-clamp-2 leading-relaxed">
            {event.summary}
          </p>

          {/* Tags / Chips */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 my-1">
              {event.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#E9E2D5] border border-[#171717] text-[#171717] font-heading text-[10px] font-extrabold uppercase rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata Box */}
          <div className="grid grid-cols-2 gap-2 bg-[#FFF9E9] p-2.5 border border-[#171717] rounded">
            <div>
              <span className="font-heading text-[10px] text-[#5D3F3C] block uppercase font-bold">
                Prize / Fee
              </span>
              <span className="font-heading text-xs font-black text-[#F12D2D] truncate block">
                {event.prizes ? event.prizes : event.fee}
              </span>
            </div>
            <div>
              <span className="font-heading text-[10px] text-[#5D3F3C] block uppercase font-bold">
                Deadline
              </span>
              <span
                className={`font-heading text-xs font-black uppercase truncate block ${
                  deadline.isPast
                    ? "text-[#F12D2D]"
                    : deadline.diffDays <= 3
                    ? "text-[#F12D2D]"
                    : "text-[#171717]"
                }`}
              >
                {deadline.isPast ? "Closed" : deadline.formatted}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Button */}
      <div className="p-4 sm:p-5 pt-0">
        <Link
          href={`/events/${event.slug}`}
          className="w-full py-2.5 px-3 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase tracking-wider font-extrabold rounded shadow-brutal-sm hover:bg-[#1748F5] hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-1.5 transition-all"
        >
          <span>VIEW OPPORTUNITY</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FFE23B]" />
        </Link>
      </div>
    </article>
  );
}
