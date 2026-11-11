import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActionButton } from "@/components/action-button";
import { ApplicationForm } from "@/components/application-form";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { createClient } from "@/lib/supabase/server";
import { isUuid, statusLabel, type Application, type Task } from "@/lib/types";
import { deleteApplication, updateApplication } from "../actions";
import { createTask } from "../../tasks/actions";

export default function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/applications"
        className="text-sm text-muted-foreground hover:underline underline-offset-4"
      >
        ← All applications
      </Link>
      <Suspense fallback={<p className="text-sm">Loading…</p>}>
        <ApplicationDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const [applicationResult, tasksResult] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("tasks")
      .select("*")
      .eq("application_id", id)
      .order("done")
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  if (applicationResult.error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Could not load the application: {applicationResult.error.message}
      </p>
    );
  }
  // Missing, or owned by someone else (row-level security hides it).
  if (!applicationResult.data) notFound();

  const application = applicationResult.data as Application;
  const tasks = (tasksResult.data ?? []) as Task[];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{application.company}</h1>
            <p className="text-muted-foreground">
              {application.position} · {statusLabel(application.status)} · Applied{" "}
              {application.applied_on}
            </p>
          </div>
          <ActionButton
            action={deleteApplication}
            fields={{ id: application.id }}
            label="Delete application"
            pendingLabel="Deleting…"
            variant="destructive"
            confirmText={`Delete ${application.company} and all its tasks? This cannot be undone.`}
          />
        </div>
        <h2 className="text-xl font-semibold">Edit</h2>
        <ApplicationForm
          action={updateApplication}
          application={application}
          submitLabel="Save changes"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        {tasksResult.error ? (
          <p role="alert" className="text-sm text-red-600">
            Could not load tasks: {tasksResult.error.message}
          </p>
        ) : (
          <TaskList tasks={tasks} />
        )}
        <h3 className="font-semibold">Add a task</h3>
        <TaskForm
          action={createTask}
          applicationId={application.id}
          submitLabel="Add task"
        />
      </section>
    </div>
  );
}
