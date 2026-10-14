"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
  matchType?: "exact" | "startsWith";
}

export interface AnimeNavBarProps {
  items: NavItem[];
  className?: string;
  defaultActive?: string;
  variant?: "inline" | "floating";
  showMascot?: boolean;
  layoutIdPrefix?: string;
  ariaLabel?: string;
}

/**
 * Minimalist Sage Botanical Companion Mascot
 * A subtle, restrained sprout indicator replacing excessive neon mascots.
 */
function SageMascot({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Right leaf (acid lime) */}
      <path
        d="M10 4C10 1.8 12.5 0.5 14.5 1.2C14.5 3.2 12.8 4 10 4Z"
        fill="#C5D86D"
      />
      {/* Left leaf (sage green) */}
      <path
        d="M10 4C10 2.2 7.8 1.2 6.2 1.8C6.2 3.5 8 4 10 4Z"
        fill="#A3B18A"
      />
      {/* Little botanical head */}
      <rect
        x="2"
        y="3.5"
        width="16"
        height="9.5"
        rx="4.75"
        fill="#344E41"
        stroke="#A3B18A"
        strokeWidth="0.8"
      />
      {/* Friendly calm eyes */}
      <circle cx="7.2" cy="8" r="1.1" fill="#F5F3EB" />
      <circle cx="12.8" cy="8" r="1.1" fill="#F5F3EB" />
      {/* Subtle acid lime blush cheek accents */}
      <circle cx="5" cy="9.5" r="1" fill="#C5D86D" fillOpacity="0.9" />
      <circle cx="15" cy="9.5" r="1" fill="#C5D86D" fillOpacity="0.9" />
      {/* Gentle smile */}
      <path
        d="M8.8 9.6C9.4 10.2 10.6 10.2 11.2 9.6"
        stroke="#F5F3EB"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Route matching logic:
 * Handles root `/` and dynamic event detail routes `/events/[slug]`,
 * exact `/admin` overview, and nested sections like `/admin/events/*`.
 */
function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.matchType === "exact") {
    return pathname === item.url;
  }

  if (item.url === "/") {
    // Root catalog is active on homepage or when viewing opportunity details
    return pathname === "/" || pathname.startsWith("/events/");
  }

  if (item.url === "/admin") {
    // Admin Overview is strictly exact /admin to avoid collision with sub-routes
    return pathname === "/admin";
  }

  // Sub-routes match prefixes (e.g. /admin/events, /admin/teachers, /admin/audit-logs)
  return pathname === item.url || pathname.startsWith(`${item.url}/`);
}

export function AnimeNavBar({
  items,
  className,
  defaultActive,
  variant = "inline",
  showMascot = true,
  layoutIdPrefix = "anime-nav",
  ariaLabel = "Primary navigation",
}: AnimeNavBarProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);

  // Compute active item from current route or fallback
  let activeUrl: string | null = null;
  for (const item of items) {
    if (isItemActive(item, pathname)) {
      activeUrl = item.url;
      break;
    }
  }

  // Fallback to defaultActive if no item matches
  if (!activeUrl && defaultActive) {
    activeUrl = defaultActive;
  }

  const isFloating = variant === "floating";

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        isFloating
          ? "fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center p-1.5 rounded-full bg-[#F5F3EB]/90 backdrop-blur-md border border-[#DAD7CD] shadow-[0_4px_20px_rgba(32,40,32,0.08)]"
          : "relative flex items-center p-1 rounded-full bg-[#F5F3EB]/80 border border-[#DAD7CD] backdrop-blur-xs",
        className
      )}
    >
      <div className="flex items-center gap-1 relative">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeUrl === item.url;
          const isHovered = hoveredUrl === item.url && !isActive;

          return (
            <Link
              key={item.url}
              href={item.url}
              aria-current={isActive ? "page" : undefined}
              onMouseEnter={() => setHoveredUrl(item.url)}
              onMouseLeave={() => setHoveredUrl(null)}
              className={cn(
                "relative group px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 outline-none select-none",
                "focus-visible:ring-2 focus-visible:ring-[#344E41] focus-visible:ring-offset-2",
                isActive
                  ? "text-white font-bold"
                  : "text-[#586B5A] hover:text-[#202820]"
              )}
            >
              {/* Optional Animated Mascot atop Active Item */}
              {showMascot && isActive && (
                <motion.div
                  layoutId={
                    prefersReducedMotion ? undefined : `${layoutIdPrefix}-mascot`
                  }
                  className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 350, damping: 26 }
                  }
                >
                  <SageMascot />
                </motion.div>
              )}

              {/* Shared Active Tab Pill */}
              {isActive && (
                <motion.div
                  layoutId={
                    prefersReducedMotion ? undefined : `${layoutIdPrefix}-active-pill`
                  }
                  className="absolute inset-0 bg-[#344E41] rounded-full -z-10 shadow-xs border border-[#344E41]"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 30 }
                  }
                />
              )}

              {/* Shared Hover Pill */}
              {isHovered && (
                <motion.div
                  layoutId={
                    prefersReducedMotion ? undefined : `${layoutIdPrefix}-hover-pill`
                  }
                  className="absolute inset-0 bg-[#DAD7CD]/50 rounded-full -z-10"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 450, damping: 35 }
                  }
                />
              )}

              {/* Icon with Acid Lime accent for active state */}
              <Icon
                className={cn(
                  "w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-hover:scale-105",
                  isActive
                    ? "text-[#C5D86D]"
                    : "text-[#586B5A] group-hover:text-[#202820]"
                )}
              />

              {/* Label */}
              <span className="truncate tracking-tight">{item.name}</span>

              {/* Optional Numeric or Status Badge */}
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono",
                    isActive
                      ? "bg-[#C5D86D] text-[#202820]"
                      : "bg-[#DAD7CD]/70 text-[#202820]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
