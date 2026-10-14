import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED" | string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  switch (status) {
    case "PUBLISHED":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#344E41]/10 text-[#25392F] border border-[#344E41]/25 shadow-[0_1px_2px_rgba(32,40,32,0.02)] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#344E41] mr-1.5 animate-pulse" />
          Published
        </span>
      );
    case "DRAFT":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DAD7CD]/45 text-[#383325] border border-[#DAD7CD] shadow-[0_1px_2px_rgba(32,40,32,0.02)] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#7D7356] mr-1.5" />
          Draft
        </span>
      );
    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-[0_1px_2px_rgba(32,40,32,0.02)] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5" />
          Cancelled
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F3EB] text-[#586B5A] border border-[#DAD7CD] shadow-[0_1px_2px_rgba(32,40,32,0.02)] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3B18A] mr-1.5" />
          Completed
        </span>
      );
    default:
      return <Badge variant="secondary" className={className}>{status}</Badge>;
  }
}
