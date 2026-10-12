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
            <p className="font-bold text-slate-900">Local Database Service in Standby</p>
            <p className="text-amber-800 leading-relaxed">
              The portal interface and schemas are fully verified. To view live persisted records from PostgreSQL, start the container using{" "}
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-semibold">docker compose up -d</code> or configure your database URI in{" "}
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-semibold">.env.local</code>.
            </p>
          </div>
        </div>
      )}

      {/* Main Search and Discovery Filter Card */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hackathon title, workshop track, organizer, or keywords..."
            className="pl-10 pr-16 h-10 text-xs sm:text-sm bg-slate-50/70 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366] transition-all rounded-lg"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 px-2 py-0.5 rounded text-xs font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills with Dynamic Counts */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Opportunity Category</span>
            <span className="text-[11px] font-normal text-slate-400">Scroll horizontally for more</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar" data-lenis-prevent>
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === "ALL"
                  ? "bg-[#003366] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
              }`}
            >
              <span>All Opportunities</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === "ALL"
                    ? "bg-[#C5A059] text-slate-900"
                    : "bg-slate-200 text-slate-600"
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
                  className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#003366] text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? "bg-[#C5A059] text-slate-900"
                        : "bg-slate-200 text-slate-600"
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Delivery Mode Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Mode:</span>
              <div className="inline-flex rounded-lg shadow-xs border border-slate-200 overflow-hidden bg-slate-50 p-0.5">
                <button
                  onClick={() => setSelectedMode("ALL")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    selectedMode === "ALL"
                      ? "bg-[#002244] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Modes
                </button>
                <button
                  onClick={() => setSelectedMode("OFFLINE")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${
                    selectedMode === "OFFLINE"
                      ? "bg-[#002244] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  In-Person
                </button>
                <button
                  onClick={() => setSelectedMode("ONLINE")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${
                    selectedMode === "ONLINE"
                      ? "bg-[#002244] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  Online
                </button>
                <button
                  onClick={() => setSelectedMode("HYBRID")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${
                    selectedMode === "HYBRID"
                      ? "bg-[#002244] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  Hybrid
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "upcoming" | "deadline")}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-[#003366]"
              >
                <option value="upcoming">Sort by: Event Date</option>
                <option value="deadline">Sort by: Deadline (Urgent First)</option>
              </select>
            </div>
          </div>

          {/* Result Count and Reset Action */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-medium">
              Showing <strong className="text-slate-900">{filteredEvents.length}</strong> of {initialEvents.length} opportunities
            </span>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#003366] hover:text-[#002244] flex items-center gap-1 font-bold transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Event Cards with GSAP animation hook */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            No opportunities match your current filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
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
                className="text-xs gap-1.5 font-semibold text-slate-700 border-slate-300"
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
