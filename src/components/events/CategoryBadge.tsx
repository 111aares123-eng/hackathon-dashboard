interface CategoryBadgeProps {
  category: "HACKATHON" | "WORKSHOP" | "SEMINAR" | "INTERNSHIP" | "COMPETITION" | "ANNOUNCEMENT" | string;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const styles: Record<string, string> = {
    HACKATHON: "bg-[#003366]/10 text-[#003366] border-[#003366]/25",
    WORKSHOP: "bg-teal-50 text-teal-800 border-teal-200",
    SEMINAR: "bg-emerald-50 text-emerald-800 border-emerald-200",
    INTERNSHIP: "bg-indigo-50 text-indigo-800 border-indigo-200",
    COMPETITION: "bg-[#C5A059]/15 text-[#87631E] border-[#C5A059]/35",
    ANNOUNCEMENT: "bg-slate-100 text-slate-800 border-slate-200",
  };

  const currentStyle = styles[category] || "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${currentStyle} ${className}`}
    >
      {category}
    </span>
  );
}
