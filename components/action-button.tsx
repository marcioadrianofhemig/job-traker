"use client";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
import { useFormAction } from "@/components/use-form-action";
import type { FormAction } from "@/lib/types";

/** A one-button form, used for delete and mark-done actions. */
export function ActionButton({
  action,
  fields,
  label,
  pendingLabel = "Working…",
  confirmText,
  variant = "outline",
  showSuccess = true,
}: {
  action: FormAction;
  fields: Record<string, string>;
  label: string;
  pendingLabel?: string;
  confirmText?: string;
  variant?: "outline" | "destructive" | "default" | "secondary";
  showSuccess?: boolean;
}) {
  const { state, pending, formRef, onSubmit } = useFormAction(action);

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        if (confirmText && !window.confirm(confirmText)) {
          event.preventDefault();
          return;
        }
        onSubmit(event);
      }}
      className="inline-flex flex-col gap-1"
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button type="submit" size="sm" variant={variant} disabled={pending}>
        {pending ? pendingLabel : label}
      </Button>
      <FormMessage state={state} showSuccess={showSuccess} />
    </form>
  );
}
