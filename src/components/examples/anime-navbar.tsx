"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AestheticCrtMascot } from "@/components/ui/crt-mascot"

export interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

export interface AnimeNavBarProps {
  items: NavItem[]
  className?: string
  defaultActive?: string
}

/**
 * Example Component: Floating Anime Glass Capsule Navigation Bar.
 * Located in `components/examples/` as showcase/reference code.
 */
export function AnimeNavBar({ items, className, defaultActive = "Home" }: AnimeNavBarProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>(defaultActive)

  return (
    <div
      className={cn(
        "fixed top-8 sm:top-10 left-0 right-0 z-[9999] pointer-events-none overflow-visible",
        className
      )}
    >
      <div className="flex justify-center pt-10 overflow-visible">
        <motion.div
          className="flex items-center gap-2 sm:gap-4 bg-black/60 border border-white/15 backdrop-blur-xl py-2 px-3 rounded-full shadow-2xl relative pointer-events-auto overflow-visible"
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name
            const isHovered = hoveredTab === item.name

            return (
              <Link
                key={item.name}
                href={item.url}
                onClick={(e) => {
                  if (item.url.startsWith("#")) {
                    e.preventDefault()
                  }
                  setActiveTab(item.name)
                }}
                onMouseEnter={() => setHoveredTab(item.name)}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 flex items-center gap-2 overflow-visible",
                  "text-white/70 hover:text-white",
                  isActive && "text-white"
                )}
              >
                {/* Active Tab Glow Capsule */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.35, 0.6, 0.35],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="absolute inset-0 bg-emerald-500/25 rounded-full blur-md" />
                    <div className="absolute inset-[-4px] bg-emerald-500/20 rounded-full blur-xl" />
                    <div className="absolute inset-[-8px] bg-emerald-500/10 rounded-full blur-2xl" />
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/25 to-emerald-500/0"
                      style={{ animation: "shine 3s ease-in-out infinite" }}
                    />
                  </motion.div>
                )}

                {/* Tab Label (Desktop) */}
                <span className="hidden md:inline relative z-10">{item.name}</span>

                {/* Tab Icon (Mobile and visual accent) */}
                <motion.span
                  className="relative z-10 flex items-center justify-center"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={18} strokeWidth={2.3} />
                </motion.span>

                {/* Hover Background Pill */}
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    />
                  )}
                </AnimatePresence>

                {/* The Perched CRT Mascot on the upper right shoulder */}
                {isActive && (
                  <motion.div
                    layoutId="anime-mascot"
                    className="absolute -top-10 right-0 pointer-events-none z-30"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                  >
                    <AestheticCrtMascot isHovered={hoveredTab !== null} />
                  </motion.div>
                )}
              </Link>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
