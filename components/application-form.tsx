"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { useFormAction } from "@/components/use-form-action";
import {
  APPLICATION_STATUSES,
  statusLabel,
  type Application,
  type FormAction,
} from "@/lib/types";

/** Same look as <Input>, for <select> and <textarea>. */
export const fieldClass =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export function ApplicationForm({
  action,
  application,
  submitLabel,
}: {
  action: FormAction;
  application?: Application;
  submitLabel: string;
}) {
  const isNew = !application;
  const { state, pending, formRef, onSubmit } = useFormAction(action, isNew);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      {application && <input type="hidden" name="id" value={application.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            required
            defaultValue={application?.company}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            required
            defaultValue={application?.position}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={application?.status ?? "applied"}
            className={`${fieldClass} h-9`}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="applied_on">Application date</Label>
          <Input
            id="applied_on"
            name="applied_on"
            type="date"
            required={!isNew}
            defaultValue={application?.applied_on}
          />
          {isNew && (
            <p className="text-xs text-muted-foreground">
              Leave empty to use today.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={application?.notes ?? ""}
          className={`${fieldClass} py-2`}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
