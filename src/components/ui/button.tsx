import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-heading font-bold uppercase tracking-wider text-xs whitespace-nowrap transition-all duration-150 outline-none select-none border-2 border-[#171717] rounded cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#F12D2D] text-white shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        secondary:
          "bg-[#1748F5] text-white shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        yellow:
          "bg-[#FFE23B] text-[#171717] shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        acid:
          "bg-[#D9FF38] text-[#171717] shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        outline:
          "bg-white text-[#171717] shadow-brutal hover:bg-[#E9E2D5] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        ghost:
          "border-transparent bg-transparent text-[#171717] hover:bg-[#E9E2D5] hover:border-[#171717] hover:shadow-brutal-sm",
        destructive:
          "bg-[#F12D2D] text-white shadow-brutal hover:bg-red-700 hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        link: "border-transparent bg-transparent text-[#1748F5] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 gap-2 text-xs",
        xs: "h-7 px-2.5 py-1 gap-1 text-[11px]",
        sm: "h-8 px-3 py-1.5 gap-1.5 text-xs",
        lg: "h-11 px-6 py-3 gap-2.5 text-sm",
        icon: "size-9 p-0",
        "icon-sm": "size-7 p-0",
        "icon-lg": "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
