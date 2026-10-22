"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Sparkles, LogOut, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AestheticCrtMascot } from "@/components/ui/crt-mascot"

export interface NavItem {
  name: string
  url: string
  icon?: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { name: "DISCOVER HUB", url: "/" },
  { name: "HACKATHONS & EVENTS", url: "/events" },
  { name: "SAVED VAULT", url: "/saved" },
]

export interface RecNavBarProps {
  items?: NavItem[]
  defaultActive?: string
  className?: string
  user?: { name: string; role: string } | null
  onLogout?: () => void
}

/**
 * REC AI & DS Opportunity Matrix Navigation Bar (Layout Component).
 * Positioned in `components/layout/` per Next.js and project conventions.
 */
export function RecNavBar({
  items = NAV_ITEMS,
  defaultActive = "HACKATHONS & EVENTS",
  className,
  user = { name: "Lakshanika V S", role: "STUDENT" },
  onLogout,
}: RecNavBarProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultActive)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  return (
    /* pt-12 sm:pt-14 provides ample headroom so the mascot floats freely with zero top-edge collision */
    <header
      className={cn(
        "w-full bg-white border-b-2 border-black sticky top-0 z-50 pt-12 sm:pt-14 pb-3.5 sm:pb-4 px-4 sm:px-8 overflow-visible",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 overflow-visible">
        {/* BRAND IDENTITY */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#EF4444] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-amber-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <Sparkles className="w-5 h-5 fill-amber-300 stroke-black stroke-[1.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-black leading-tight font-display">
              REC AI & DS
            </span>
            <span className="text-[10px] font-bold tracking-wider text-neutral-800 uppercase leading-none font-heading">
              OPPORTUNITY MATRIX
            </span>
          </div>
        </Link>

        {/* NAVIGATION ITEMS */}
        <nav className="flex items-center gap-3 sm:gap-5 overflow-visible">
          {items.map((item) => {
            const isActive = activeTab === item.name

            return (
              <div
                key={item.name}
                className="relative flex items-center overflow-visible"
                onMouseEnter={() => setHoveredTab(item.name)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                {/* 
                  Perched mascot: Positioned off-center on the upper-right shoulder (right-1 -top-10)
                  giving full visibility to the tab text and breathing room above.
                */}
                {isActive && (
                  <motion.div
                    layoutId="rec-mascot-companion"
                    className="absolute -top-10 right-1 pointer-events-none z-30"
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                  >
                    <AestheticCrtMascot isHovered={hoveredTab !== null} />
                  </motion.div>
                )}

                <Link
                  href={item.url}
                  onClick={(e) => {
                    if (item.url.startsWith("#")) {
                      e.preventDefault()
                    }
                    setActiveTab(item.name)
                  }}
                  className={cn(
                    "text-xs sm:text-sm font-black tracking-wide transition-all duration-150 select-none font-heading",
                    isActive
                      ? "bg-[#2563EB] text-white px-4 sm:px-5 py-2 rounded-full border-2 border-black shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                      : "text-black hover:text-[#2563EB] px-3.5 py-2"
                  )}
                >
                  {item.name}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* USER PROFILE SECTION */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black text-black leading-tight font-heading">
                {user.name}
              </div>
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider leading-none">
                {user.role}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center hover:bg-neutral-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4 text-black stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  )
}
