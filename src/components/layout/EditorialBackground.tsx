"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface EditorialBackgroundProps {
  variant?: "portal" | "admin" | "auth";
  className?: string;
}

export function EditorialBackground({
  variant = "portal",
  className,
}: EditorialBackgroundProps) {
  const parallaxRef = useRef<HTMLDivElement | null>(null);

  // Subtle desktop pointer parallax for atmospheric aura layers
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || !isFinePointer) return;

    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Max shift: +/- 8px on X, +/- 6px on Y
      targetX = ((e.clientX - centerX) / centerX) * 8;
      targetY = ((e.clientY - centerY) / centerY) * 6;

      if (!rafId) {
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    const updateParallax = () => {
      // Smooth linear interpolation (lerp)
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(${currentX.toFixed(
          2
        )}px, ${currentY.toFixed(2)}px, 0)`;
      }

      if (
        Math.abs(targetX - currentX) > 0.05 ||
        Math.abs(targetY - currentY) > 0.05
      ) {
        rafId = requestAnimationFrame(updateParallax);
      } else {
        rafId = null;
      }
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const isAdmin = variant === "admin";
  const isAuth = variant === "auth";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none",
        className
      )}
    >
      {/* 1. Base Warm Cream Tonal Wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F2] via-[#F5F3EB] to-[#EFECE2]" />

      {/* 2. Tactile Editorial Paper Grain Texture */}
      <div className="absolute inset-0 paper-grain opacity-85" />

      {/* 3. Extremely Faint Technical Engineering Grid */}
      <div className="absolute inset-0 editorial-grid opacity-60" />

      {/* 4. Large Translucent Organic Atmospheric Auras with Parallax */}
      <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
        {/* Sage green atmospheric bloom (Top Right) */}
        <div
          className={cn(
            "absolute -top-[15%] -right-[10%] rounded-full blur-[110px] animate-float-1",
            isAdmin
              ? "w-[480px] h-[480px] bg-[#A3B18A]/08"
              : isAuth
              ? "w-[420px] h-[420px] bg-[#A3B18A]/12"
              : "w-[650px] h-[650px] bg-[#A3B18A]/15"
          )}
        />

        {/* Stone / Cream organic depth shape (Center Left) */}
        <div
          className={cn(
            "absolute top-[32%] -left-[12%] rounded-full blur-[100px] animate-float-2",
            isAdmin
              ? "w-[420px] h-[420px] bg-[#DAD7CD]/20"
              : isAuth
              ? "w-[380px] h-[380px] bg-[#DAD7CD]/25"
              : "w-[560px] h-[560px] bg-[#DAD7CD]/30"
          )}
        />

        {/* Subtle Acid Lime / Botanical warmth (Bottom Right) */}
        <div
          className={cn(
            "absolute -bottom-[12%] right-[15%] rounded-full blur-[120px] animate-float-3",
            isAdmin
              ? "w-[350px] h-[350px] bg-[#C5D86D]/05"
              : isAuth
              ? "w-[300px] h-[300px] bg-[#C5D86D]/08"
              : "w-[460px] h-[460px] bg-[#C5D86D]/09"
          )}
        />
      </div>

      {/* 5. Organic Topographic Contour Lines SVG */}
      <svg
        className={cn(
          "absolute inset-0 w-full h-full stroke-[#344E41] transition-opacity duration-300",
          isAdmin ? "opacity-[0.06]" : isAuth ? "opacity-[0.08]" : "opacity-[0.095]"
        )}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g strokeWidth="0.85">
          {/* Elevation Contour 18m */}
          <path d="M-100 180 C240 120, 480 320, 820 220 C1120 130, 1340 310, 1540 260" />
          
          {/* Elevation Contour 24m (dashed index) */}
          <path
            d="M-80 280 C280 220, 520 420, 880 300 C1160 210, 1380 400, 1560 340"
            strokeDasharray="4 4"
          />

          {/* Elevation Contour 30m */}
          <path d="M-60 390 C320 310, 580 500, 940 380 C1220 290, 1420 480, 1580 430" />

          {/* Elevation Contour 36m */}
          <path d="M-40 510 C360 410, 640 580, 1000 470 C1280 380, 1460 570, 1600 520" />

          {/* Elevation Contour 42m (dashed index) */}
          <path
            d="M-20 640 C400 520, 700 680, 1060 560 C1320 470, 1500 660, 1620 610"
            strokeDasharray="6 4"
          />

          {/* Elevation Contour 48m */}
          <path d="M0 760 C440 630, 760 780, 1120 660 C1380 560, 1540 750, 1640 710" />
        </g>

        {/* Contour elevation indicators */}
        {!isAdmin && (
          <g
            fill="#344E41"
            className="font-mono text-[9px] font-bold tracking-widest select-none"
            opacity="0.7"
          >
            <text x="310" y="228">CONTOUR // +18.0m</text>
            <text x="840" y="308">ELEV // +24.0m</text>
            <text x="560" y="508">INDEX // +36.0m</text>
            <text x="1040" y="568">DATUM // +42.0m</text>
          </g>
        )}
      </svg>

      {/* 6. Technical Engineering & Architectural Precision Details */}
      <div className="absolute inset-0 px-6 py-4 flex flex-col justify-between pointer-events-none opacity-40 font-mono text-[10px] text-[#586B5A]">
        {/* Top Header Engineering Marks */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#344E41] font-bold">+</span>
            <span className="hidden sm:inline tracking-wider">
              [COORD // 13°00&apos;24&quot;N 80°00&apos;11&quot;E]
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline tracking-wider">
              [DATUM // WGS84 — REC-CAMPUS-GRID]
            </span>
            <span className="text-[#344E41] font-bold">+</span>
          </div>
        </div>

        {/* Center Lateral Blueprint Ticks */}
        <div className="flex items-center justify-between">
          <div className="hidden lg:flex flex-col items-center gap-1 text-[8px] tracking-tighter opacity-75">
            <span>|</span>
            <span>+</span>
            <span>|</span>
          </div>
          <div className="hidden lg:flex flex-col items-center gap-1 text-[8px] tracking-tighter opacity-75">
            <span>|</span>
            <span>+</span>
            <span>|</span>
          </div>
        </div>

        {/* Bottom Architectural Legend Marks */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#344E41] font-bold">+</span>
            <span className="hidden sm:inline tracking-wider">
              [REF // DEPT. ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE]
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline tracking-wider">
              [CONTOUR INT: 2.5m // REC-TECH-2026]
            </span>
            <span className="text-[#344E41] font-bold">+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
