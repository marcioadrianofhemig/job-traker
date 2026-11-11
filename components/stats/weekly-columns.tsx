import { barHover, seriesFill } from "@/components/stats/chart-colors";
import { cn } from "@/lib/utils";

/** "2026-11-09" -> "09/11" */
function shortDate(day: string) {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
}

/**
 * Columns for applications per week. Non-zero weeks carry their value above
 * the column; a screen-reader table lists every week.
 */
export function WeeklyColumns({
  weeks,
}: {
  weeks: { weekStart: string; count: number }[];
}) {
  const max = Math.max(1, ...weeks.map((w) => w.count));

  return (
    <figure className="flex flex-col gap-2">
      <div className="flex h-40 items-end gap-[2px] border-b border-foreground/20">
        {weeks.map((w) => {
          const text = `Week of ${shortDate(w.weekStart)}: ${w.count} application${w.count === 1 ? "" : "s"}`;
          return (
            <div
              key={w.weekStart}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              {w.count > 0 && (
                <span className="text-xs font-medium tabular-nums">{w.count}</span>
              )}
              {w.count > 0 && (
                <div
                  tabIndex={0}
                  role="img"
                  aria-label={text}
                  title={text}
                  className={cn("w-full max-w-10 rounded-t-[4px]", seriesFill, barHover)}
                  style={{ height: `${(w.count / max) * 80}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-[2px]" aria-hidden>
        {weeks.map((w) => (
          <span
            key={w.weekStart}
            className="flex-1 text-center text-xs text-muted-foreground tabular-nums"
          >
            {shortDate(w.weekStart)}
          </span>
        ))}
      </div>
      <figcaption className="text-xs text-muted-foreground">
        Applications per week (week starting Monday), by application date.
      </figcaption>
      <table className="sr-only">
        <thead>
          <tr>
            <th>Week starting</th>
            <th>Applications</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.weekStart}>
              <td>{w.weekStart}</td>
              <td>{w.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
