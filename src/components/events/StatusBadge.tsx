interface StatusBadgeProps {
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED" | string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  switch (status) {
    case "PUBLISHED":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-[#D9FF38] text-[#171717] border-2 border-[#171717] shadow-brutal-sm ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#171717] mr-1.5 animate-pulse" />
          Live Matrix
        </span>
      );
    case "DRAFT":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-[#FFE23B] text-[#171717] border-2 border-[#171717] shadow-brutal-sm ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#171717] mr-1.5" />
          Draft Staging
        </span>
      );
    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-[#F12D2D] text-white border-2 border-[#171717] shadow-brutal-sm ${className}`}
        >
          Cancelled
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-[#E9E2D5] text-[#171717] border-2 border-[#171717] shadow-brutal-sm ${className}`}
        >
          Completed
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-white text-[#171717] border-2 border-[#171717] shadow-brutal-sm ${className}`}
        >
          {status}
        </span>
      );
  }
}
