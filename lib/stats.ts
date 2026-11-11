import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
  type Task,
} from "@/lib/types";

export type StatsApplication = Pick<
  Application,
  "id" | "company" | "position" | "status" | "applied_on"
>;
export type StatsTask = Pick<
  Task,
  "id" | "title" | "due_date" | "done" | "application_id"
>;

export type UpcomingTask = StatsTask & {
  overdue: boolean;
  company: string | null;
};

export type StaleApplication = StatsApplication & { daysWaiting: number };

/** A capped list plus how many items were left out. */
export type Capped<T> = { items: T[]; total: number };

export type Stats = {
  totalApplications: number;
  inProgress: number;
  offers: number;
  rejected: number;
  /** rejected / total, 0–1. Null when there are no applications. */
  rejectedShare: number | null;
  /** (interviewing + offer) / total, 0–1. Null when there are no applications. */
  interviewRate: number | null;
  /** (interviewing + offer + rejected) / total, 0–1. Null when there are no applications. */
  responseRate: number | null;
  /** Applications in the current week (last entry of `weekly`). */
  thisWeek: number;
  /** Mean of `weekly` counts. */
  weeklyAverage: number;
  /** Still "applied" more than STALE_DAYS after applying, oldest first. */
  stale: Capped<StaleApplication>;
  /** Applied or interviewing, with no open task. Oldest first. */
  noNextStep: Capped<StatsApplication>;
  byStatus: { status: ApplicationStatus; count: number; share: number }[];
  /** Last 8 weeks (Monday start), oldest first. */
  weekly: { weekStart: string; count: number }[];
  totalTasks: number;
  openTasks: number;
  overdueTasks: number;
  /** done / total, 0–1. Null when there are no tasks. */
  completionRate: number | null;
  upcoming: UpcomingTask[];
};

const WEEKS = 8;
const UPCOMING = 5;
const LIST_LIMIT = 5;
/** An application still "applied" after this many days is probably not getting an answer. */
export const STALE_DAYS = 21;

function cap<T>(items: T[]): Capped<T> {
  return { items: items.slice(0, LIST_LIMIT), total: items.length };
}

const byAppliedOn = (a: StatsApplication, b: StatsApplication) =>
  a.applied_on.localeCompare(b.applied_on);

/** Today's date (YYYY-MM-DD) in Brazil, so "overdue" flips at local midnight. */
export function todayInSaoPaulo(now: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function parseDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatDay(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Monday of the week containing `day`. */
function weekStartOf(day: string) {
  const ms = parseDay(day);
  const weekday = (new Date(ms).getUTCDay() + 6) % 7; // Monday = 0
  return formatDay(ms - weekday * DAY_MS);
}

export function computeStats(
  applications: StatsApplication[],
  tasks: StatsTask[],
  today: string,
): Stats {
  const total = applications.length;

  const counts = Object.fromEntries(
    APPLICATION_STATUSES.map((s) => [s, 0]),
  ) as Record<ApplicationStatus, number>;
  for (const a of applications) counts[a.status] += 1;

  const byStatus = APPLICATION_STATUSES.map((status) => ({
    status,
    count: counts[status],
    share: total ? counts[status] / total : 0,
  }));

  // Last 8 weeks, ending with the current week.
  const currentWeek = parseDay(weekStartOf(today));
  const weekly = Array.from({ length: WEEKS }, (_, i) => ({
    weekStart: formatDay(currentWeek - (WEEKS - 1 - i) * 7 * DAY_MS),
    count: 0,
  }));
  const weekIndex = new Map(weekly.map((w, i) => [w.weekStart, i]));
  for (const a of applications) {
    const i = weekIndex.get(weekStartOf(a.applied_on));
    if (i !== undefined) weekly[i].count += 1;
  }

  const companyById = new Map(applications.map((a) => [a.id, a.company]));
  const open = tasks.filter((t) => !t.done);
  const isOverdue = (t: StatsTask) => t.due_date !== null && t.due_date < today;

  // Open tasks with a due date, soonest first (overdue ones sort to the top).
  const upcoming = open
    .filter((t) => t.due_date !== null)
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .slice(0, UPCOMING)
    .map((t) => ({
      ...t,
      overdue: isOverdue(t),
      company: companyById.get(t.application_id) ?? null,
    }));

  const todayMs = parseDay(today);
  const stale = applications
    .filter((a) => a.status === "applied")
    .map((a) => ({
      ...a,
      daysWaiting: Math.round((todayMs - parseDay(a.applied_on)) / DAY_MS),
    }))
    .filter((a) => a.daysWaiting > STALE_DAYS)
    .sort(byAppliedOn);

  const withOpenTask = new Set(open.map((t) => t.application_id));
  const noNextStep = applications
    .filter(
      (a) =>
        (a.status === "applied" || a.status === "interviewing") &&
        !withOpenTask.has(a.id),
    )
    .sort(byAppliedOn);

  return {
    totalApplications: total,
    inProgress: counts.applied + counts.interviewing,
    offers: counts.offer,
    rejected: counts.rejected,
    rejectedShare: total ? counts.rejected / total : null,
    interviewRate: total ? (counts.interviewing + counts.offer) / total : null,
    responseRate: total
      ? (counts.interviewing + counts.offer + counts.rejected) / total
      : null,
    thisWeek: weekly[WEEKS - 1].count,
    weeklyAverage: weekly.reduce((sum, w) => sum + w.count, 0) / WEEKS,
    stale: cap(stale),
    noNextStep: cap(noNextStep),
    byStatus,
    weekly,
    totalTasks: tasks.length,
    openTasks: open.length,
    overdueTasks: open.filter(isOverdue).length,
    completionRate: tasks.length
      ? (tasks.length - open.length) / tasks.length
      : null,
    upcoming,
  };
}

export function formatPercent(value: number | null) {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}
