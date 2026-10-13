import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { db } from "@/db";
import { listSavedEvents } from "@/lib/events/saved-service";
import { EventCard } from "@/components/events/EventCard";
import { Bookmark, LogIn, ArrowLeft, Mail, Star, Rocket, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SavedEventsPage() {
  const auth = await getServerAuthSession();

  // If unauthenticated: render prompt to log in
  if (!auth) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded border-2 border-[#171717] p-8 text-center shadow-brutal-xl space-y-4">
        <div className="w-14 h-14 rounded bg-[#FFE23B] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
          <Bookmark className="w-7 h-7 fill-[#171717]" />
        </div>
        <h2 className="font-display text-xl uppercase font-black text-[#171717] tracking-tight">
          Sign In to Access Student Vault
        </h2>
        <p className="font-body text-xs text-[#5D3F3C] leading-relaxed">
          Log in with your REC institutional account to bookmark upcoming hackathons, workshops, and
          internships so you never miss a registration deadline.
        </p>
        <div className="pt-2">
          <Link
            href="/login?redirect=/saved"
            className="w-full py-2.5 px-4 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4 text-[#FFE23B]" />
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  // If unverified student: enforce verification requirement
  if (!auth.user.emailVerified) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded border-2 border-[#171717] p-8 text-center shadow-brutal-xl space-y-4">
        <div className="w-14 h-14 rounded bg-[#FFE23B] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
          <Mail className="w-7 h-7 text-[#171717]" />
        </div>
        <h2 className="font-display text-xl uppercase font-black text-[#171717] tracking-tight">
          Verify Your Institutional Email
        </h2>
        <p className="font-body text-xs text-[#5D3F3C] leading-relaxed">
          Access to bookmarking and saved opportunities requires a verified institutional email address ({auth.user.email}).
        </p>
        <div className="pt-2 flex flex-col gap-3">
          <Link
            href={`/verify-email?sent=true&email=${encodeURIComponent(auth.user.email)}&redirect=/saved`}
            className="w-full py-2.5 px-4 bg-[#1748F5] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 transition-all"
          >
            <Mail className="w-4 h-4 text-[#FFE23B]" />
            Verify Email / Resend Link
          </Link>
          <Link
            href="/"
            className="font-heading text-xs text-[#5D3F3C] hover:text-[#171717] uppercase font-bold"
          >
            Browse Department Catalog
          </Link>
        </div>
      </div>
    );
  }

  let savedEvents: any[] = [];
  try {
    savedEvents = await listSavedEvents(db, auth.user);
  } catch (error) {
    console.error("Failed to load saved events:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Vault Header Banner */}
      <div className="bg-white rounded border-2 border-[#171717] p-6 sm:p-8 shadow-brutal-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FFE23B] text-[#171717] border-2 border-[#171717] font-heading text-xs font-black uppercase shadow-brutal-sm">
            <Bookmark className="w-3.5 h-3.5 fill-[#171717]" />
            <span>Student Opportunity Vault</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171717]">
            My Saved Hackathons &amp; Events
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#5D3F3C]">
            Track opportunities you&apos;ve bookmarked for upcoming hackathons, sprint dates, and attendance OD deadlines.
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal hover:bg-[#E9E2D5] active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore More Events</span>
        </Link>
      </div>

      {/* Empty State */}
      {savedEvents.length === 0 ? (
        <div className="bg-white rounded border-2 border-[#171717] p-12 text-center shadow-brutal-md max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FFE23B] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
            <Star className="w-6 h-6 fill-[#171717]" />
          </div>
          <h3 className="font-display text-xl uppercase font-black text-[#171717]">
            Your Vault is Currently Empty
          </h3>
          <p className="font-body text-xs text-[#5D3F3C] leading-relaxed">
            Click the bookmark icon on any hackathon or workshop card to pin it to your personal vault for fast reference.
          </p>
          <div className="pt-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-md transition-all"
            >
              <Rocket className="w-4 h-4 text-[#FFE23B]" />
              <span>Browse All Opportunities</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedEvents.map((saved) => (
            <EventCard
              key={saved.event.id}
              event={saved.event}
              isSavedInitially={true}
              isAuthenticated={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
