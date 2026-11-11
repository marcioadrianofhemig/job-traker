import Link from "next/link";
import { ActionButton } from "@/components/action-button";
import { TaskForm } from "@/components/task-form";
import { deleteTask, setTaskDone, updateTask } from "@/app/(tracker)/tasks/actions";
import type { Task } from "@/lib/types";

export type TaskWithApplication = Task & {
  applications?: { company: string; position: string } | null;
};

export function TaskList({
  tasks,
  showApplication = false,
}: {
  tasks: TaskWithApplication[];
  showApplication?: boolean;
}) {
  if (!tasks.length) {
    return <p className="text-sm text-muted-foreground">No tasks yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y rounded-md border">
      {tasks.map((task) => (
        <li key={task.id} className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span
                className={
                  task.done ? "line-through text-muted-foreground" : "font-medium"
                }
              >
                {task.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {task.due_date ? `Due ${task.due_date}` : "No due date"}
                {" · "}
                {task.done ? "Done" : "Not done"}
                {showApplication && task.applications && (
                  <>
                    {" · "}
                    <Link
                      href={`/applications/${task.application_id}`}
                      className="underline underline-offset-4"
                    >
                      {task.applications.company} — {task.applications.position}
                    </Link>
                  </>
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <ActionButton
                action={setTaskDone}
                fields={{ id: task.id, done: String(!task.done) }}
                label={task.done ? "Mark not done" : "Mark done"}
                pendingLabel="Saving…"
                showSuccess={false}
              />
              <ActionButton
                action={deleteTask}
                fields={{ id: task.id }}
                label="Delete"
                pendingLabel="Deleting…"
                variant="destructive"
                confirmText={`Delete the task "${task.title}"?`}
              />
            </div>
          </div>
          <details>
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Edit
            </summary>
            <div className="pt-3">
              <TaskForm action={updateTask} task={task} submitLabel="Save task" />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
