"use client";

import { useMemo, useState, useRef } from "react";
import {
  Search,
  Zap,
  RotateCcw,
  Sparkles,
  Database,
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
  title?: string;
  subtitle?: string;
}

export function StudentCatalog({
  initialEvents,
  savedEventIds = [],
  isAuthenticated = false,
  dbError = null,
  title = "Active Opportunities Feed",
  subtitle = "Sanctioned hackathons, symposiums, and engineering sprints for AI & DS scholars",
}: StudentCatalogProps) {
  const catalogRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMode, setSelectedMode] = useState<string>("ALL");

  const filteredEvents = useMemo(() => {
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

      return matchesSearch && matchesCategory && matchesMode;
    });
  }, [initialEvents, search, selectedCategory, selectedMode]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
    setSelectedMode("ALL");
  };

  const isFiltered = search.trim() !== "" || selectedCategory !== "ALL" || selectedMode !== "ALL";

  return (
    <div ref={catalogRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* INTEGRATED CLEAN DISCOVERY HEADER & COMPACT FILTER TOOLBAR */}
      <div className="bg-white rounded-2xl border-2 border-[#171717] p-5 sm:p-6 shadow-brutal-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#1748F5] text-white border-2 border-[#171717] font-heading text-[10px] uppercase font-black rounded shadow-brutal-sm mb-1.5">
            <Zap className="w-3 h-3 text-[#FFE23B]" />
            <span>Verified Feed</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl uppercase text-[#171717] font-black tracking-tight leading-none">
            {title}
          </h2>
          <p className="font-body text-xs text-[#5D3F3C] mt-1">
            {subtitle} •{" "}
            <span className="font-bold text-[#171717]">
              {filteredEvents.length} {filteredEvents.length === 1 ? "opportunity" : "opportunities"}
            </span>
          </p>
        </div>

        {/* Compact Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Compact Search Input */}
          <div className="relative min-w-[200px] sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hackathons..."
              className="w-full bg-[#FFF9E9] text-[#171717] placeholder:text-[#5D3F3C]/60 border-2 border-[#171717] rounded-lg py-2 pl-9 pr-3 font-body text-xs shadow-brutal-sm focus:outline-none focus:bg-white focus:shadow-brutal transition-all"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#171717] pointer-events-none" />
          </div>

          {/* Compact Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FFF9E9] text-[#171717] border-2 border-[#171717] rounded-lg py-2 px-3 font-heading text-xs font-bold uppercase shadow-brutal-sm focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Tracks</option>
            {eventCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Compact Campus Mode Select */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="bg-[#FFF9E9] text-[#171717] border-2 border-[#171717] rounded-lg py-2 px-3 font-heading text-xs font-bold uppercase shadow-brutal-sm focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Modes</option>
            <option value="OFFLINE">On-Campus</option>
            <option value="ONLINE">Online</option>
            <option value="HYBRID">Hybrid</option>
          </select>

          {/* Reset Filters Button if Active */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 bg-white text-[#F12D2D] border-2 border-[#171717] rounded-lg shadow-brutal-sm hover:bg-[#FFF9E9] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0 flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Database Error Banner if Any */}
      {dbError && (
        <div className="p-4 rounded-xl bg-[#FFE23B] border-2 border-[#171717] text-[#171717] text-xs flex items-start gap-3 shadow-brutal-sm">
          <Database className="w-4 h-4 text-[#171717] mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-heading font-extrabold uppercase">Database Connection Notice</p>
            <p className="text-[#5D3F3C]">{dbError}</p>
          </div>
        </div>
      )}

      {/* EVENT OPPORTUNITIES GRID / POLISHED EMPTY STATE */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-[#171717] p-10 sm:p-14 text-center shadow-brutal-md max-w-lg mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-full bg-[#FFE23B] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-brutal-sm">
            <Sparkles className="w-6 h-6 text-[#171717]" />
          </div>
          <h3 className="font-display text-xl uppercase font-black text-[#171717]">
            {initialEvents.length === 0
              ? "No Opportunities Currently Posted"
              : "No Matching Opportunities Found"}
          </h3>
          <p className="font-body text-xs text-[#5D3F3C] leading-relaxed">
            {initialEvents.length === 0
              ? "Department faculty coordinators publish approved hackathons, workshops, and project sprints here as they are sanctioned. Check back shortly."
              : "Try adjusting your search query or selecting 'All Tracks' to view all available opportunities."}
          </p>
          {isFiltered && (
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFE23B] text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      ) : (
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
  );
}
