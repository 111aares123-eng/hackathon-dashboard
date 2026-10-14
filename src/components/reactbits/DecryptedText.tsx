"use client";

import { useEffect, useState, useRef } from "react";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: "view" | "hover";
}

export function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = true,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-/<>~",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isScrolledIntoView, setIsScrolledIntoView] = useState<boolean>(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const shouldAnimate =
      !prefersReducedMotion &&
      (animateOn === "view" ? isScrolledIntoView : isHovering);

    if (!shouldAnimate) {
      return;
    }

    let currentIteration = 0;
    const textLength = text.length;

    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";

            if (sequential) {
              const revealProgress = Math.floor(
                (currentIteration / maxIterations) * textLength
              );
              if (index < revealProgress) {
                return text[index];
              }
            } else {
              if (currentIteration >= maxIterations) {
                return text[index];
              }
            }

            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("");
      });

      currentIteration++;

      if (currentIteration > maxIterations * (sequential ? 1.5 : 1)) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);

    return () => {
      clearInterval(interval);
    };
  }, [
    text,
    speed,
    maxIterations,
    sequential,
    characters,
    isHovering,
    isScrolledIntoView,
    animateOn,
  ]);

  useEffect(() => {
    if (animateOn !== "view") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsScrolledIntoView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animateOn]);

  return (
    <span
      ref={containerRef}
      className={`inline-block ${parentClassName}`}
      onMouseEnter={() => {
        if (animateOn === "hover") setIsHovering(true);
      }}
      onMouseLeave={() => {
        if (animateOn === "hover") {
          setIsHovering(false);
          setDisplayText(text);
        }
      }}
    >
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        className={displayText !== text ? encryptedClassName || className : className}
      >
        {displayText}
      </span>
    </span>
  );
}
