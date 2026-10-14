import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { db } from "@/db";
import { listSavedEvents, type SavedEventWithDetails } from "@/lib/events/saved-service";
import { EventCard } from "@/components/events/EventCard";
import { Bookmark, Compass, LogIn, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SavedEventsPage() {
  const auth = await getServerAuthSession();

  // If unauthenticated: render prompt to log in
  if (!auth) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-xl border border-[#DAD7CD] p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#F5F3EB] border border-[#A3B18A]/50 flex items-center justify-center mx-auto text-[#344E41]">
          <Bookmark className="w-6 h-6 fill-[#344E41]" />
        </div>
        <h2 className="text-lg font-bold text-[#202820] tracking-tight">
          Sign In to Access Saved Opportunities
        </h2>
        <p className="text-xs text-[#586B5A] leading-relaxed">
          Log in with your department account to bookmark upcoming hackathons, workshops, and
          internships so you never miss a registration deadline.
        </p>
        <div className="pt-2">
          <Link href="/login?redirect=/saved">
            <Button size="sm" className="bg-[#344E41] hover:bg-[#25392F] text-white text-xs font-semibold gap-1.5 w-full py-2.5">
              <LogIn className="w-3.5 h-3.5 text-[#C5D86D]" />
              Sign In to Your Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If unverified student: enforce verification requirement
  if (!auth.user.emailVerified) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-xl border border-[#DAD7CD] p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#F5F3EB] border border-[#A3B18A]/50 flex items-center justify-center mx-auto text-[#344E41]">
          <Mail className="w-6 h-6 text-[#344E41]" />
        </div>
        <h2 className="text-lg font-bold text-[#202820] tracking-tight">
          Verify Your Institutional Email
        </h2>
        <p className="text-xs text-[#586B5A] leading-relaxed">
          Access to bookmarking and saved opportunities requires a verified institutional email address ({auth.user.email}).
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link href={`/verify-email?sent=true&email=${encodeURIComponent(auth.user.email)}&redirect=/saved`}>
            <Button size="sm" className="bg-[#344E41] hover:bg-[#25392F] text-white text-xs font-semibold gap-1.5 w-full py-2.5">
              <Mail className="w-3.5 h-3.5 text-[#C5D86D]" />
              Verify Email / Resend Link
            </Button>
          </Link>
          <Link href="/" className="text-xs text-[#586B5A] hover:text-[#344E41] py-1 font-medium">
            Browse Department Catalog
          </Link>
        </div>
      </div>
    );
  }

  let savedItems: SavedEventWithDetails[] = [];
  try {
    savedItems = await listSavedEvents(db, auth.user);
  } catch (error) {
    console.error("Failed to retrieve saved events:", error);
  }

  const savedEventIds = savedItems.map((item) => item.event.id);

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="bg-white rounded-xl border border-[#DAD7CD] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/"
            className="text-xs text-[#586B5A] hover:text-[#344E41] inline-flex items-center gap-1 font-semibold transition-colors mb-1 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Opportunity Catalog
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202820] tracking-tight flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#344E41] fill-[#344E41]" />
            Your Saved Opportunities ({savedItems.length})
          </h1>
          <p className="text-xs text-[#586B5A]">
            Bookmarked opportunities for <strong className="text-[#202820]">{auth.user.name}</strong> ({auth.user.email}).
          </p>
        </div>
        <div className="hidden sm:flex items-center text-[10px] font-mono tracking-wider text-[#344E41] bg-[#F5F3EB] px-3 py-1.5 rounded-md border border-[#DAD7CD]">
          [STATUS // BOOKMARKED ARCHIVE]
        </div>
      </div>

      {/* Grid or Empty State */}
      {savedItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#DAD7CD] p-12 text-center shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#F5F3EB] border border-[#DAD7CD] flex items-center justify-center mx-auto text-[#586B5A]">
            <Bookmark className="w-7 h-7 text-[#344E41]" />
          </div>
          <h3 className="text-base font-bold text-[#202820]">No saved opportunities yet</h3>
          <p className="text-xs text-[#586B5A] max-w-sm mx-auto leading-relaxed">
            When you find hackathons, workshops or seminars you want to track, click the bookmark
            icon on any event card to save them here for quick access.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button size="sm" className="bg-[#344E41] hover:bg-[#25392F] text-white text-xs font-semibold gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C5D86D]" />
                Explore Department Opportunities
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedItems.map((item) => (
            <EventCard
              key={item.event.id}
              event={item.event}
              isSavedInitially={savedEventIds.includes(item.event.id)}
              isAuthenticated={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
