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
  speed = 0.5,
  borderColor = "rgba(0, 34, 68, 0.05)",
  squareSize = 40,
  hoverFillColor = "rgba(197, 160, 89, 0.08)",
  className = "",
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredSquareRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const gridOffset = { x: 0, y: 0 };

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || 300;
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
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!prefersReducedMotion) {
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
      }

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

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto w-full h-full ${className}`}
    />
  );
}
