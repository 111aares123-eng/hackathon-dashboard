import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { getServerAuthSession } from "@/lib/auth/server";
import { getPublishedEventBySlug } from "@/lib/events/service";
import { getSavedEventIdsForUser } from "@/lib/events/saved-service";
import { CategoryBadge } from "@/components/events/CategoryBadge";
import { StatusBadge } from "@/components/events/StatusBadge";
import { EventDetailContainer } from "@/components/events/EventDetailContainer";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Building2,
  AlertTriangle,
  Bookmark,
} from "lucide-react";
import { isValidHttpUrl } from "@/validators/event";

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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const now = new Date();
  const deadlineDate = new Date(event.registrationDeadline);
  const isRegistrationClosed = deadlineDate < now;
  const isCancelled = event.status === "CANCELLED";
  const isValidUrl = isValidHttpUrl(event.registrationUrl);

  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#586B5A] hover:text-[#344E41] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Department Opportunities</span>
        </Link>
      </div>

      {/* Cancellation Notice Banner */}
      {isCancelled && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-start gap-3 shadow-xs">
          <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm">Notice: Event Cancelled by Department Coordinator</h4>
            <p className="text-rose-700 leading-relaxed">
              This opportunity has been marked as cancelled. Any scheduled sessions or submission deadlines are suspended.
            </p>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout with GSAP Orchestration */}
      <EventDetailContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Content Column (2/3 width) */}
          <div className="detail-main-article lg:col-span-2 space-y-6">
            <article className="bg-white rounded-xl border border-[#DAD7CD] shadow-sm overflow-hidden">
              {/* Top Organic Horizon Accent Header */}
              <div className="h-2 bg-gradient-to-r from-[#344E41] via-[#A3B18A] to-[#C5D86D]" />

              <div className="p-6 sm:p-8 space-y-5">
                {/* Badges & Meta */}
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={event.category} />
                  <span className="text-xs font-semibold text-[#202820] bg-[#F5F3EB] px-2.5 py-0.5 rounded border border-[#DAD7CD]">
                    {event.mode} Mode
                  </span>
                  <StatusBadge status={event.status} />
                </div>

                {/* Title & Organizer */}
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820] tracking-tight leading-tight">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#586B5A] font-medium">
                    <span className="flex items-center gap-1.5 text-[#202820]">
                      <Building2 className="w-3.5 h-3.5 text-[#586B5A]" />
                      Organized by: <strong className="text-[#202820] font-semibold">{event.organizer}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Department: <strong className="text-[#344E41]">AI &amp; DS, Rajalakshmi Engineering College</strong>
                    </span>
                  </div>
                </div>

                {/* Executive Summary Pitch Box */}
                <div className="bg-[#F5F3EB] border-l-4 border-[#344E41] p-4 rounded-r-lg text-xs sm:text-sm text-[#202820] leading-relaxed space-y-1">
                  <span className="text-[11px] font-bold text-[#344E41] font-mono tracking-wider block">
                    [REC // OPPORTUNITY SUMMARY]
                  </span>
                  <p>{event.summary}</p>
                </div>

                {/* About the Opportunity */}
                <div className="space-y-3 pt-3 border-t border-[#DAD7CD]/50">
                  <h2 className="text-xs font-bold text-[#586B5A] uppercase tracking-wider font-mono">
                    About the Opportunity &amp; Detailed Guidelines
                  </h2>
                  <div className="text-xs sm:text-sm text-[#202820] whitespace-pre-line leading-relaxed">
                    {event.description}
                  </div>
                </div>

                {/* Eligibility Criteria */}
                {event.eligibility && (
                  <div className="space-y-2 pt-4 border-t border-[#DAD7CD]/50">
                    <h3 className="text-xs font-bold text-[#344E41] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Users className="w-4 h-4 text-[#344E41]" />
                      Eligibility Criteria
                    </h3>
                    <div className="bg-[#F5F3EB]/60 p-4 rounded-lg border border-[#DAD7CD] text-xs sm:text-sm text-[#202820] leading-relaxed">
                      {event.eligibility}
                    </div>
                  </div>
                )}

                {/* Prizes & Recognition */}
                {event.prizes && (
                  <div className="space-y-2 pt-4 border-t border-[#DAD7CD]/50">
                    <h3 className="text-xs font-bold text-[#344E41] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Award className="w-4 h-4 text-[#344E41]" />
                      Prizes, Awards &amp; Recognition
                    </h3>
                    <div className="bg-[#F5F3EB] border border-[#A3B18A]/50 p-4 rounded-lg text-xs sm:text-sm text-[#202820] leading-relaxed font-medium">
                      {event.prizes}
                    </div>
                  </div>
                )}

                {/* Topics & Keywords Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-[#DAD7CD]/50">
                    <h3 className="text-xs font-bold text-[#586B5A] uppercase tracking-wider font-mono">
                      Topics &amp; Key Domains
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium bg-[#F5F3EB] text-[#344E41] px-2.5 py-1 rounded-md border border-[#DAD7CD]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Sticky Sidebar Column (1/3 width) */}
          <div className="detail-sidebar-box space-y-5 lg:sticky lg:top-24">
            {/* Action Card: Official Registration CTA */}
            <SpotlightCard
              spotlightColor="rgba(163, 177, 138, 0.14)"
              size={350}
              className="bg-white rounded-xl border border-[#DAD7CD] shadow-sm p-6 space-y-5"
            >
              <div className="space-y-2 pb-4 border-b border-[#DAD7CD]/50">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B5A] block font-mono">
                  Registration Status
                </span>
                <div className="flex items-baseline justify-between">
                  <div>
                    {isCancelled ? (
                      <span className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        Cancelled
                      </span>
                    ) : isRegistrationClosed ? (
                      <span className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Registration Closed
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-[#344E41] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#344E41]" />
                        Open for Registration
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#586B5A] block text-[10px]">Fee:</span>
                    <span className="text-base font-extrabold text-[#202820]">
                      {event.fee || "Free"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Primary Action */}
              <div className="space-y-2.5">
                {!isCancelled && !isRegistrationClosed && isValidUrl ? (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-[#344E41] hover:bg-[#25392F] text-white text-xs font-bold gap-2 py-3 h-auto shadow-sm transition-all cursor-pointer">
                      <span>Register on Official Portal</span>
                      <ExternalLink className="w-4 h-4 text-[#C5D86D]" />
                    </Button>
                  </a>
                ) : isCancelled ? (
                  <div className="p-3 rounded-lg bg-[#F5F3EB] text-center text-xs font-semibold text-[#586B5A] border border-[#DAD7CD]">
                    Opportunity Cancelled
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center text-xs font-semibold text-rose-700">
                    Registration Deadline Passed
                  </div>
                )}

                {/* Bookmark status indicator */}
                {isSaved ? (
                  <div className="p-2 rounded bg-[#F5F3EB] text-[#344E41] border border-[#A3B18A] text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 fill-[#344E41] text-[#344E41]" />
                    Saved in your opportunities
                  </div>
                ) : (
                  <Link href={auth ? "/saved" : `/login?redirect=/events/${event.slug}`} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 border-[#DAD7CD] text-[#344E41] hover:bg-[#F5F3EB]"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      Save for Later
                    </Button>
                  </Link>
                )}
              </div>

              <p className="text-[11px] text-[#586B5A] leading-relaxed text-center">
                All registrations are processed through the official department or external contest form.
              </p>
            </SpotlightCard>

            {/* Schedule & Logistics Card */}
            <div className="bg-white rounded-xl border border-[#DAD7CD] shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#586B5A] pb-2 border-b border-[#DAD7CD]/50 font-mono">
                Schedule &amp; Logistics
              </h3>

              <div className="space-y-3.5 text-xs text-[#202820]">
                {/* Event Dates */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#344E41] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-[#202820] block">Event Schedule</span>
                    <span className="font-medium">{formatDate(event.startDate)}</span>
                    <span className="block text-[#586B5A] text-[11px]">to {formatDate(event.endDate)}</span>
                  </div>
                </div>

                {/* Registration Deadline */}
                <div className="flex items-start gap-3 pt-2 border-t border-[#DAD7CD]/50">
                  <Clock className="w-4 h-4 text-[#344E41] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-[#202820] block">Registration Deadline</span>
                    <span className={isRegistrationClosed ? "text-rose-600 font-semibold" : "text-[#202820] font-medium"}>
                      {formatDate(event.registrationDeadline)}
                    </span>
                    {!isRegistrationClosed && diffDays >= 0 && (
                      <span className="block text-[#344E41] font-semibold text-[11px]">
                        {diffDays === 0 ? "Closes today!" : `${diffDays} days remaining to apply`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Venue & Location */}
                <div className="flex items-start gap-3 pt-2 border-t border-[#DAD7CD]/50">
                  <MapPin className="w-4 h-4 text-[#586B5A] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-[#202820] block">Venue &amp; Delivery</span>
                    <span className="font-medium text-[#202820]">{event.venue}</span>
                    <span className="block text-[#586B5A] text-[11px]">Mode: {event.mode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EventDetailContainer>
    </div>
  );
}
