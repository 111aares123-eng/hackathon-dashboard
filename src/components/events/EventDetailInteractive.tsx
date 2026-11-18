"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Pin,
  Check,
  Bookmark,
  Share2,
  CalendarPlus,
  FileText,
  MessageSquare,
  Zap,
  Users,
  Award,
  Loader2,
  Star,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { toggleSaveEventAction } from "@/lib/events/saved-actions";
import type { Event } from "@/db/schema";

interface EventDetailInteractiveProps {
  event: Event;
  isSavedInitially: boolean;
  isAuthenticated: boolean;
}

export function EventDetailInteractive({
  event,
  isSavedInitially,
  isAuthenticated,
}: EventDetailInteractiveProps) {
  const router = useRouter();
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [isSaved, setIsSaved] = useState(isSavedInitially);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: "01",
    hours: "14",
    minutes: "28",
    seconds: "12",
  });

  // Live countdown calculation
  useEffect(() => {
    const targetDate = new Date(event.registrationDeadline).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        clearInterval(interval);
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [event.registrationDeadline]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${event.slug}`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await toggleSaveEventAction(event.id);
      if (res.success && typeof res.isSaved === "boolean") {
        setIsSaved(res.isSaved);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddToCalendar = () => {
    const startIso = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endIso = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(
      event.summary
    )}&location=${encodeURIComponent(event.venue)}`;

    window.open(gCalUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* 7:5 Asymmetrical Editorial Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN (7 COLS): Deep Details & Editorial Splash ================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* MEGA EDITORIAL BANNER */}
          <div className="relative bg-white p-5 sm:p-7 rounded border-2 border-[#171717] shadow-brutal-lg overflow-hidden">
            {/* Pop-Art Background Accents */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#FFE23B] rounded-full blur-2xl opacity-60 pointer-events-none" />
            <div className="absolute right-4 top-4 hidden sm:flex flex-col items-center rotate-6 pointer-events-none z-10">
              <div className="w-16 h-16 bg-[#F12D2D] text-white rounded-full flex flex-col items-center justify-center font-heading text-xs text-center font-black uppercase leading-tight shadow-brutal-sm">
                <span>36 HR</span>
                <span className="text-[9px]">NONSTOP</span>
              </div>
            </div>

            {/* Sticker Collage Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
              <span className="bg-[#F12D2D] text-white font-heading text-xs uppercase px-2.5 py-1 rounded shadow-brutal-sm inline-flex items-center gap-1 font-black">
                <Flame className="w-3.5 h-3.5 fill-white" /> FLAGSHIP 2025
              </span>
              <span className="bg-[#1748F5] text-white font-heading text-xs uppercase px-2.5 py-1 rounded shadow-brutal-sm font-bold">
                OFFICIAL REC HACKATHON
              </span>
              <span className="bg-[#FFE23B] text-[#171717] font-heading text-xs uppercase px-2.5 py-1 rounded shadow-brutal-sm font-bold">
                {event.mode} • CAMPUS FINALE
              </span>
            </div>

            {/* Hero Typography Headline */}
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-[#171717] leading-[1.05] mb-3 font-black">
              {event.title}:{" "}
              <span className="bg-[#F12D2D] text-white px-2 rounded inline-block my-1 shadow-brutal-sm">
                {event.category}
              </span>
            </h1>

            <p className="font-body text-base text-[#5D3F3C] font-normal leading-relaxed mb-4">
              {event.summary}
            </p>

            {/* Editorial Photo Art with Y2K Cutout Stickers */}
            <div className="relative w-full h-64 sm:h-80 rounded overflow-hidden border-2 border-[#171717] shadow-brutal-md mb-4 bg-[#E9E2D5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover"
                alt="Hackathon workspace at REC"
                src={
                  event.bannerUrl ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCI78-iWqnSxFeje_Hv1ipdgg4qgA4_ye-GkGuiga3nmYHLfm_rfBufFZ0tWllH24HJN2XvzIjRCO_TGde8DHhAt9w4BosV6n8PMsqdOqZ1EftO4YFu4MrVy9rM1OYoXhtRiAwp9gH-N-jmwgQFsEGsoCrxH2mCfzDJUvy8optquZJO2KM-vLLfulPj9scR0FfQ6uTUJ_ioaCHrvKhuG87pTgFtxyyfvYLieB5Rs5J5owZmaPqtLSAp"
                }
              />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-3 rounded border-2 border-[#171717] shadow-brutal-sm max-w-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#F12D2D]" />
                  <div>
                    <div className="font-heading text-xs text-[#171717] uppercase font-bold">
                      HOD Sanction Verified
                    </div>
                    <div className="font-body text-[11px] text-[#5D3F3C]">
                      Full OD for REC Autonomous cohorts
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-3 right-3 bg-[#FFE23B] text-[#171717] px-3 py-1 font-heading text-xs uppercase font-black rounded border-2 border-[#171717] shadow-brutal-sm -rotate-3">
                100+ TEAMS COMPETING
              </div>
            </div>

            {/* Academic Sanction Banner */}
            <div className="bg-[#FFF9E9] p-3 rounded border-2 border-[#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#1748F5] text-white flex items-center justify-center font-display font-black shadow-brutal-sm shrink-0">
                  REC
                </div>
                <div>
                  <span className="font-heading text-xs text-[#171717] uppercase block font-bold">
                    Organized by {event.organizer}
                  </span>
                  <span className="font-body text-xs text-[#5D3F3C]">
                    Department of AI &amp; DS, Rajalakshmi Engineering College
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-[#D9FF38] text-[#171717] font-heading text-xs uppercase font-black rounded border-2 border-[#171717] shadow-brutal-sm">
                <Check className="w-4 h-4 text-[#171717]" /> 100% OD SANCTIONED
              </span>
            </div>
          </div>

          {/* DETAILED GUIDELINES */}
          <div className="bg-white p-5 sm:p-7 rounded border-2 border-[#171717] shadow-brutal-lg flex flex-col gap-4">
            <h2 className="font-display text-xl uppercase text-[#171717] font-black tracking-tight">
              Detailed Description &amp; Requirements
            </h2>
            <div className="font-body text-sm text-[#5D3F3C] leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* 36-HOUR PROTOCOL SCHEDULE */}
          <div className="bg-white p-5 sm:p-7 rounded border-2 border-[#171717] shadow-brutal-lg">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div>
                <span className="font-heading text-xs uppercase text-[#F12D2D] font-extrabold tracking-wider">
                  HACKATHON PROTOCOL
                </span>
                <h2 className="font-display text-xl uppercase text-[#171717] font-black">
                  36-Hour Step Breakdown
                </h2>
              </div>
              <div className="flex items-center gap-1 bg-[#E9E2D5] p-1 rounded-full border border-[#171717]">
                <button
                  type="button"
                  onClick={() => setActiveDay(1)}
                  className={`px-3 py-1 font-heading text-xs uppercase rounded-full cursor-pointer transition-all ${
                    activeDay === 1
                      ? "bg-[#F12D2D] text-white shadow-brutal-sm font-bold"
                      : "text-[#171717] hover:bg-white"
                  }`}
                >
                  DAY 01
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDay(2)}
                  className={`px-3 py-1 font-heading text-xs uppercase rounded-full cursor-pointer transition-all ${
                    activeDay === 2
                      ? "bg-[#F12D2D] text-white shadow-brutal-sm font-bold"
                      : "text-[#171717] hover:bg-white"
                  }`}
                >
                  DAY 02
                </button>
              </div>
            </div>

            {/* Schedule Container */}
            {activeDay === 1 ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#FFF9E9] rounded border-2 border-[#171717] shadow-brutal-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded bg-[#F12D2D] text-white font-heading font-black text-sm flex items-center justify-center shadow-brutal-sm shrink-0">
                      01
                    </span>
                    <div>
                      <h3 className="font-heading text-sm text-[#171717] uppercase font-bold">
                        Problem Statement Reveal &amp; Ideation
                      </h3>
                      <p className="font-body text-xs text-[#5D3F3C]">
                        Central Computing Lab Auditorium • Secret Industry Tracks Unlocked
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#FFE23B] text-[#171717] px-2.5 py-1 rounded font-heading text-xs font-bold border border-[#171717] shadow-brutal-sm whitespace-nowrap">
                    09:00 AM IST
                  </span>
                </div>

                <div className="p-3 bg-[#FFF9E9] rounded border-2 border-[#171717] shadow-brutal-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded bg-[#1748F5] text-white font-heading font-black text-sm flex items-center justify-center shadow-brutal-sm shrink-0">
                      02
                    </span>
                    <div>
                      <h3 className="font-heading text-sm text-[#171717] uppercase font-bold">
                        Mentor Round 1 &amp; Architecture Review
                      </h3>
                      <p className="font-body text-xs text-[#5D3F3C]">
                        Faculty + Industry AI Practitioners • Schema Validation
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#E9E2D5] text-[#171717] px-2.5 py-1 rounded font-heading text-xs font-bold border border-[#171717] shadow-brutal-sm whitespace-nowrap">
                    06:00 PM IST
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-[#FFF9E9] rounded border-2 border-[#171717] shadow-brutal-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded bg-[#6D5E00] text-white font-heading font-black text-sm flex items-center justify-center shadow-brutal-sm shrink-0">
                      03
                    </span>
                    <div>
                      <h3 className="font-heading text-sm text-[#171717] uppercase font-bold">
                        Midnight Sprint &amp; Caffeine Blast
                      </h3>
                      <p className="font-body text-xs text-[#5D3F3C]">
                        Live Debugging Assist • Midnight Snack Bar by REC Canteen
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#F12D2D] text-white px-2.5 py-1 rounded font-heading text-xs font-bold border border-[#171717] shadow-brutal-sm whitespace-nowrap">
                    02:00 AM IST
                  </span>
                </div>

                <div className="p-3 bg-[#FFF9E9] rounded border-2 border-[#171717] shadow-brutal-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded bg-[#F12D2D] text-white font-heading font-black text-sm flex items-center justify-center shadow-brutal-sm shrink-0">
                      04
                    </span>
                    <div>
                      <h3 className="font-heading text-sm text-[#171717] uppercase font-bold">
                        Final Jury Pitch &amp; Live Prototype Demo
                      </h3>
                      <p className="font-body text-xs text-[#5D3F3C]">
                        5 Min Pitch + 3 Min Live Query Test before Executive Panel
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#FFE23B] text-[#171717] px-2.5 py-1 rounded font-heading text-xs font-bold border border-[#171717] shadow-brutal-sm whitespace-nowrap">
                    04:00 PM IST
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ELIGIBILITY & TEAM CONSTRAINTS CARD */}
          <div className="bg-white p-5 sm:p-7 rounded border-2 border-[#171717] shadow-brutal-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-6 h-6 text-[#F12D2D]" />
              <h2 className="font-display text-xl uppercase text-[#171717] font-black">
                Eligibility &amp; Team Constraints
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-[#FFF9E9] p-3 rounded border-2 border-[#171717] shadow-brutal-sm">
                <span className="font-heading text-[11px] uppercase text-[#F12D2D] font-extrabold block">
                  DISCIPLINES
                </span>
                <p className="font-body text-xs text-[#171717] font-bold mt-1">
                  {event.eligibility || "B.E / B.Tech / M.Tech AI & DS, CSE, IT, ECE Scholars."}
                </p>
              </div>

              <div className="bg-[#FFF9E9] p-3 rounded border-2 border-[#171717] shadow-brutal-sm">
                <span className="font-heading text-[11px] uppercase text-[#1748F5] font-extrabold block">
                  TEAM SIZES
                </span>
                <p className="font-body text-xs text-[#171717] font-bold mt-1">
                  2 to 4 Members. Inter-department &amp; Inter-college allowed.
                </p>
              </div>

              <div className="bg-[#FFF9E9] p-3 rounded border-2 border-[#171717] shadow-brutal-sm">
                <span className="font-heading text-[11px] uppercase text-[#6D5E00] font-extrabold block">
                  CODE REPO
                </span>
                <p className="font-body text-xs text-[#171717] font-bold mt-1">
                  Forked strictly from REC AI &amp; DS GitHub Starter Template.
                </p>
              </div>
            </div>

            {/* Rubric Weightages */}
            <div className="bg-[#E9E2D5] p-3.5 rounded border-2 border-[#171717]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-xs uppercase font-extrabold text-[#171717]">
                  Rubric Weightages
                </span>
                <span className="font-heading text-[10px] text-[#5D3F3C] font-bold">
                  100 PTS TOTAL
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-white p-2 rounded border border-[#171717] shadow-brutal-sm text-center">
                  <span className="font-display text-xl text-[#F12D2D] font-black block">30%</span>
                  <span className="font-heading text-[10px] text-[#171717] uppercase font-bold">Innovation</span>
                </div>
                <div className="bg-white p-2 rounded border border-[#171717] shadow-brutal-sm text-center">
                  <span className="font-display text-xl text-[#1748F5] font-black block">30%</span>
                  <span className="font-heading text-[10px] text-[#171717] uppercase font-bold">Tech Depth</span>
                </div>
                <div className="bg-white p-2 rounded border border-[#171717] shadow-brutal-sm text-center">
                  <span className="font-display text-xl text-[#6D5E00] font-black block">25%</span>
                  <span className="font-heading text-[10px] text-[#171717] uppercase font-bold">Live Demo</span>
                </div>
                <div className="bg-white p-2 rounded border border-[#171717] shadow-brutal-sm text-center">
                  <span className="font-display text-xl text-[#171717] font-black block">15%</span>
                  <span className="font-heading text-[10px] text-[#171717] uppercase font-bold">Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (5 COLS): Sticky Registration & Logistics ================= */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          {/* MAIN ACTION STICKY TILE */}
          <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-xl overflow-hidden">
            {/* Yellow Header Accent with Blinking Countdown */}
            <div className="bg-[#FFE23B] text-[#171717] p-4 border-b-2 border-[#171717] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-heading text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F12D2D] animate-ping" />
                  LIVE COUNTDOWN TIMER
                </span>
                <span className="font-heading text-[10px] font-bold bg-white text-[#171717] px-2 py-0.5 rounded border border-[#171717] shadow-brutal-sm">
                  PORTAL CLOUD V4.2
                </span>
              </div>
              {/* BIG MONOSPACE DIGITS */}
              <div className="font-display text-2xl sm:text-3xl tracking-tight font-black uppercase mt-1">
                {timeLeft.days}<span className="text-[#5D3F3C] font-normal text-lg">D</span> :{" "}
                {timeLeft.hours}<span className="text-[#5D3F3C] font-normal text-lg">H</span> :{" "}
                {timeLeft.minutes}<span className="text-[#5D3F3C] font-normal text-lg">M</span> :{" "}
                {timeLeft.seconds}<span className="text-[#5D3F3C] font-normal text-lg">S</span>
              </div>
            </div>

            {/* Inside Container Details */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Quick Value Specs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#FFF9E9] rounded border border-[#171717] shadow-brutal-sm">
                  <span className="font-heading text-[10px] text-[#5D3F3C] uppercase font-bold block">
                    PRIZE MATRIX
                  </span>
                  <span className="font-display text-lg text-[#F12D2D] font-black block truncate">
                    {event.prizes || "Trophy + Certs"}
                  </span>
                </div>
                <div className="p-3 bg-[#FFF9E9] rounded border border-[#171717] shadow-brutal-sm">
                  <span className="font-heading text-[10px] text-[#5D3F3C] uppercase font-bold block">
                    ENTRY FEE
                  </span>
                  <span className="font-display text-lg text-[#1748F5] font-black block">
                    {event.fee || "Free"}
                  </span>
                </div>
              </div>

              {/* Slot Capacity Progress Bar */}
              <div className="p-3 bg-[#E9E2D5] rounded border border-[#171717]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-heading text-xs uppercase font-extrabold text-[#171717] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#F12D2D]" />
                    Capacity Tracker
                  </span>
                  <span className="font-heading text-xs font-black text-[#F12D2D]">
                    86 / 100 SLOTS TAKEN
                  </span>
                </div>
                <div className="w-full h-3 bg-white border border-[#171717] rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-[#F12D2D] rounded-full" style={{ width: "86%" }} />
                </div>
                <span className="font-body text-[11px] text-[#5D3F3C] block mt-1.5">
                  Only 14 team slots available before portal lockout!
                </span>
              </div>

              {/* Venue Details Snippet */}
              <div className="p-3 bg-[#FFF9E9] rounded border border-[#171717] shadow-brutal-sm flex items-start gap-2.5">
                <Pin className="w-5 h-5 text-[#1748F5] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-heading text-xs uppercase text-[#171717] font-bold">
                    PHYSICAL VENUE
                  </span>
                  <p className="font-body text-xs text-[#5D3F3C] leading-snug mt-0.5">
                    {event.venue || "Central Computing Lab & AI Innovation Center, Block 3, REC Chennai"}
                  </p>
                </div>
              </div>

              {/* Campus Miniature Blueprint */}
              <div className="relative w-full h-32 rounded border border-[#171717] overflow-hidden shadow-brutal-sm bg-[#E9E2D5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="REC Campus Map"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuCCwpGs3vsLx3fV_sVWmRTqN5mSRgpJi_uGCQCwZI_mqCvWinWZJ-7jtmt5lLU2TmGGz8A4FRN9ghTkL4uhWvUur9c4ImagU2R8u8cnfXCtDLMP3KiCbgPTCPMWpju-w7n1wiCoHMGpffXZxZwAb65EGpzj_hIr-sKoKSNtqk813UEeNMRkTEutWivQcP7Vb8io-PTzTnSPZO6Gt56n9CbvHO0Ueh64rG1CboTb7ATjxjL9jD_fHv"
                />
                <div className="absolute bottom-2 left-2 bg-white/95 px-2 py-0.5 rounded border border-[#171717] shadow-brutal-sm font-heading text-[10px] uppercase font-bold text-[#171717]">
                  REC CAMPUS NAV ACTIVE
                </div>
              </div>

              {/* CTAS: Action Stack */}
              <div className="space-y-2 pt-1">
                {/* Giant Primary Registration Button */}
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#F12D2D] text-white font-heading text-sm uppercase tracking-wider font-extrabold rounded border-2 border-[#171717] shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 text-center"
                >
                  <Zap className="w-4 h-4 text-[#FFE23B]" />
                  <span>REGISTER NOW (OFFICIAL)</span>
                </a>

                {/* Secondary: Calendar Button */}
                <button
                  type="button"
                  onClick={handleAddToCalendar}
                  className="w-full py-2.5 px-4 bg-white text-[#171717] font-heading text-xs uppercase font-bold rounded border-2 border-[#171717] shadow-brutal-sm hover:bg-[#E9E2D5] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-[#1748F5]" />
                  <span>ADD TO GOOGLE CALENDAR</span>
                </button>

                {/* Tertiary: Bookmark Button */}
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 bg-[#FFE23B] text-[#171717] font-heading text-xs uppercase font-bold rounded border-2 border-[#171717] shadow-brutal-sm hover:brightness-105 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#171717]" />
                  ) : (
                    <Bookmark
                      className={`w-4 h-4 ${isSaved ? "fill-[#171717]" : ""}`}
                    />
                  )}
                  <span>{isSaved ? "SAVED IN VAULT ⭐" : "SAVE TO STUDENT VAULT"}</span>
                </button>
              </div>

              {/* Share Pills */}
              <div className="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-[#171717]/10">
                <span className="font-heading text-xs uppercase text-[#5D3F3C] font-bold">
                  INVITE SQUAD:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 bg-[#E9E2D5] text-[#171717] rounded border border-[#171717] shadow-brutal-sm font-heading text-xs uppercase font-bold hover:bg-white cursor-pointer"
                  >
                    {copied ? "COPIED! ✓" : "COPY LINK"}
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Check out ${event.title} at REC AI & DS Portal: ` +
                        (typeof window !== "undefined" ? window.location.href : "")
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-[#1748F5] text-white rounded border border-[#171717] shadow-brutal-sm font-heading text-xs uppercase font-bold hover:brightness-110"
                  >
                    WHATSAPP
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Y2K Pep Sticker Tile */}
          <div className="bg-[#E9E2D5] p-4 rounded border-2 border-[#171717] shadow-brutal-md flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-display text-sm uppercase text-[#171717] font-black leading-none">
                NO SLEEP? NO PROBLEM!
              </span>
              <span className="font-body text-xs text-[#5D3F3C] mt-1">
                Unlimited coffee &amp; computing servers provided on-site.
              </span>
            </div>
            <div className="w-10 h-10 bg-[#F12D2D] text-white rounded-full flex items-center justify-center font-black text-lg shadow-brutal-sm rotate-12 shrink-0">
              ★
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
