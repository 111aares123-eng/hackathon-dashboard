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
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          Published
        </span>
      );
    case "DRAFT":
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          Draft
        </span>
      );
    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
          Cancelled
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
          Completed
        </span>
      );
    default:
      return <Badge variant="secondary" className={className}>{status}</Badge>;
  }
}
