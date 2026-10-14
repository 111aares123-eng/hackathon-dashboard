"use client";

import { useEffect, useRef } from "react";

interface SquaresProps {
  direction?: "right" | "left" | "up" | "down" | "diagonal";
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  className?: string;
}

export function Squares({
  direction = "right",
  speed = 0.4,
  borderColor = "rgba(163, 177, 138, 0.22)",
  squareSize = 40,
  hoverFillColor = "rgba(197, 216, 109, 0.14)",
  className = "",
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredSquareRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number | null = null;
    const gridOffset = { x: 0, y: 0 };

    const mediaQuery =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let prefersReducedMotion = mediaQuery ? mediaQuery.matches : false;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = gridOffset.x % squareSize;
      const startY = gridOffset.y % squareSize;

      const numCols = Math.ceil(canvas.width / squareSize) + 2;
      const numRows = Math.ceil(canvas.height / squareSize) + 2;

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;

      for (let i = -1; i < numCols; i++) {
        for (let j = -1; j < numRows; j++) {
          const squareX = i * squareSize + startX;
          const squareY = j * squareSize + startY;

          if (
            hoveredSquareRef.current &&
            hoveredSquareRef.current.x === i &&
            hoveredSquareRef.current.y === j
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }
    };

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || 300;
      if (prefersReducedMotion) {
        drawGrid();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hoveredX = Math.floor((mouseX - (gridOffset.x % squareSize)) / squareSize);
      const hoveredY = Math.floor((mouseY - (gridOffset.y % squareSize)) / squareSize);

      hoveredSquareRef.current = { x: hoveredX, y: hoveredY };
      if (prefersReducedMotion) {
        drawGrid();
      }
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
      if (prefersReducedMotion) {
        drawGrid();
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const startAnimationLoop = () => {
      const render = () => {
        switch (direction) {
          case "right":
            gridOffset.x += speed;
            break;
          case "left":
            gridOffset.x -= speed;
            break;
          case "up":
            gridOffset.y -= speed;
            break;
          case "down":
            gridOffset.y += speed;
            break;
          case "diagonal":
            gridOffset.x += speed;
            gridOffset.y += speed;
            break;
        }

        drawGrid();
        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);
    };

    const stopAnimationLoop = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    if (prefersReducedMotion) {
      drawGrid();
    } else {
      startAnimationLoop();
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        stopAnimationLoop();
        drawGrid();
      } else {
        startAnimationLoop();
      }
    };

    mediaQuery?.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      mediaQuery?.removeEventListener("change", handleMotionChange);
      stopAnimationLoop();
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto w-full h-full ${className}`}
    />
  );
}
