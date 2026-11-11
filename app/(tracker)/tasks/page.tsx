import Link from "next/link";
import { Suspense } from "react";
import { TaskForm, type ApplicationOption } from "@/components/task-form";
import { TaskList, type TaskWithApplication } from "@/components/task-list";
import { createClient } from "@/lib/supabase/server";
import { createTask } from "./actions";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <Suspense fallback={<p className="text-sm">Loading…</p>}>
        <TasksContent />
      </Suspense>
    </div>
  );
}

async function TasksContent() {
  const supabase = await createClient();
  // Row-level security limits both queries to the logged-in user's rows.
  const [tasksResult, applicationsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, applications(company, position)")
      .order("done")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("applications")
      .select("id, company, position")
      .order("company"),
  ]);

  const error = tasksResult.error ?? applicationsResult.error;
  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Could not load tasks: {error.message}
      </p>
    );
  }

  const tasks = (tasksResult.data ?? []) as TaskWithApplication[];
  const applications = (applicationsResult.data ?? []) as ApplicationOption[];

  return (
    <div className="flex flex-col gap-10">
      <TaskList tasks={tasks} showApplication />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Add a task</h2>
        {applications.length ? (
          <TaskForm
            action={createTask}
            applications={applications}
            submitLabel="Add task"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Tasks belong to an application.{" "}
            <Link href="/applications" className="underline underline-offset-4">
              Add an application
            </Link>{" "}
            first.
          </p>
        )}
      </section>
    </div>
  );
}
