import { db } from "@/db";
import { getServerAuthSession } from "@/lib/auth/server";
import { listPublishedEvents, getPublicPortalStats, type PublicPortalStats } from "@/lib/events/service";
import { getSavedEventIdsForUser } from "@/lib/events/saved-service";
import { HomePageHero } from "@/components/events/HomePageHero";
import { StudentCatalog } from "@/components/events/StudentCatalog";
import type { Event } from "@/db/schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "REC AI & DS Opportunities Portal | Rajalakshmi Engineering College",
  description: "Exclusive Hackathons, High-Impact Research Labs & Top Internships curated for REC Artificial Intelligence & Data Science Scholars.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const auth = await getServerAuthSession();

  let events: Event[] = [];
  let savedEventIds: string[] = [];
  let portalStats: PublicPortalStats = {
    activeEventsCount: 0,
    totalStudentsCount: 0,
    approvedFacultyCount: 0,
    upcomingDeadlinesCount: 0,
    activeAnnouncements: [],
  };
  let dbError: string | null = null;

  try {
    const [published, stats] = await Promise.all([
      listPublishedEvents(db, { page: 1, pageSize: 30 }),
      getPublicPortalStats(db),
    ]);

    events = published.items;
    portalStats = stats;

    if (auth?.user) {
      savedEventIds = await getSavedEventIdsForUser(db, auth.user.id);
    }
  } catch (error) {
    dbError =
      error instanceof Error ? error.message : "Unable to establish connection to PostgreSQL.";
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Academic Hero with live calculated PostgreSQL metrics */}
      <HomePageHero
        stats={portalStats}
        announcements={portalStats.activeAnnouncements}
      />

      {/* Discovery Opportunities Feed with Clean Integrated Controls */}
      <StudentCatalog
        initialEvents={events}
        savedEventIds={savedEventIds}
        isAuthenticated={!!auth?.user}
        dbError={dbError}
        title="Featured Opportunities"
        subtitle="Department-sanctioned technical competitions and active hackathons"
      />
    </div>
  );
}
