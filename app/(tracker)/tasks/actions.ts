"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { isUuid, type FormState } from "@/lib/types";

const NOT_LOGGED_IN: FormState = {
  ok: false,
  message: "You are not logged in. Please log in again.",
};

function readTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();

  if (!title) return { error: "Title is required." };
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { error: "Due date is not a valid date." };
  }
  return { values: { title, due_date: dueDate || null } };
}

function revalidateAll() {
  revalidatePath("/tasks");
  revalidatePath("/applications/[id]", "page");
}

export async function createTask(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const applicationId = String(formData.get("application_id") ?? "");
  if (!isUuid(applicationId)) {
    return { ok: false, message: "Please pick an application." };
  }

  const parsed = readTask(formData);
  if ("error" in parsed) return { ok: false, message: parsed.error! };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return NOT_LOGGED_IN;

  const { error } = await supabase.from("tasks").insert({
    ...parsed.values,
    application_id: applicationId,
    user_id: userId,
  });

  if (error) {
    return { ok: false, message: `Could not save the task: ${error.message}` };
  }

  revalidateAll();
  return { ok: true, message: "Task saved." };
}

export async function updateTask(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return { ok: false, message: "Task not found." };

  const parsed = readTask(formData);
  if ("error" in parsed) return { ok: false, message: parsed.error! };

  const supabase = await createClient();
  if (!(await getUserId(supabase))) return NOT_LOGGED_IN;

  const { data, error } = await supabase
    .from("tasks")
    .update(parsed.values)
    .eq("id", id)
    .select("id");

  if (error) {
    return { ok: false, message: `Could not save the task: ${error.message}` };
  }
  if (!data?.length) return { ok: false, message: "Task not found." };

  revalidateAll();
  return { ok: true, message: "Changes saved." };
}

export async function setTaskDone(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return { ok: false, message: "Task not found." };
  const done = formData.get("done") === "true";

  const supabase = await createClient();
  if (!(await getUserId(supabase))) return NOT_LOGGED_IN;

  const { data, error } = await supabase
    .from("tasks")
    .update({ done })
    .eq("id", id)
    .select("id");

  if (error) {
    return { ok: false, message: `Could not update the task: ${error.message}` };
  }
  if (!data?.length) return { ok: false, message: "Task not found." };

  revalidateAll();
  return { ok: true, message: done ? "Marked as done." : "Marked as not done." };
}

export async function deleteTask(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return { ok: false, message: "Task not found." };

  const supabase = await createClient();
  if (!(await getUserId(supabase))) return NOT_LOGGED_IN;

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return { ok: false, message: `Could not delete the task: ${error.message}` };
  }
  if (!data?.length) return { ok: false, message: "Task not found." };

  revalidateAll();
  return { ok: true, message: "Task deleted." };
}
