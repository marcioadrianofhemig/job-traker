"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { APPLICATION_STATUSES, isUuid, type FormState } from "@/lib/types";

const NOT_LOGGED_IN: FormState = {
  ok: false,
  message: "You are not logged in. Please log in again.",
};

function readApplication(formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const appliedOn = String(formData.get("applied_on") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!company) return { error: "Company is required." };
  if (!position) return { error: "Position is required." };
  if (!(APPLICATION_STATUSES as readonly string[]).includes(status)) {
    return { error: "Please pick a valid status." };
  }
  if (appliedOn && !/^\d{4}-\d{2}-\d{2}$/.test(appliedOn)) {
    return { error: "Application date is not a valid date." };
  }

  return {
    values: {
      company,
      position,
      status,
      notes: notes || null,
      // Empty date: let the database use today's date.
      ...(appliedOn ? { applied_on: appliedOn } : {}),
    },
  };
}

function revalidateAll() {
  revalidatePath("/applications");
  revalidatePath("/applications/[id]", "page");
  revalidatePath("/tasks");
}

export async function createApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = readApplication(formData);
  if ("error" in parsed) return { ok: false, message: parsed.error! };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return NOT_LOGGED_IN;

  const { error } = await supabase
    .from("applications")
    .insert({ ...parsed.values, user_id: userId });

  if (error) {
    return { ok: false, message: `Could not save the application: ${error.message}` };
  }

  revalidateAll();
  return { ok: true, message: "Application saved." };
}

export async function updateApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return { ok: false, message: "Application not found." };

  const parsed = readApplication(formData);
  if ("error" in parsed) return { ok: false, message: parsed.error! };

  const supabase = await createClient();
  if (!(await getUserId(supabase))) return NOT_LOGGED_IN;

  const { data, error } = await supabase
    .from("applications")
    .update(parsed.values)
    .eq("id", id)
    .select("id");

  if (error) {
    return { ok: false, message: `Could not save the application: ${error.message}` };
  }
  if (!data?.length) return { ok: false, message: "Application not found." };

  revalidateAll();
  return { ok: true, message: "Changes saved." };
}

export async function deleteApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return { ok: false, message: "Application not found." };

  const supabase = await createClient();
  if (!(await getUserId(supabase))) return NOT_LOGGED_IN;

  const { data, error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return { ok: false, message: `Could not delete the application: ${error.message}` };
  }
  if (!data?.length) return { ok: false, message: "Application not found." };

  revalidateAll();
  redirect("/applications");
}
