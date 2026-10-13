import { db } from "@/db";
import { getServerAuthSession } from "@/lib/auth/server";
import { listPublishedEvents } from "@/lib/events/service";
import { getSavedEventIdsForUser } from "@/lib/events/saved-service";
import { StudentCatalog } from "@/components/events/StudentCatalog";
import type { Event } from "@/db/schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hackathons & Events | REC AI & DS Opportunities Portal",
  description: "Browse verified hackathons, symposiums, and engineering sprints for REC AI & DS scholars.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const auth = await getServerAuthSession();

  let events: Event[] = [];
  let savedEventIds: string[] = [];
  let dbError: string | null = null;

  try {
    const published = await listPublishedEvents(db, { page: 1, pageSize: 50 });
    events = published.items;

    if (auth?.user) {
      savedEventIds = await getSavedEventIdsForUser(db, auth.user.id);
    }
  } catch (error) {
    dbError =
      error instanceof Error ? error.message : "Unable to establish connection to PostgreSQL.";
  }

  return (
    <div className="space-y-6">
      <StudentCatalog
        initialEvents={events}
        savedEventIds={savedEventIds}
        isAuthenticated={!!auth?.user}
        dbError={dbError}
        title="All Hackathons &amp; Events"
        subtitle="Department-sanctioned technical competitions, sprints, and symposiums"
      />
    </div>
  );
}
