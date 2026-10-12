import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shimmerColor?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className = "",
  shimmerColor = "rgba(197, 160, 89, 0.7)",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  if (disabled) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, currentColor 35%, ${shimmerColor} 50%, currentColor 65%)`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        animation: `shine ${animationDuration} linear infinite`,
      }}
    >
      {text}
    </span>
  );
}
