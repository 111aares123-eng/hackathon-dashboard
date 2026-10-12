"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export function EventDetailContainer({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (typeof window !== "undefined") {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) return;
      }

      gsap.from(".detail-main-article", {
        opacity: 0,
        y: 12,
        duration: 0.45,
        ease: "power2.out",
        clearProps: "all",
      });

      gsap.from(".detail-sidebar-box", {
        opacity: 0,
        y: 16,
        duration: 0.45,
        delay: 0.08,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {children}
    </div>
  );
}
