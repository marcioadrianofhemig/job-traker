"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { fieldClass } from "@/components/application-form";
import { useFormAction } from "@/components/use-form-action";
import type { FormAction, Task } from "@/lib/types";

export type ApplicationOption = { id: string; company: string; position: string };

/**
 * Create a task (pass `applicationId` for a fixed application, or
 * `applications` to let the user pick one), or edit one (pass `task`).
 */
export function TaskForm({
  action,
  task,
  applicationId,
  applications,
  submitLabel,
}: {
  action: FormAction;
  task?: Task;
  applicationId?: string;
  applications?: ApplicationOption[];
  submitLabel: string;
}) {
  const isNew = !task;
  const { state, pending, formRef, onSubmit } = useFormAction(action, isNew);
  const prefix = task ? `task-${task.id}` : "new-task";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      {task && <input type="hidden" name="id" value={task.id} />}
      {applicationId && (
        <input type="hidden" name="application_id" value={applicationId} />
      )}

      {applications && (
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-application`}>Application</Label>
          <select
            id={`${prefix}-application`}
            name="application_id"
            required
            defaultValue=""
            className={`${fieldClass} h-9`}
          >
            <option value="" disabled>
              Choose…
            </option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.company} — {a.position}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-2 sm:flex-1">
        <Label htmlFor={`${prefix}-title`}>Title</Label>
        <Input
          id={`${prefix}-title`}
          name="title"
          required
          defaultValue={task?.title}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}-due`}>Due date</Label>
        <Input
          id={`${prefix}-due`}
          name="due_date"
          type="date"
          defaultValue={task?.due_date ?? ""}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
      <div className="sm:basis-full">
        <FormMessage state={state} />
      </div>
    </form>
  );
}
