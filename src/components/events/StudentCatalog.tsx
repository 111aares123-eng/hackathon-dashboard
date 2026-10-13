"use client";

import { useMemo, useState, useRef } from "react";
import {
  Search,
  Zap,
  RotateCcw,
  Database,
  MapPin,
  Globe,
  Shuffle,
  Flame,
  Clock,
  SlidersHorizontal,
} from "lucide-react";
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
  const [urgencyFilter, setUrgencyFilter] = useState<"ALL" | "48HRS" | "WEEK">("ALL");

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();

    return initialEvents.filter((ev) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        ev.title.toLowerCase().includes(q) ||
        ev.organizer.toLowerCase().includes(q) ||
        ev.summary.toLowerCase().includes(q) ||
        ev.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === "ALL" || ev.category === selectedCategory;
      const matchesMode = selectedMode === "ALL" || ev.mode === selectedMode;

      let matchesUrgency = true;
      if (urgencyFilter === "48HRS") {
        const diffHours = (new Date(ev.registrationDeadline).getTime() - now) / (1000 * 60 * 60);
        matchesUrgency = diffHours > 0 && diffHours <= 48;
      } else if (urgencyFilter === "WEEK") {
        const diffDays = (new Date(ev.registrationDeadline).getTime() - now) / (1000 * 60 * 60 * 24);
        matchesUrgency = diffDays > 0 && diffDays <= 7;
      }

      return matchesSearch && matchesCategory && matchesMode && matchesUrgency;
    });
  }, [initialEvents, search, selectedCategory, selectedMode, urgencyFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
    setSelectedMode("ALL");
    setUrgencyFilter("ALL");
  };

  return (
    <div ref={catalogRef} className="flex flex-col w-full gap-8">
      {/* RETRO SEARCH & FILTER CONSOLE */}
      <section
        className="w-full bg-[#E9E2D5] px-4 sm:px-6 lg:px-8 py-6 border-b-2 border-[#171717]"
        id="retro-filter-bar"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          {/* Console Title & Search Input */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#F12D2D] border-2 border-[#171717]" />
              <span className="font-heading text-sm uppercase tracking-wide font-extrabold text-[#171717]">
                Y2K SEARCH CONSOLE
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hackathons, Kaggle sprints, GenAI symposiums, faculty labs..."
                className="w-full bg-white text-[#171717] placeholder:text-[#5D3F3C]/60 border-2 border-[#171717] rounded py-2.5 pl-10 pr-4 font-body text-sm shadow-brutal-md focus:outline-none focus:shadow-brutal-blue transition-all"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-[#171717] pointer-events-none" />
            </div>
          </div>

          {/* Category Stream Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-heading text-xs uppercase font-extrabold text-[#5D3F3C] flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Track:
            </span>

            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal-sm transition-all cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-[#FFE23B] text-[#171717]"
                  : "bg-white text-[#171717] hover:bg-[#FFF9E9]"
              }`}
            >
              ★ All Streams
            </button>

            {eventCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal-sm transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#FFE23B] text-[#171717]"
                    : "bg-white text-[#171717] hover:bg-[#FFF9E9]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Urgency & Mode Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#171717]/20 pt-3">
            {/* Mode Radios */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-xs uppercase font-bold text-[#5D3F3C]">
                Campus Mode:
              </span>
              <button
                type="button"
                onClick={() => setSelectedMode("ALL")}
                className={`px-2.5 py-1 border border-[#171717] rounded font-heading text-xs uppercase font-bold cursor-pointer ${
                  selectedMode === "ALL"
                    ? "bg-[#1748F5] text-white"
                    : "bg-white text-[#171717] hover:bg-[#FFF9E9]"
                }`}
              >
                Any
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode("OFFLINE")}
                className={`px-2.5 py-1 border border-[#171717] rounded font-heading text-xs uppercase font-bold cursor-pointer ${
                  selectedMode === "OFFLINE"
                    ? "bg-[#1748F5] text-white"
                    : "bg-white text-[#171717] hover:bg-[#FFF9E9]"
                }`}
              >
                📍 On-Campus
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode("ONLINE")}
                className={`px-2.5 py-1 border border-[#171717] rounded font-heading text-xs uppercase font-bold cursor-pointer ${
                  selectedMode === "ONLINE"
                    ? "bg-[#1748F5] text-white"
                    : "bg-white text-[#171717] hover:bg-[#FFF9E9]"
                }`}
              >
                🌐 Online
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode("HYBRID")}
                className={`px-2.5 py-1 border border-[#171717] rounded font-heading text-xs uppercase font-bold cursor-pointer ${
                  selectedMode === "HYBRID"
                    ? "bg-[#1748F5] text-white"
                    : "bg-white text-[#171717] hover:bg-[#FFF9E9]"
                }`}
              >
                🔀 Hybrid
              </button>
            </div>

            {/* Urgency Filter Badges */}
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs uppercase font-bold text-[#5D3F3C]">
                Urgency:
              </span>
              <button
                type="button"
                onClick={() => setUrgencyFilter(urgencyFilter === "48HRS" ? "ALL" : "48HRS")}
                className={`px-2.5 py-0.5 border border-[#171717] rounded font-heading text-xs font-bold uppercase cursor-pointer transition-colors ${
                  urgencyFilter === "48HRS"
                    ? "bg-[#F12D2D] text-white"
                    : "bg-[#FFDAD6] text-[#410002] hover:bg-[#F12D2D] hover:text-white"
                }`}
              >
                🔥 48 Hrs Remaining
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter(urgencyFilter === "WEEK" ? "ALL" : "WEEK")}
                className={`px-2.5 py-0.5 border border-[#171717] rounded font-heading text-xs font-bold uppercase cursor-pointer transition-colors ${
                  urgencyFilter === "WEEK"
                    ? "bg-[#FFE23B] text-[#171717]"
                    : "bg-white text-[#171717] hover:bg-[#FFE23B]"
                }`}
              >
                ⏳ This Week
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN EVENT OPPORTUNITIES GRID SECTION */}
      <section className="w-full px-4 sm:px-6 lg:px-8" id="events-grid">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1748F5] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm mb-2">
                <Zap className="w-3.5 h-3.5 text-[#FFE23B]" />
                <span>VERIFIED ACADEMIC OPPORTUNITIES</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl uppercase text-[#171717] leading-none tracking-tight font-black">
                FEATURED MATRIX FEED
              </h2>
            </div>
            <span className="font-heading text-xs uppercase font-bold text-[#5D3F3C]">
              SHOWING: {filteredEvents.length} OF {initialEvents.length} VERIFIED EVENTS
            </span>
          </div>

          {/* Database offline notice if any */}
          {dbError && (
            <div className="p-4 bg-[#FFDAD6] border-2 border-[#171717] rounded shadow-brutal flex items-start gap-3">
              <Database className="w-5 h-5 text-[#F12D2D] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading text-sm font-bold uppercase text-[#410002]">
                  PostgreSQL Offline Notice
                </h4>
                <p className="font-body text-xs text-[#5D3F3C] mt-0.5">{dbError}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="p-10 text-center bg-white border-2 border-[#171717] rounded shadow-brutal-md space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FFE23B] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm font-display text-xl font-black">
                ★
              </div>
              <h3 className="font-display text-xl uppercase font-extrabold text-[#171717]">
                No opportunities match your current filters
              </h3>
              <p className="font-body text-xs text-[#5D3F3C] max-w-md mx-auto">
                Try adjusting your search query, selecting &quot;All Streams&quot;, or resetting filters to browse all department hackathons and workshops.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal-sm hover:shadow-brutal cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

          {/* 3-Column Responsive Bento Card Grid */}
          {filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSavedInitially={savedEventIds.includes(event.id)}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
