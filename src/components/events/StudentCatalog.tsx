"use client";

import { useMemo, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Search, Compass, RotateCcw, Database, MapPin, Globe, Layers, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EventCard } from "./EventCard";
import type { Event } from "@/db/schema";
import { eventCategories } from "@/validators/event";

interface StudentCatalogProps {
  initialEvents: Event[];
  savedEventIds?: string[];
  isAuthenticated?: boolean;
  dbError?: string | null;
}

export function StudentCatalog({
  initialEvents,
  savedEventIds = [],
  isAuthenticated = false,
  dbError = null,
}: StudentCatalogProps) {
  const catalogRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMode, setSelectedMode] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"upcoming" | "deadline">("upcoming");

  // Dynamic counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialEvents.forEach((ev) => {
      counts[ev.category] = (counts[ev.category] || 0) + 1;
    });
    return counts;
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    const list = initialEvents.filter((ev) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        ev.title.toLowerCase().includes(q) ||
        ev.organizer.toLowerCase().includes(q) ||
        ev.summary.toLowerCase().includes(q) ||
        ev.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === "ALL" || ev.category === selectedCategory;
      const matchesMode = selectedMode === "ALL" || ev.mode === selectedMode;

      return matchesSearch && matchesCategory && matchesMode;
    });

    return list.sort((a, b) => {
      if (sortBy === "deadline") {
        return new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime();
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [initialEvents, search, selectedCategory, selectedMode, sortBy]);

  // GSAP: Staggered reveal for cards and filter bar entrance
  useGSAP(
    () => {
      if (typeof window !== "undefined") {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) return;
      }

      if (filteredEvents.length === 0) return;

      const cardElements = catalogRef.current?.querySelectorAll(".event-card-item");
      if (!cardElements || cardElements.length === 0) return;

      gsap.from(cardElements, {
        opacity: 0,
        y: 14,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    {
      scope: catalogRef,
      dependencies: [filteredEvents.length, selectedCategory, selectedMode, sortBy],
    }
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
    setSelectedMode("ALL");
    setSortBy("upcoming");
  };

  const isFiltered = search !== "" || selectedCategory !== "ALL" || selectedMode !== "ALL";

  return (
    <div ref={catalogRef} className="space-y-5">
      {/* Database Standby Alert if local PostgreSQL service is unstarted */}
      {dbError && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <Database className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-[#202820]">Local Database Service in Standby</p>
            <p className="text-amber-800 leading-relaxed">
              The portal interface and schemas are fully verified. To view live persisted records from PostgreSQL, start the container using{" "}
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-semibold">docker compose up -d</code> or configure your database URI in{" "}
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-semibold">.env.local</code>.
            </p>
          </div>
        </div>
      )}

      {/* Main Search and Discovery Filter Card */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#DAD7CD] shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#586B5A] absolute left-3.5 top-3.5 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hackathon title, workshop track, organizer, or keywords..."
            className="pl-10 pr-16 h-10 text-xs sm:text-sm bg-[#F5F3EB]/70 border-[#DAD7CD] text-[#202820] placeholder:text-[#586B5A]/70 focus:bg-white focus:ring-2 focus:ring-[#344E41] transition-all rounded-lg"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2 px-2.5 py-1 min-h-[32px] rounded text-xs font-semibold text-[#586B5A] hover:text-[#202820] hover:bg-[#DAD7CD]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills with Dynamic Counts */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#202820]">
            <span className="tracking-wide">Opportunity Category</span>
            <span className="text-xs font-medium text-[#586B5A]">Scroll horizontally for more</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar" data-lenis-prevent>
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`min-h-[38px] sm:min-h-[34px] px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] focus-visible:ring-offset-2 touch-manipulation ${
                selectedCategory === "ALL"
                  ? "bg-[#344E41] text-white shadow-xs font-bold"
                  : "bg-[#F5F3EB] text-[#344E41] hover:bg-[#EEF2E8] border border-[#DAD7CD]"
              }`}
            >
              <span>All Opportunities</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  selectedCategory === "ALL"
                    ? "bg-[#C5D86D] text-[#202820] font-extrabold"
                    : "bg-[#DAD7CD]/80 text-[#202820]"
                }`}
              >
                {initialEvents.length}
              </span>
            </button>
            {eventCategories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] sm:min-h-[34px] px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] focus-visible:ring-offset-2 touch-manipulation ${
                    isSelected
                      ? "bg-[#344E41] text-white shadow-xs font-bold"
                      : "bg-[#F5F3EB] text-[#344E41] hover:bg-[#EEF2E8] border border-[#DAD7CD]"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? "bg-[#C5D86D] text-[#202820] font-extrabold"
                        : "bg-[#DAD7CD]/80 text-[#202820]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Delivery Mode & Sort Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DAD7CD]/80 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Delivery Mode Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[#202820] font-bold">Mode:</span>
              <div className="inline-flex rounded-lg shadow-xs border border-[#DAD7CD] overflow-hidden bg-[#F5F3EB] p-0.5 gap-0.5">
                <button
                  onClick={() => setSelectedMode("ALL")}
                  className={`min-h-[36px] sm:min-h-[32px] px-3 py-1.5 text-xs font-semibold rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] touch-manipulation ${
                    selectedMode === "ALL"
                      ? "bg-[#344E41] text-white shadow-xs"
                      : "text-[#344E41] hover:text-[#202820] hover:bg-[#EEF2E8]"
                  }`}
                >
                  All Modes
                </button>
                <button
                  onClick={() => setSelectedMode("OFFLINE")}
                  className={`min-h-[36px] sm:min-h-[32px] px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] touch-manipulation ${
                    selectedMode === "OFFLINE"
                      ? "bg-[#344E41] text-white shadow-xs"
                      : "text-[#344E41] hover:text-[#202820] hover:bg-[#EEF2E8]"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  In-Person
                </button>
                <button
                  onClick={() => setSelectedMode("ONLINE")}
                  className={`min-h-[36px] sm:min-h-[32px] px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] touch-manipulation ${
                    selectedMode === "ONLINE"
                      ? "bg-[#344E41] text-white shadow-xs"
                      : "text-[#344E41] hover:text-[#202820] hover:bg-[#EEF2E8]"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Online
                </button>
                <button
                  onClick={() => setSelectedMode("HYBRID")}
                  className={`min-h-[36px] sm:min-h-[32px] px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] touch-manipulation ${
                    selectedMode === "HYBRID"
                      ? "bg-[#344E41] text-white shadow-xs"
                      : "text-[#344E41] hover:text-[#202820] hover:bg-[#EEF2E8]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Hybrid
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#586B5A]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "upcoming" | "deadline")}
                className="bg-[#F5F3EB] border border-[#DAD7CD] text-[#202820] text-xs rounded-md px-2.5 py-1.5 min-h-[36px] sm:min-h-[32px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41]"
              >
                <option value="upcoming">Sort by: Event Date</option>
                <option value="deadline">Sort by: Deadline (Urgent First)</option>
              </select>
            </div>
          </div>

          {/* Result Count and Reset Action */}
          <div className="flex items-center gap-3">
            <span className="text-[#586B5A] text-xs font-medium">
              Showing <strong className="text-[#202820] font-bold">{filteredEvents.length}</strong> of {initialEvents.length} opportunities
            </span>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#344E41] hover:text-[#202820] flex items-center gap-1 font-bold transition-colors rounded px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] focus-visible:ring-offset-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Event Cards with GSAP animation hook */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#DAD7CD] p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#F5F3EB] flex items-center justify-center mx-auto text-[#586B5A]">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#202820] tracking-tight">
            No opportunities match your current filters
          </h3>
          <p className="text-xs text-[#586B5A] max-w-md mx-auto leading-relaxed">
            {initialEvents.length === 0
              ? "There are currently no published opportunities listed. Please check back shortly or sign in as faculty to publish upcoming hackathons and workshops."
              : "Try adjusting your search keywords, switching categories to 'All Opportunities', or clearing the delivery mode filter."}
          </p>
          {isFiltered && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs gap-1.5 font-semibold text-[#344E41] border-[#DAD7CD] hover:bg-[#F5F3EB]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="event-card-item">
              <EventCard
                event={ev}
                isSavedInitially={savedEventIds.includes(ev.id)}
                isAuthenticated={isAuthenticated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
