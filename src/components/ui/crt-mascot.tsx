"use client"

import React, { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface AestheticCrtMascotProps {
  isHovered: boolean
}

/**
 * Reusable CRT Mascot Design-System Primitive.
 * Features:
 * - Pure vector rendering with `shapeRendering="geometricPrecision"`
 * - Anchored tail rotation at pivot (0,0) in translated group (28, 62)
 * - Pure vertical float motion curve to avoid rotational subpixel aliasing
 * - Memoized with `React.memo` to eliminate unnecessary parent re-renders
 */
export const AestheticCrtMascot = memo(function AestheticCrtMascot({
  isHovered,
}: AestheticCrtMascotProps) {
  return (
    <div className="relative w-14 h-14 select-none pointer-events-none">
      {/* Floating Sparkles when tab is hovered */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 2 }}
            animate={{ opacity: 1, scale: 1, y: -6 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute -top-2 -right-1 text-amber-400 text-xs font-black select-none pointer-events-none"
          >
            ✦
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gentle Floating Mascot Body (Pure vertical float to prevent rotational subpixel aliasing) */}
      <motion.div
        className="w-full h-full relative"
        animate={{
          y: isHovered ? [0, -4.5, 0] : [0, -3.5, 0],
        }}
        transition={{
          duration: isHovered ? 2.0 : 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          shapeRendering="geometricPrecision"
        >
          {/* TAIL (Anchored at exact pivot (28, 62) to prevent detachment or pixel tearing) */}
          <g transform="translate(28, 62)">
            <motion.g
              animate={{
                rotate: isHovered ? [-8, 8, -8] : [-4, 4, -4],
              }}
              transition={{
                duration: isHovered ? 1.4 : 3.0,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d="M 0 0 C -12 -8, -16 -22, -10 -26 C -6 -28, -4 -17, 2 -4 Z"
                fill="#FCE3D2"
                stroke="#1c1917"
                strokeWidth="3.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </motion.g>
          </g>

          {/* CHIBI BODY */}
          <path
            d="M 30 58 C 30 50, 42 46, 52 46 C 64 46, 74 52, 74 64 C 74 74, 68 84, 52 84 C 38 84, 30 74, 30 58 Z"
            fill="#FCE3D2"
            stroke="#1c1917"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* PAWS */}
          <ellipse cx="38" cy="83" rx="7" ry="5" fill="#FCE3D2" stroke="#1c1917" strokeWidth="3" />
          <ellipse cx="64" cy="83" rx="7" ry="5" fill="#FCE3D2" stroke="#1c1917" strokeWidth="3" />

          {/* FLORAL PATTERNS */}
          <g transform="translate(36, 68) scale(0.65)">
            <circle cx="0" cy="-4" r="3" fill="#38BDF8" />
            <circle cx="4" cy="0" r="3" fill="#38BDF8" />
            <circle cx="0" cy="4" r="3" fill="#38BDF8" />
            <circle cx="-4" cy="0" r="3" fill="#38BDF8" />
            <circle cx="0" cy="0" r="2.2" fill="#FACC15" />
          </g>
          <g transform="translate(56, 70) scale(0.65)">
            <circle cx="0" cy="-4" r="3" fill="#C084FC" />
            <circle cx="4" cy="0" r="3" fill="#C084FC" />
            <circle cx="0" cy="4" r="3" fill="#C084FC" />
            <circle cx="-4" cy="0" r="3" fill="#C084FC" />
            <circle cx="0" cy="0" r="2.2" fill="#FACC15" />
          </g>

          {/* COLLAR & BELL */}
          <path
            d="M 36 50 C 44 56, 58 56, 68 50 C 69 53, 67 56, 63 58 C 54 62, 45 61, 38 57 Z"
            fill="#A855F7"
            stroke="#1c1917"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="51" cy="59" r="4.5" fill="#FACC15" stroke="#1c1917" strokeWidth="2.5" />
          <circle cx="51" cy="59" r="1.5" fill="#CA8A04" />

          {/* EARS */}
          <g>
            <path
              d="M 33 26 C 24 16, 26 2, 34 0 C 42 1, 46 14, 46 22 Z"
              fill="#FCE3D2"
              stroke="#1c1917"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M 34 20 C 30 14, 30 6, 35 4 C 39 6, 42 14, 42 19 Z"
              fill="#4ADE80"
              stroke="#1c1917"
              strokeWidth="2"
            />
            <g transform="translate(29, 13) scale(0.45)">
              <circle cx="0" cy="-3" r="2.5" fill="#C084FC" />
              <circle cx="3" cy="0" r="2.5" fill="#C084FC" />
              <circle cx="0" cy="3" r="2.5" fill="#C084FC" />
              <circle cx="-3" cy="0" r="2.5" fill="#C084FC" />
              <circle cx="0" cy="0" r="2" fill="#FACC15" />
            </g>
          </g>
          <g>
            <path
              d="M 68 26 C 76 16, 74 2, 66 0 C 58 1, 54 14, 54 22 Z"
              fill="#FCE3D2"
              stroke="#1c1917"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M 66 20 C 70 14, 70 6, 65 4 C 61 6, 58 14, 58 19 Z"
              fill="#4ADE80"
              stroke="#1c1917"
              strokeWidth="2"
            />
          </g>

          {/* CRT MONITOR HOUSING */}
          <rect
            x="24"
            y="14"
            width="54"
            height="40"
            rx="12"
            fill="#FCE3D2"
            stroke="#1c1917"
            strokeWidth="3.5"
          />

          {/* CRT SCREEN BACKGROUND */}
          <rect
            x="29"
            y="19"
            width="44"
            height="30"
            rx="8"
            fill="#122419"
            stroke="#1c1917"
            strokeWidth="3"
          />

          {/* CRT FACIAL EXPRESSION */}
          {isHovered ? (
            /* Star Eyes (Excited) */
            <g fill="#4ADE80">
              <path d="M 39 28 L 40 31 L 43 31.5 L 40.5 33.5 L 41.5 36.5 L 39 34.5 L 36.5 36.5 L 37.5 33.5 L 35 31.5 L 38 31 Z" />
              <path d="M 61 28 L 62 31 L 65 31.5 L 62.5 33.5 L 63.5 36.5 L 61 34.5 L 58.5 36.5 L 59.5 33.5 L 57 31.5 L 60 31 Z" />
              <path d="M 46 38 Q 50 43 54 38 Z" stroke="#4ADE80" strokeWidth="1.5" />
            </g>
          ) : (
            /* Happy Face (^ v ^) */
            <g stroke="#4ADE80" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 37 34 L 40 30 L 43 34" strokeWidth="3" />
              <path d="M 57 34 L 60 30 L 63 34" strokeWidth="3" />
              <path d="M 48 37 L 50 41 L 52 37" strokeWidth="2.5" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  )
})

// Alias for backwards compatibility
export const CrtMascot = AestheticCrtMascot
