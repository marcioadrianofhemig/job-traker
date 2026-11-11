"use client";

import { startTransition, useActionState, useRef, type FormEvent } from "react";
import type { FormAction, FormState } from "@/lib/types";

/**
 * Runs a server action from a form and keeps its result for <FormMessage>.
 * Unlike a plain `<form action>`, the fields are NOT cleared on error, so
 * the user can fix their input. Pass resetOnSuccess to clear after saving.
 */
export function useFormAction(action: FormAction, resetOnSuccess = false) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, dispatch, pending] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const result = await action(prev, formData);
      if (result?.ok && resetOnSuccess) formRef.current?.reset();
      return result;
    },
    null,
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, formRef, onSubmit };
}
