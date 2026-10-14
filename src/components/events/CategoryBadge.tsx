interface CategoryBadgeProps {
  category: "HACKATHON" | "WORKSHOP" | "SEMINAR" | "INTERNSHIP" | "COMPETITION" | "ANNOUNCEMENT" | string;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const styles: Record<string, string> = {
    HACKATHON: "bg-[#344E41]/10 text-[#25392F] border-[#344E41]/30",
    WORKSHOP: "bg-[#A3B18A]/20 text-[#2B4035] border-[#A3B18A]/50",
    SEMINAR: "bg-[#DAD7CD]/40 text-[#2D3E32] border-[#DAD7CD]",
    INTERNSHIP: "bg-[#586B5A]/15 text-[#1F2E23] border-[#586B5A]/30",
    COMPETITION: "bg-[#C5D86D]/25 text-[#243314] border-[#C5D86D]/60 font-bold",
    ANNOUNCEMENT: "bg-[#F5F3EB] text-[#202820] border-[#DAD7CD]",
  };

  const currentStyle = styles[category] || "bg-[#F5F3EB] text-[#202820] border-[#DAD7CD]";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide border shadow-[0_1px_2px_rgba(32,40,32,0.02)] ${currentStyle} ${className}`}
    >
      {category}
    </span>
  );
}
