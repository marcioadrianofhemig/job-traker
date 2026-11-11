export const APPLICATION_STATUSES = [
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type Application = {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  applied_on: string;
  notes: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  application_id: string;
  title: string;
  due_date: string | null;
  done: boolean;
  created_at: string;
};

/** Result of a form submission, shown to the user by <FormMessage>. */
export type FormState = { ok: boolean; message: string } | null;

export type FormAction = (
  prevState: FormState,
  formData: FormData,
) => Promise<FormState>;

export function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_RE.test(value);
}
