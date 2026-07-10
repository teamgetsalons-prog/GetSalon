import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gold-500 text-gold-950 hover:bg-gold-400 shadow-sm shadow-gold-500/25 font-semibold",
  outline:
    "border border-line bg-transparent text-fg hover:border-gold-500/60 hover:text-gold",
  ghost: "bg-transparent text-fg-muted hover:bg-bg-soft hover:text-fg",
  danger: "bg-red-600 text-white hover:bg-red-500 font-semibold",
  dark: "bg-fg text-bg hover:opacity-90 font-semibold",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap transition-all",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
          "disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  }
);
