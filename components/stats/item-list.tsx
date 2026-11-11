import Link from "next/link";

export type ItemListRow = {
  key: string;
  title: React.ReactNode;
  /** Optional link shown on the right, e.g. the company. */
  link?: { href: string; label: string } | null;
  meta: React.ReactNode;
  /** Draws attention to `meta` (e.g. overdue). */
  alert?: boolean;
};

/**
 * Bordered list of rows used by the statistics page. Shows `empty` when there
 * are no rows and a "+N more" line when `total` exceeds the rows shown.
 */
export function ItemList({
  rows,
  total = rows.length,
  empty,
}: {
  rows: ItemListRow[];
  total?: number;
  empty: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  const hidden = total - rows.length;

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col divide-y rounded-md border">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
          >
            <span className="font-medium">{row.title}</span>
            <span className="flex items-center gap-3">
              {row.link && (
                <Link href={row.link.href} className="underline underline-offset-4">
                  {row.link.label}
                </Link>
              )}
              <span
                className={
                  row.alert
                    ? "font-medium text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                }
              >
                {row.meta}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <p className="text-xs text-muted-foreground">+{hidden} more</p>
      )}
    </div>
  );
}
