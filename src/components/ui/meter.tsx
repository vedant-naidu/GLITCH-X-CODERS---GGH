import { cn } from "@/lib/cn";

export function Meter({
  value,
  className,
  label,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const tint =
    value >= 86 ? "bg-emerald-500" : value >= 72 ? "bg-sky-500" : value >= 56 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted">
        <span>{label}</span>
        <span className="font-mono text-foreground">{value.toFixed(0)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
        <div className={cn("h-full rounded-full transition-all", tint)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}