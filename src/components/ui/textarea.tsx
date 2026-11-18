import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      data-lenis-prevent
      className={cn(
        "flex min-h-20 w-full rounded border-2 border-[#171717] bg-white px-3 py-2 text-sm text-[#171717] placeholder:text-[#5D3F3C]/60 shadow-brutal-sm transition-all outline-none focus:shadow-brutal-blue disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
