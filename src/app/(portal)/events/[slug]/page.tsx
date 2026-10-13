import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { getServerAuthSession } from "@/lib/auth/server";
import { getPublishedEventBySlug } from "@/lib/events/service";
import { getSavedEventIdsForUser } from "@/lib/events/saved-service";
import { EventDetailInteractive } from "@/components/events/EventDetailInteractive";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  Star,
  Flame,
  XCircle,
} from "lucide-react";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const auth = await getServerAuthSession();

  let event = null;
  let isSaved = false;

  try {
    event = await getPublishedEventBySlug(db, slug);
    if (event && auth?.user) {
      const savedIds = await getSavedEventIdsForUser(db, auth.user.id);
      isSaved = savedIds.includes(event.id);
    }
  } catch (error) {
    console.error("Error retrieving event by slug:", error);
  }

  // Strictly disallow viewing non-existent or draft events
  if (!event) {
    notFound();
  }

  const isCancelled = event.status === "CANCELLED";

  return (
    <div className="flex flex-col w-full -mt-2">
      {/* Ticker Banner: Neo-Brutalist High Voltage Marquee */}
      <div className="w-full bg-[#FFE23B] text-[#171717] py-2 overflow-hidden border-y-2 border-[#171717] select-none shadow-brutal-sm mb-6">
        <div className="animate-marquee items-center gap-6 font-heading text-xs uppercase tracking-wider font-extrabold">
          <span className="inline-flex items-center gap-1 bg-[#F12D2D] text-white px-2 py-0.5 rounded shadow-brutal-sm">
            <Zap className="w-3.5 h-3.5 fill-white" /> PHASE 1 LIVE
          </span>
          <span>⚡ 36-HOUR SPRINT STARTS NOVEMBER 14TH</span>
          <span>★ ₹1,50,000 COMBINED BOUNTY</span>
          <span>★ 100% REC ACADEMIC OD ACCREDITED</span>
          <span>★ RUN ON AUTONOMOUS AGENTS MATRIX</span>
          <span>★ SPONSORED BY REC AI &amp; DATA SCIENCE LABS</span>
          <span>⚡ 36-HOUR SPRINT STARTS NOVEMBER 14TH</span>
          <span>★ FAST-TRACK INCUBATION TICKETS</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb & Top Utility Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-heading text-xs text-[#5D3F3C] uppercase font-bold">
            <Link href="/" className="hover:text-[#F12D2D] transition-colors">
              Opportunities Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/#events-grid" className="hover:text-[#F12D2D] transition-colors">
              {event.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="bg-[#E9E2D5] px-2 py-0.5 rounded text-[#171717] border border-[#171717]">
              {event.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-[#FFE23B] text-[#171717] px-3 py-1 font-heading text-xs uppercase font-extrabold rounded-full border-2 border-[#171717] shadow-brutal-sm inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#171717]" /> HOD APPROVED
            </span>
            <span className="bg-[#1748F5] text-white px-3 py-1 font-heading text-xs uppercase font-extrabold rounded-full border-2 border-[#171717] shadow-brutal-sm">
              NAAC A++ ACCREDITED OD
            </span>
          </div>
        </div>

        {/* Cancellation Notice Banner if Cancelled */}
        {isCancelled && (
          <div className="bg-[#FFDAD6] border-2 border-[#171717] rounded p-4 text-xs text-[#410002] flex items-start gap-3 shadow-brutal-md">
            <XCircle className="w-5 h-5 text-[#F12D2D] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-heading font-black text-sm uppercase">
                Notice: Opportunity Cancelled by Department Coordinator
              </h4>
              <p className="font-body text-xs mt-0.5">
                This opportunity has been marked as cancelled. Any scheduled sessions or submission deadlines are suspended.
              </p>
            </div>
          </div>
        )}

        {/* 7:5 Asymmetrical Editorial Detail Layout */}
        <EventDetailInteractive
          event={event}
          isSavedInitially={isSaved}
          isAuthenticated={!!auth?.user}
        />
      </div>
    </div>
  );
}
