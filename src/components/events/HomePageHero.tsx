"use client";

import Link from "next/link";
import {
  Zap,
  Rocket,
  Filter,
  Terminal,
  Trophy,
  TrendingUp,
  Users,
  Flame,
  Star,
  CheckCircle,
} from "lucide-react";

export function HomePageHero() {
  return (
    <div className="flex flex-col w-full">
      {/* HIGH VOLTAGE TICKER MARQUEE */}
      <div className="w-full bg-[#FFE23B] text-[#171717] border-y-2 border-[#171717] py-2 overflow-hidden select-none">
        <div className="animate-marquee items-center gap-6 font-heading text-xs uppercase tracking-wider font-extrabold">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-[#171717]" />
            FLASH: REC HACK HORIZON 2025 REGISTRATIONS CLOSING SOON
          </span>
          <span>★</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#171717]" />
            100% OD ATTENDANCE SANCTIONED FOR REGISTERED SQUADS
          </span>
          <span>★</span>
          <span className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#171717]" />
            TOTAL CASH POOL EXCEEDS ₹3.5 LAKHS
          </span>
          <span>★</span>
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#F12D2D]" />
            NVIDIA INCEPTION &amp; INTEL ONEAPI PARTNERSHIP ACTIVE
          </span>
          <span>★</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-[#171717]" />
            FLASH: REC HACK HORIZON 2025 REGISTRATIONS CLOSING SOON
          </span>
          <span>★</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#171717]" />
            100% OD ATTENDANCE SANCTIONED FOR REGISTERED SQUADS
          </span>
        </div>
      </div>

      {/* HERO SECTION WITH RETRO POP-ART Y2K COLLAGE */}
      <section className="w-full relative px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-white border-b-2 border-[#171717] overflow-hidden">
        {/* Soft background accents */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#1748F5]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 -left-12 w-40 h-40 bg-[#F12D2D]/10 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Headline & Subtitle */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Y2K Ribbon / Stickers */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFE23B] text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm -rotate-1">
                <Star className="w-3.5 h-3.5 fill-[#171717]" />
                <span>REC AI &amp; DS HUB</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm rotate-2">
                <span>NO BORING SEMINARS! 🚀</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#1748F5] text-white border-2 border-[#171717] font-heading text-xs uppercase font-extrabold rounded shadow-brutal-sm">
                <span>BATCH 2024-2028</span>
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
                  <span className="inline-block px-3 py-1 text-base sm:text-xl font-heading bg-[#1748F5] text-white border-2 border-[#171717] shadow-brutal-sm rotate-3 align-middle font-black">
                    2025
                  </span>
                </span>
              </h1>
            </div>

            <p className="font-body text-base sm:text-lg text-[#5D3F3C] max-w-2xl leading-relaxed font-normal">
              Exclusive Hackathons, High-Impact Research Labs &amp; Top Internships curated for REC Artificial Intelligence &amp; Data Science Scholars. Zero fluff. Pure engineering momentum.
            </p>

            {/* CTA Buttons Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#events-grid"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-sm uppercase tracking-wider rounded shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-bold"
              >
                <Rocket className="w-5 h-5 text-[#FFE23B]" />
                <span>Explore Hackathons</span>
              </a>
              <a
                href="#retro-filter-bar"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white text-[#171717] border-2 border-[#171717] font-heading text-sm uppercase tracking-wider rounded shadow-brutal hover:bg-[#E9E2D5] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-bold"
              >
                <Filter className="w-4 h-4 text-[#1748F5]" />
                <span>Filter by Stream</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Graphic Poster Art Collage */}
          <div className="lg:col-span-4 relative flex justify-center">
            {/* Offset Layer Card */}
            <div className="relative w-full max-w-sm bg-white border-2 border-[#171717] shadow-brutal-xl p-4 rounded">
              {/* Pop Header Bar */}
              <div className="flex items-center justify-between bg-[#1748F5] text-white px-3 py-1.5 border-2 border-[#171717] mb-3">
                <span className="font-heading text-xs uppercase font-extrabold tracking-wider">
                  REC-AI ENGINE v2.5
                </span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F12D2D] border border-[#171717]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFE23B] border border-[#171717]" />
                </div>
              </div>

              {/* Poster Graphic Container */}
              <div className="relative w-full h-64 overflow-hidden border-2 border-[#171717] rounded bg-[#E9E2D5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="Vibrant pop-art tech student hacker at REC"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlPoKFoXiL-mzkL5HUWQAM1t5L9SGlTecQzlX-o0maZcIzqKRMsO9uTwThon393dyGV_EsyKkxYVHZ-umG-PWmvKBKibyvmxdu9fEVceFM1WW6jXzg78pddtNtH_Jml9BJEc_bpVW64hP5Xwft6pR7ZdBJGmqQb00CRwh4bAxqoiOzW9N_L2FZnKFPrGpKUm-Bgm1yDepj1XlvGANPDlPjrkn3ebqpPAGstvGLLRPnVU5fM_eNDz36"
                />
                {/* Graphic Stickers Floating Over Image */}
                <div className="absolute top-3 left-3 bg-[#FFE23B] text-[#171717] border-2 border-[#171717] px-2.5 py-0.5 font-heading text-[11px] font-extrabold uppercase rounded shadow-brutal-sm -rotate-6">
                  FOMO? NO! BUILD!
                </div>
                <div className="absolute bottom-3 right-3 bg-[#F12D2D] text-white border-2 border-[#171717] px-3 py-1 font-heading text-[11px] font-extrabold uppercase rounded shadow-brutal-sm rotate-3 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>AI/ML APPROVED</span>
                </div>
              </div>

              {/* Bottom Micro Note */}
              <div className="mt-3 flex items-center justify-between text-[#171717]">
                <div className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase">
                  <Zap className="w-4 h-4 text-[#F12D2D]" />
                  <span>AUTONOMOUS CELL</span>
                </div>
                <span className="font-heading text-xs text-[#5D3F3C] font-bold">REC // 2025</span>
              </div>
            </div>

            {/* Pop Badge Floating Sticker Behind/Side */}
            <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-[#D9FF38] text-[#171717] border-2 border-[#171717] px-3 py-1.5 rounded shadow-brutal-md rotate-6 items-center gap-1.5 z-20 font-heading text-xs font-black uppercase">
              <Flame className="w-4 h-4 text-[#F12D2D]" />
              <span>100% OD SANCTIONED</span>
            </div>
          </div>
        </div>

        {/* STATS BAR - VINTAGE PRINTED BADGES */}
        <div className="max-w-7xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-[#FFF9E9] border-2 border-[#171717] p-4 rounded shadow-brutal hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-[#FFE23B] text-[#171717] border border-[#171717] font-heading text-[10px] uppercase font-bold rounded">
                LIVE
              </span>
              <Terminal className="w-5 h-5 text-[#F12D2D]" />
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl sm:text-4xl font-black text-[#171717] leading-none block">
                14+
              </span>
              <span className="font-heading text-xs uppercase font-bold text-[#5D3F3C] tracking-wider mt-1 block">
                Active Hackathons
              </span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-[#1748F5] text-white border-2 border-[#171717] p-4 rounded shadow-brutal hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-white text-[#1748F5] border border-[#171717] font-heading text-[10px] uppercase font-bold rounded">
                GRANTS
              </span>
              <Trophy className="w-5 h-5 text-[#FFE23B]" />
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl sm:text-4xl font-black text-white leading-none block">
                ₹3.5L+
              </span>
              <span className="font-heading text-xs uppercase font-bold text-white/90 tracking-wider mt-1 block">
                Cash Prize Pool
              </span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-[#F12D2D] text-white border-2 border-[#171717] p-4 rounded shadow-brutal hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-white text-[#F12D2D] border border-[#171717] font-heading text-[10px] uppercase font-bold rounded">
                METRICS
              </span>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl sm:text-4xl font-black text-white leading-none block">
                98%
              </span>
              <span className="font-heading text-xs uppercase font-bold text-white/90 tracking-wider mt-1 block">
                Placement Impact
              </span>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-[#FFE23B] text-[#171717] border-2 border-[#171717] p-4 rounded shadow-brutal hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-[#171717] text-[#FFE23B] border border-[#171717] font-heading text-[10px] uppercase font-bold rounded">
                COMMUNITY
              </span>
              <Users className="w-5 h-5 text-[#171717]" />
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl sm:text-4xl font-black text-[#171717] leading-none block">
                1,240+
              </span>
              <span className="font-heading text-xs uppercase font-bold text-[#171717]/80 tracking-wider mt-1 block">
                Active REC Builders
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
