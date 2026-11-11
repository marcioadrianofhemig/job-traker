import Link from "next/link";
import { Suspense } from "react";
import { BarList } from "@/components/stats/bar-list";
import { ItemList } from "@/components/stats/item-list";
import { KpiCard } from "@/components/stats/kpi-card";
import { WeeklyColumns } from "@/components/stats/weekly-columns";
import { createClient } from "@/lib/supabase/server";
import {
  computeStats,
  formatPercent,
  STALE_DAYS,
  todayInSaoPaulo,
  type StatsApplication,
  type StatsTask,
} from "@/lib/stats";
import { statusLabel } from "@/lib/types";

export default function StatsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Statistics</h1>
      <Suspense fallback={<p className="text-sm">Loading…</p>}>
        <StatsContent />
      </Suspense>
    </div>
  );
}

async function StatsContent() {
  const supabase = await createClient();
  // Row-level security limits both queries to the logged-in user's rows.
  const [applicationsResult, tasksResult] = await Promise.all([
    supabase.from("applications").select("id, company, position, status, applied_on"),
    supabase.from("tasks").select("id, title, due_date, done, application_id"),
  ]);

  const error = applicationsResult.error ?? tasksResult.error;
  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Could not load statistics: {error.message}
      </p>
    );
  }

  const applications = (applicationsResult.data ?? []) as StatsApplication[];
  const tasks = (tasksResult.data ?? []) as StatsTask[];

  if (!applications.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Add applications to see statistics.{" "}
        <Link href="/applications" className="underline underline-offset-4">
          Go to Applications
        </Link>
      </p>
    );
  }

  const today = todayInSaoPaulo();
  const stats = computeStats(applications, tasks, today);

  return (
    <div className="flex flex-col gap-10">
      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <KpiCard label="Applications" value={stats.totalApplications} />
        <KpiCard
          label="In progress"
          value={stats.inProgress}
          hint="Applied or interviewing"
        />
        <KpiCard
          label="Interview rate"
          value={formatPercent(stats.interviewRate)}
          hint="Interviewing or offer, by current status"
        />
        <KpiCard
          label="Response rate"
          value={formatPercent(stats.responseRate)}
          hint="Got any answer, by current status"
        />
        <KpiCard label="Offers" value={stats.offers} />
        <KpiCard
          label="Rejected"
          value={stats.rejected}
          hint={`${formatPercent(stats.rejectedShare)} of applications`}
        />
        <KpiCard
          label="This week"
          value={stats.thisWeek}
          hint={`Avg last 8 weeks: ${stats.weeklyAverage.toLocaleString("en-US", { maximumFractionDigits: 1 })}`}
        />
        <KpiCard
          label="Open tasks"
          value={stats.openTasks}
          hint={
            stats.overdueTasks > 0
              ? `${stats.overdueTasks} overdue`
              : "None overdue"
          }
          alert={stats.overdueTasks > 0}
        />
        <KpiCard
          label="Tasks done"
          value={formatPercent(stats.completionRate)}
          hint={`${stats.totalTasks - stats.openTasks} of ${stats.totalTasks}`}
        />
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Applications by status</h2>
          <BarList
            ariaLabel="Applications by status"
            items={stats.byStatus.map((s) => ({
              label: statusLabel(s.status),
              value: s.count,
              detail: formatPercent(s.share),
            }))}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Last 8 weeks</h2>
          <WeeklyColumns weeks={stats.weekly} />
        </section>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Waiting for an answer</h2>
            <p className="text-xs text-muted-foreground">
              Still “Applied” more than {STALE_DAYS} days later.
            </p>
          </div>
          <ItemList
            rows={stats.stale.items.map((a) => ({
              key: a.id,
              title: a.position,
              link: { href: `/applications/${a.id}`, label: a.company },
              meta: `${a.daysWaiting} days`,
            }))}
            total={stats.stale.total}
            empty="Nothing waiting that long."
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">No next step</h2>
            <p className="text-xs text-muted-foreground">
              Applied or interviewing, with no open task.
            </p>
          </div>
          <ItemList
            rows={stats.noNextStep.items.map((a) => ({
              key: a.id,
              title: a.position,
              link: { href: `/applications/${a.id}`, label: a.company },
              meta: statusLabel(a.status),
            }))}
            total={stats.noNextStep.total}
            empty="Every active application has an open task."
          />
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Upcoming tasks</h2>
        <ItemList
          rows={stats.upcoming.map((t) => ({
            key: t.id,
            title: t.title,
            link: t.company
              ? { href: `/applications/${t.application_id}`, label: t.company }
              : null,
            meta: t.overdue ? `⚠ Overdue · ${t.due_date}` : `Due ${t.due_date}`,
            alert: t.overdue,
          }))}
          empty="No open tasks with a due date."
        />
      </section>
    </div>
  );
}
