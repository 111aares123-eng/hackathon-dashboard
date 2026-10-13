"use client";

import Link from "next/link";
import {
  Zap,
  Rocket,
  Bookmark,
  Terminal,
  Calendar,
  Users,
  Star,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

interface HomePageHeroProps {
  stats?: {
    activeEventsCount: number;
    totalStudentsCount: number;
    approvedFacultyCount: number;
    upcomingDeadlinesCount: number;
  };
  announcements?: string[];
}

export function HomePageHero({
  stats = {
    activeEventsCount: 0,
    totalStudentsCount: 0,
    approvedFacultyCount: 0,
    upcomingDeadlinesCount: 0,
  },
  announcements = [],
}: HomePageHeroProps) {
  return (
    <div className="flex flex-col w-full">
      {/* HIGH VOLTAGE TICKER MARQUEE */}
      <div className="w-full bg-[#FFE23B] text-[#171717] border-y-2 border-[#171717] py-2 overflow-hidden select-none">
        <div className="animate-marquee items-center gap-6 font-heading text-xs uppercase tracking-wider font-extrabold flex">
          {announcements.length > 0 ? (
            announcements.map((ann, i) => (
              <span key={i} className="flex items-center gap-2 shrink-0">
                <Zap className="w-4 h-4 fill-[#171717]" />
                <span>{ann}</span>
                <span>★</span>
              </span>
            ))
          ) : (
            <span className="flex items-center gap-2 shrink-0">
              <Zap className="w-4 h-4 fill-[#171717]" />
              <span>DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE</span>
              <span>★</span>
              <CheckCircle className="w-4 h-4 text-[#171717]" />
              <span>100% OD ATTENDANCE SANCTIONED FOR REGISTERED SQUADS</span>
              <span>★</span>
              <span>NAAC A++ ACCREDITED • ANNA UNIVERSITY AFFILIATED</span>
              <span>★</span>
            </span>
          )}
          {/* Repeated items for continuous smooth marquee flow */}
          <span className="flex items-center gap-2 shrink-0">
            <CheckCircle className="w-4 h-4 text-[#171717]" />
            <span>ON-DUTY ATTENDANCE POLICY FULLY SANCTIONED</span>
            <span>★</span>
            <Star className="w-4 h-4 fill-[#171717]" />
            <span>RAJALAKSHMI ENGINEERING COLLEGE (AUTONOMOUS)</span>
            <span>★</span>
          </span>
        </div>
      </div>

      {/* REBALANCED HERO SECTION (CLEAN NEO-BRUTALIST EDITORIAL CANVAS) */}
      <section className="w-full relative px-4 sm:px-6 lg:px-8 py-10 sm:py-16 bg-white border-b-2 border-[#171717] overflow-hidden">
        {/* Soft background accents */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#1748F5]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 -left-12 w-40 h-40 bg-[#F12D2D]/10 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col gap-6 relative z-10">
          {/* Y2K Ribbon / Stickers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE23B] text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm -rotate-1">
              <Star className="w-3.5 h-3.5 fill-[#171717]" />
              <span>REC AI &amp; DS HUB</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm rotate-1">
              <span>ACCREDITED MATRIX ⚡</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1748F5] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm">
              <span>BATCH 2024-2028</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D9FF38] text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm -rotate-1">
              <span>100% OD APPROVED</span>
            </div>
          </div>

          {/* 3D Layered Typography */}
          <div className="relative">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-[#171717] leading-[0.95] select-none font-black">
              SUPERCHARGE<br />
              <span className="text-[#F12D2D] relative inline-block my-1">
                YOUR AI &amp; DATA
                <span className="absolute -bottom-1 left-0 w-full h-3 sm:h-4 bg-[#FFE23B] -z-10 transform -rotate-1" />
              </span>
              <br />
              <span className="inline-flex items-center gap-3">
                JOURNEY
                <span className="inline-block px-3.5 py-1 text-base sm:text-2xl font-heading bg-[#1748F5] text-white border-2 border-[#171717] shadow-brutal-sm rotate-2 align-middle font-black">
                  2025
                </span>
              </span>
            </h1>
          </div>

          <p className="font-body text-base sm:text-lg text-[#5D3F3C] max-w-3xl leading-relaxed font-normal">
            Verified Hackathons, High-Impact Technical Competitions &amp; Departmental Engineering Sprints curated exclusively for REC Artificial Intelligence &amp; Data Science Scholars. Zero fluff. Pure engineering momentum.
          </p>

          {/* CTA Action Buttons Group */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-sm uppercase tracking-wider rounded shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-bold"
            >
              <Rocket className="w-5 h-5 text-[#FFE23B]" />
              <span>Explore All Hackathons</span>
            </Link>
            <Link
              href="/saved"
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-white text-[#171717] border-2 border-[#171717] font-heading text-sm uppercase tracking-wider rounded shadow-brutal hover:bg-[#E9E2D5] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-bold"
            >
              <Bookmark className="w-4 h-4 text-[#1748F5]" />
              <span>Student Vault</span>
            </Link>
          </div>
        </div>

        {/* LIVE DATABASE METRICS BAR - CALCULATED FROM POSTGRESQL */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1: Real Active Opportunities Count */}
          <div className="bg-[#FFF9E9] border-2 border-[#171717] p-4 rounded shadow-brutal hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-[#FFE23B] text-[#171717] border border-[#171717] font-heading text-[10px] uppercase font-bold rounded">
                LIVE
              </span>
              <Terminal className="w-4 h-4 text-[#F12D2D]" />
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl sm:text-4xl font-black text-[#171717] leading-none block">
                {stats.activeEventsCount}
              </span>
              <span className="font-heading text-xs uppercase font-bold text-[#5D3F3C] tracking-wider mt-1 block">
                Active Opportunities
              </span>
            </div>
          </div>

          {/* Stat 2: Real Upcoming Deadlines Count */}
          <div className="bg-[#1748F5] text-white border-2 border-[#171717] p-4 rounded shadow-brutal hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-white text-[#1748F5] border border-[#171717] font-heading text-[10px] uppercase font-bold rounded">
                OPEN NOW
              </span>
              <Calendar className="w-4 h-4 text-[#FFE23B]" />
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl sm:text-4xl font-black text-white leading-none block">
                {stats.upcomingDeadlinesCount}
              </span>
              <span className="font-heading text-xs uppercase font-bold text-white/90 tracking-wider mt-1 block">
                Open Deadlines
              </span>
            </div>
          </div>

          {/* Stat 3: Real Registered Scholars Count */}
          <div className="bg-[#FFE23B] text-[#171717] border-2 border-[#171717] p-4 rounded shadow-brutal hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-[#171717] text-[#FFE23B] border border-[#171717] font-heading text-[10px] uppercase font-bold rounded">
                COMMUNITY
              </span>
              <Users className="w-4 h-4 text-[#171717]" />
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl sm:text-4xl font-black text-[#171717] leading-none block">
                {stats.totalStudentsCount}
              </span>
              <span className="font-heading text-xs uppercase font-bold text-[#171717]/80 tracking-wider mt-1 block">
                Enrolled Scholars
              </span>
            </div>
          </div>

          {/* Stat 4: Real Approved Faculty Mentors Count */}
          <div className="bg-white border-2 border-[#171717] p-4 rounded shadow-brutal hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-[#D9FF38] text-[#171717] border border-[#171717] font-heading text-[10px] uppercase font-bold rounded">
                FACULTY
              </span>
              <GraduationCap className="w-4 h-4 text-[#1748F5]" />
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl sm:text-4xl font-black text-[#171717] leading-none block">
                {stats.approvedFacultyCount}
              </span>
              <span className="font-heading text-xs uppercase font-bold text-[#5D3F3C] tracking-wider mt-1 block">
                Faculty Mentors
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
