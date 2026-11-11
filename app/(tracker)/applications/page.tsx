import Link from "next/link";
import { Suspense } from "react";
import { ApplicationForm } from "@/components/application-form";
import { createClient } from "@/lib/supabase/server";
import { statusLabel, type Application } from "@/lib/types";
import { createApplication } from "./actions";

export default function ApplicationsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Suspense fallback={<p className="text-sm">Loading…</p>}>
          <ApplicationsTable />
        </Suspense>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Add an application</h2>
        <ApplicationForm action={createApplication} submitLabel="Add application" />
      </section>
    </div>
  );
}

async function ApplicationsTable() {
  const supabase = await createClient();
  // Row-level security limits this to the logged-in user's rows.
  const { data, error } = await supabase
    .from("applications")
    .select("id, company, position, status, applied_on")
    .order("applied_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Could not load applications: {error.message}
      </p>
    );
  }

  const applications = (data ?? []) as Pick<
    Application,
    "id" | "company" | "position" | "status" | "applied_on"
  >[];

  if (!applications.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No applications yet. Add your first one below.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left">
          <tr>
            <th className="p-3 font-medium">Company</th>
            <th className="p-3 font-medium">Position</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Applied</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {applications.map((a) => (
            <tr key={a.id}>
              <td className="p-3">
                <Link
                  href={`/applications/${a.id}`}
                  className="font-medium underline underline-offset-4"
                >
                  {a.company}
                </Link>
              </td>
              <td className="p-3">{a.position}</td>
              <td className="p-3">{statusLabel(a.status)}</td>
              <td className="p-3">{a.applied_on}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
