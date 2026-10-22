"use client"

import React from "react"
import { Home, Sparkles, Wand2, Compass } from "lucide-react"
import { AnimeNavBar, NavItem } from "@/components/examples/anime-navbar"

const navItems: NavItem[] = [
  { name: "Home", url: "#", icon: Home },
  { name: "Explore", url: "#explore", icon: Compass },
  { name: "Creations", url: "#creations", icon: Wand2 },
  { name: "Showcase", url: "#showcase", icon: Sparkles },
]

export function AnimeNavBarDemo() {
  return (
    <div className="relative min-h-[500px] w-full bg-neutral-950 text-white flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-black p-8">
      {/* Anime Floating Navbar */}
      <AnimeNavBar items={navItems} defaultActive="Home" />

      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(74,222,128,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Hero Content */}
      <main className="z-10 text-center px-4 max-w-2xl pt-24 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          CRT Mascot Active
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Retro CRT Mascot Navbar
        </h1>
        <p className="mt-4 text-neutral-400 text-sm sm:text-base leading-relaxed">
          Click or hover across the tabs above. Watch the little flower-patterned CRT monitor companion glide smoothly between items, wag its tail, and react with excited star eyes!
        </p>
      </main>
    </div>
  )
}

export default AnimeNavBarDemo
