interface CategoryBadgeProps {
  category: "HACKATHON" | "WORKSHOP" | "SEMINAR" | "INTERNSHIP" | "COMPETITION" | "ANNOUNCEMENT" | string;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const styles: Record<string, string> = {
    HACKATHON: "bg-[#1748F5] text-white",
    WORKSHOP: "bg-[#F4A7DB] text-[#171717]",
    SEMINAR: "bg-[#E9E2D5] text-[#171717]",
    INTERNSHIP: "bg-[#D9FF38] text-[#171717]",
    COMPETITION: "bg-[#FFE23B] text-[#171717]",
    ANNOUNCEMENT: "bg-[#FFF9E9] text-[#171717]",
  };

  const currentStyle = styles[category] || "bg-[#E9E2D5] text-[#171717]";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded font-heading text-[11px] font-bold uppercase tracking-wider border-2 border-[#171717] shadow-brutal-sm ${currentStyle} ${className}`}
    >
      {category}
    </span>
  );
}
