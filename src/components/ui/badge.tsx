import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 font-heading font-bold uppercase text-[11px] tracking-wider border-2 border-[#171717] rounded shadow-brutal-sm px-2.5 py-0.5 whitespace-nowrap transition-all select-none [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-[#F12D2D] text-white",
        secondary: "bg-[#1748F5] text-white",
        yellow: "bg-[#FFE23B] text-[#171717]",
        acid: "bg-[#D9FF38] text-[#171717]",
        pink: "bg-[#F4A7DB] text-[#171717]",
        outline: "bg-white text-[#171717]",
        neutral: "bg-[#E9E2D5] text-[#171717]",
        destructive: "bg-[#F12D2D] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
