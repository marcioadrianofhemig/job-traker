import type { FormState } from "@/lib/types";

export function FormMessage({
  state,
  showSuccess = true,
}: {
  state: FormState;
  showSuccess?: boolean;
}) {
  if (!state || (state.ok && !showSuccess)) return null;

  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={
        state.ok
          ? "text-sm text-green-700 dark:text-green-400"
          : "text-sm text-red-600 dark:text-red-400"
      }
    >
      {state.message}
    </p>
  );
}
