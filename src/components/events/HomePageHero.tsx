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
      className="relative bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden"
    >
      {/* Decorative Brand Gradient Accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#002244] via-[#003366] to-[#C5A059]" />

      {/* React Bits: Animated Squares Grid Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <Squares
          direction="right"
          speed={0.4}
          borderColor="rgba(0, 34, 68, 0.05)"
          squareSize={48}
          hoverFillColor="rgba(197, 160, 89, 0.12)"
        />
      </div>

      <div className="relative z-10 p-5 sm:p-7 space-y-4">
        {/* Top Header Badge & Year */}
        <div className="hero-badge flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#002244]/5 text-[#003366] border border-[#003366]/15 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <DecryptedText
              text="Rajalakshmi Engineering College • AI & DS Department"
              speed={40}
              maxIterations={8}
              animateOn="hover"
              className="tracking-tight"
            />
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/80">
            Academic Year 2025–2026
          </span>
        </div>

        {/* Title & Pitch */}
        <div className="max-w-3xl space-y-1.5">
          <h1 className="hero-title text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Opportunities &amp;{" "}
            <ShinyText
              text="Hackathons Portal"
              shimmerColor="rgba(197, 160, 89, 0.85)"
              speed={4}
              className="text-slate-900 font-extrabold"
            />
          </h1>
          <p className="hero-desc text-xs sm:text-sm text-slate-600 leading-relaxed">
            Discover verified technical hackathons, hands-on workshops, faculty seminars, internship
            openings, and national coding challenges curated exclusively for REC AI &amp; DS students.
          </p>
        </div>

        {/* Department Commitments Ribbon with React Bits SpotlightCards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100/90 text-xs">
          <div className="hero-pillar">
            <SpotlightCard
              spotlightColor="rgba(16, 185, 129, 0.12)"
              size={220}
              className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 transition-all hover:border-emerald-300"
            >
              <div className="flex items-center gap-2 text-slate-700">
                <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[11px] truncate">Verified Deadlines</span>
              </div>
            </SpotlightCard>
          </div>

          <div className="hero-pillar">
            <SpotlightCard
              spotlightColor="rgba(197, 160, 89, 0.18)"
              size={220}
              className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 transition-all hover:border-[#C5A059]/40"
            >
              <div className="flex items-center gap-2 text-slate-700">
                <Award className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span className="font-semibold text-[11px] truncate">National Contests</span>
              </div>
            </SpotlightCard>
          </div>

          <div className="hero-pillar">
            <SpotlightCard
              spotlightColor="rgba(2, 132, 199, 0.12)"
              size={220}
              className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 transition-all hover:border-sky-300"
            >
              <div className="flex items-center gap-2 text-slate-700">
                <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-semibold text-[11px] truncate">Hands-on Workshops</span>
              </div>
            </SpotlightCard>
          </div>

          <div className="hero-pillar">
            <SpotlightCard
              spotlightColor="rgba(79, 70, 229, 0.12)"
              size={220}
              className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 transition-all hover:border-indigo-300"
            >
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-[11px] truncate">Official Registration</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
