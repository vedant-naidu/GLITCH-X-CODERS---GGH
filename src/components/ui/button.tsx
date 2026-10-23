import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "solid" | "ghost" | "outline";
};

export function Button({ className, variant = "solid", children, ...props }: ButtonProps) {
  const variants = {
    solid: "bg-[var(--accent)] text-white shadow-[var(--shadow)] hover:opacity-90",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--accent-soft)]",
    outline: "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)]",
  };

  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}