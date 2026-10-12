import { db } from "@/db";
import { getServerAuthSession } from "@/lib/auth/server";
import { listPublishedEvents } from "@/lib/events/service";
import { getSavedEventIdsForUser } from "@/lib/events/saved-service";
import { HomePageHero } from "@/components/events/HomePageHero";
import { StudentCatalog } from "@/components/events/StudentCatalog";
import type { Event } from "@/db/schema";

export default async function HomePage() {
  const auth = await getServerAuthSession();

  let events: Event[] = [];
  let savedEventIds: string[] = [];
  let dbError: string | null = null;

  try {
    const published = await listPublishedEvents(db, { page: 1, pageSize: 30 });
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
      {/* Dynamic Animated Academic Hero */}
      <HomePageHero />

      {/* Discovery Catalog Section with GSAP Staggered Cards */}
      <section className="space-y-4">
        <StudentCatalog
          initialEvents={events}
          savedEventIds={savedEventIds}
          isAuthenticated={!!auth?.user}
          dbError={dbError}
        />
      </section>
    </div>
  );
}
