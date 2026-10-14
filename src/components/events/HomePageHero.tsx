"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Sparkles, CalendarCheck, Award, BookOpen, CheckCircle } from "lucide-react";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { ShinyText } from "@/components/reactbits/ShinyText";
import { Squares } from "@/components/reactbits/Squares";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";

export function HomePageHero() {
  const heroRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      // Respect prefers-reduced-motion
      if (typeof window !== "undefined") {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) return;
      }

      // Entrance animation for hero elements
      const tl = gsap.timeline({
        defaults: { ease: "power2.out", clearProps: "all" },
      });

      tl.from(".hero-badge", {
        opacity: 0,
        y: -10,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".hero-title",
          {
            opacity: 0,
            y: 14,
            duration: 0.5,
            clearProps: "all",
          },
          "-=0.25"
        )
        .from(
          ".hero-desc",
          {
            opacity: 0,
            y: 10,
            duration: 0.45,
            clearProps: "all",
          },
          "-=0.3"
        )
        .from(
          ".hero-pillar",
          {
            opacity: 0,
            y: 12,
            stagger: 0.08,
            duration: 0.4,
            clearProps: "all",
          },
          "-=0.2"
        );
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative bg-white rounded-xl border border-[#DAD7CD] shadow-xs overflow-hidden"
    >
      {/* Subtle Botanical Retro Horizon Accent */}
      <div className="h-1 bg-gradient-to-r from-[#344E41] via-[#A3B18A] to-[#C5D86D]" />

      {/* Hero Atmosphere: Topographic Contour Accent + Squares Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* React Bits: Animated Sage Grid Background */}
        <div className="absolute inset-0 opacity-45">
          <Squares
            direction="right"
            speed={0.3}
            borderColor="rgba(163, 177, 138, 0.22)"
            squareSize={48}
            hoverFillColor="rgba(197, 216, 109, 0.15)"
          />
        </div>

        {/* Hero Topographic Flow Lines */}
        <svg
          className="absolute right-0 top-0 w-2/3 h-full stroke-[#344E41] opacity-[0.08] select-none"
          viewBox="0 0 600 300"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 60 C180 20, 320 120, 600 40" strokeWidth="1" />
          <path d="M0 120 C200 80, 360 200, 600 110" strokeWidth="0.85" strokeDasharray="3 3" />
          <path d="M0 180 C220 140, 400 240, 600 180" strokeWidth="0.85" />
          <path d="M0 240 C240 200, 440 280, 600 250" strokeWidth="0.75" />
        </svg>

        {/* Architectural Datum Crosses in Corners */}
        <div className="absolute top-2 left-2 text-[#344E41]/35 font-mono text-[9px] select-none font-bold">+</div>
        <div className="absolute top-2 right-2 text-[#344E41]/35 font-mono text-[9px] select-none font-bold">+</div>
        <div className="absolute bottom-2 left-2 text-[#344E41]/35 font-mono text-[9px] select-none font-bold">+</div>
        <div className="absolute bottom-2 right-2 text-[#344E41]/35 font-mono text-[9px] select-none font-bold">+</div>
      </div>

      <div className="relative z-10 p-5 sm:p-7 space-y-4">
        {/* Top Header Badge & Year */}
        <div className="hero-badge flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#A3B18A]/15 text-[#344E41] border border-[#A3B18A]/35 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#344E41]" />
            <DecryptedText
              text="Rajalakshmi Engineering College • AI & DS Department"
              speed={40}
              maxIterations={8}
              animateOn="hover"
              className="tracking-tight"
            />
          </div>
          <span className="text-xs font-mono font-bold text-[#344E41] bg-[#F5F3EB] px-3 py-1 rounded-full border border-[#DAD7CD] tracking-wide">
            [CYCLE // 2025–2026]
          </span>
        </div>

        {/* Title & Pitch */}
        <div className="max-w-3xl space-y-1.5">
          <h1 className="hero-title text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#202820] tracking-tight leading-tight">
            Opportunities &amp;{" "}
            <ShinyText
              text="Hackathons Portal"
              shimmerColor="rgba(197, 216, 109, 0.85)"
              speed={5}
              className="text-[#344E41] font-extrabold"
            />
          </h1>
          <p className="hero-desc text-xs sm:text-sm text-[#586B5A] leading-relaxed font-medium">
            Discover verified technical hackathons, hands-on workshops, faculty seminars, internship
            openings, and national coding challenges curated exclusively for REC AI &amp; DS students.
          </p>
        </div>

        {/* Department Commitments Ribbon with React Bits SpotlightCards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#DAD7CD]/80 text-xs">
          <div className="hero-pillar">
            <SpotlightCard
              spotlightColor="rgba(52, 78, 65, 0.08)"
              size={220}
              className="bg-[#F5F3EB]/70 p-2.5 rounded-lg border border-[#DAD7CD] transition-all hover:border-[#A3B18A]"
            >
              <div className="flex items-center gap-2 text-[#202820]">
                <CalendarCheck className="w-4 h-4 text-[#344E41] shrink-0" />
                <span className="font-bold text-xs truncate">Verified Deadlines</span>
              </div>
            </SpotlightCard>
          </div>

          <div className="hero-pillar">
            <SpotlightCard
              spotlightColor="rgba(197, 216, 109, 0.16)"
              size={220}
              className="bg-[#F5F3EB]/70 p-2.5 rounded-lg border border-[#DAD7CD] transition-all hover:border-[#A3B18A]"
            >
              <div className="flex items-center gap-2 text-[#202820]">
                <Award className="w-4 h-4 text-[#344E41] shrink-0" />
                <span className="font-bold text-xs truncate">National Contests</span>
              </div>
            </SpotlightCard>
          </div>

          <div className="hero-pillar">
            <SpotlightCard
              spotlightColor="rgba(163, 177, 138, 0.14)"
              size={220}
              className="bg-[#F5F3EB]/70 p-2.5 rounded-lg border border-[#DAD7CD] transition-all hover:border-[#A3B18A]"
            >
              <div className="flex items-center gap-2 text-[#202820]">
                <BookOpen className="w-4 h-4 text-[#344E41] shrink-0" />
                <span className="font-bold text-xs truncate">Hands-on Workshops</span>
              </div>
            </SpotlightCard>
          </div>

          <div className="hero-pillar">
            <SpotlightCard
              spotlightColor="rgba(52, 78, 65, 0.08)"
              size={220}
              className="bg-[#F5F3EB]/70 p-2.5 rounded-lg border border-[#DAD7CD] transition-all hover:border-[#A3B18A]"
            >
              <div className="flex items-center gap-2 text-[#202820]">
                <CheckCircle className="w-4 h-4 text-[#344E41] shrink-0" />
                <span className="font-bold text-xs truncate">Official Registration</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
