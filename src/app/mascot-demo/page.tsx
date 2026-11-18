"use client"

import React, { useState } from "react"
import { RecNavBar } from "@/components/layout/RecNavBar"
import { CrtMascot } from "@/components/ui/crt-mascot"
import { AnimeNavBar } from "@/components/examples/anime-navbar"
import { Home, Compass, Calendar, Bookmark, Sparkles, Wand2, Terminal } from "lucide-react"
import Link from "next/link"

const animeNavItems = [
  { name: "Home", url: "#home", icon: Home },
  { name: "Explore", url: "#explore", icon: Compass },
  { name: "Creations", url: "#creations", icon: Wand2 },
  { name: "Showcase", url: "#showcase", icon: Sparkles },
]

const recNavItems = [
  { name: "DISCOVER HUB", url: "#discover", icon: Compass },
  { name: "HACKATHONS & EVENTS", url: "#events", icon: Calendar },
  { name: "SAVED VAULT", url: "#vault", icon: Bookmark },
]

export default function MascotDemoPage() {
  const [testHover, setTestHover] = useState(false)
  const [activeVariant, setActiveVariant] = useState<"rec" | "anime">("rec")

  return (
    <div className="min-h-screen bg-[#FFF9E9] text-[#171717] flex flex-col font-body selection:bg-[#F12D2D] selection:text-white">
      {/* Dynamic Navbar based on selected variant */}
      {activeVariant === "rec" ? (
        <RecNavBar items={recNavItems} defaultActive="DISCOVER HUB" />
      ) : (
        <div className="relative pt-4 pb-16 bg-neutral-950">
          <AnimeNavBar items={animeNavItems} defaultActive="Home" />
          <div className="text-center pt-36 text-white/60 text-xs font-mono">
            Floating Dark Glassmorphism Anime Capsule Active
          </div>
        </div>
      )}

      {/* Main Content Showcase */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-10">
        {/* Header & Controls */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFE23B] border-2 border-black rounded-full font-heading text-xs font-black uppercase shadow-brutal-sm">
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Interactive CRT Mascot Showcase</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#171717]">
            CRT-Monitor Companion Navbar
          </h1>

          <p className="max-w-2xl mx-auto text-neutral-700 text-sm sm:text-base font-medium">
            Retro phosphor-screen companion inspired by vintage CRT monitors. It glides smoothly between active tabs using spring physics, wags its tail, and enters the excited state with star eyes (<span className="text-[#15803d] font-bold">★ ★</span>) on hover!
          </p>

          {/* Switcher & Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveVariant("rec")}
              className={`px-4 py-2 border-2 border-black rounded font-heading text-xs font-bold uppercase transition-all shadow-brutal-sm cursor-pointer ${
                activeVariant === "rec"
                  ? "bg-[#2563EB] text-white shadow-brutal"
                  : "bg-white hover:bg-neutral-100"
              }`}
            >
              REC Neo-Brutalist Navbar
            </button>
            <button
              onClick={() => setActiveVariant("anime")}
              className={`px-4 py-2 border-2 border-black rounded font-heading text-xs font-bold uppercase transition-all shadow-brutal-sm cursor-pointer ${
                activeVariant === "anime"
                  ? "bg-black text-emerald-400 shadow-brutal"
                  : "bg-white hover:bg-neutral-100"
              }`}
            >
              Dark Anime Glass Navbar
            </button>
            <Link
              href="/"
              className="px-4 py-2 border-2 border-black rounded font-heading text-xs font-bold uppercase bg-[#F12D2D] text-white hover:bg-red-600 transition-all shadow-brutal-sm"
            >
              Back to Main Portal
            </Link>
          </div>
        </div>

        {/* Mascot Interactive Anatomy Card */}
        <div className="bg-white border-2 border-black rounded-xl p-6 sm:p-8 shadow-brutal-lg grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#FFF9E9] border-2 border-black rounded-lg p-6 shadow-brutal-sm">
            <div
              className="cursor-pointer transform hover:scale-110 transition-transform py-4"
              onMouseEnter={() => setTestHover(true)}
              onMouseLeave={() => setTestHover(false)}
              onClick={() => setTestHover((prev) => !prev)}
            >
              <CrtMascot isHovered={testHover} />
            </div>
            <div className="mt-4 text-center">
              <span className="font-heading text-xs font-bold uppercase px-3 py-1 bg-black text-white rounded-full">
                Status: {testHover ? "★ EXCITED STATE ★" : "^ v ^ HAPPY IDLE"}
              </span>
              <p className="text-[11px] text-neutral-500 font-mono mt-1">
                (Hover or tap mascot to trigger excitation)
              </p>
            </div>
          </div>

          <div className="md:col-span-7 space-y-3">
            <h3 className="font-display text-2xl font-black uppercase text-[#171717]">
              Mascot Visual Features
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-800 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-[#1748F5] font-black">✦</span>
                <span><strong>Retro CRT Monitor Head:</strong> Vintage cream chassis with cat/pup ears, inner green lining, and flower accent.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1748F5] font-black">✦</span>
                <span><strong>Phosphor Screen:</strong> Green digital CRT scan display with happy <code className="bg-neutral-100 px-1 py-0.5 rounded border border-black font-mono">^ v ^</code> idle face.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1748F5] font-black">✦</span>
                <span><strong>Excited State:</strong> Glowing star eyes <code className="bg-neutral-100 px-1 py-0.5 rounded border border-black font-mono">★ ★</code>, sparkles, head tilt, and rapid wagging tail.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1748F5] font-black">✦</span>
                <span><strong>Chibi Body:</strong> Floral patterns (cyan, lavender, and pink), purple collar, and gold bell tag.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1748F5] font-black">✦</span>
                <span><strong>Physics-Based Gliding:</strong> Animated using Framer Motion springs across active tabs.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Integration Instructions Snippet */}
        <div className="bg-[#171717] text-white border-2 border-black rounded-xl p-6 shadow-brutal-md space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-[#FFE23B] font-bold">
            <Terminal className="w-4 h-4" />
            <span>QUICK INTEGRATION USAGE</span>
          </div>
          <pre className="overflow-x-auto p-3 bg-neutral-900 rounded border border-neutral-700 text-emerald-400">
{`import { RecNavBar } from "@/components/ui/rec-navbar"

export default function Layout({ children }) {
  return (
    <>
      <RecNavBar />
      {children}
    </>
  )
}`}
          </pre>
        </div>
      </main>
    </div>
  )
}
