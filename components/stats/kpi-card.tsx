import { cn } from "@/lib/utils";

/** A single headline number with a label and an optional hint line. */
export function KpiCard({
  label,
  value,
  hint,
  alert = false,
}: {
  label: string;
  value: string | number;
  hint?: React.ReactNode;
  /** Draws attention to the hint (e.g. overdue tasks). */
  alert?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-3xl font-semibold tabular-nums">{value}</span>
      {hint && (
        <span
          className={cn(
            "text-xs",
            alert
              ? "font-medium text-red-600 dark:text-red-400"
              : "text-muted-foreground",
          )}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
