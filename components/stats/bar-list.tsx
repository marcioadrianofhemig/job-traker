import { barHover, seriesFill } from "@/components/stats/chart-colors";
import { cn } from "@/lib/utils";

export type BarListItem = { label: string; value: number; detail?: string };

/**
 * Horizontal bars, one per row, scaled to the largest value. Every value is
 * written next to its bar, so nothing depends on hovering.
 */
export function BarList({
  items,
  ariaLabel,
}: {
  items: BarListItem[];
  ariaLabel: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <ul aria-label={ariaLabel} className="flex flex-col gap-3">
      {items.map((item) => {
        const text = `${item.label}: ${item.value}${item.detail ? ` (${item.detail})` : ""}`;
        return (
          <li key={item.label} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
            <span className="text-sm">{item.label}</span>
            <div className="h-4 w-full">
              {item.value > 0 && (
                <div
                  tabIndex={0}
                  role="img"
                  aria-label={text}
                  title={text}
                  className={cn("h-full rounded-r-[4px]", seriesFill, barHover)}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              )}
            </div>
            <span className="text-sm tabular-nums">
              <span className="font-medium">{item.value}</span>
              {item.detail && (
                <span className="text-muted-foreground"> · {item.detail}</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
