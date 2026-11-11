import { redirect } from "next/navigation";

// Login and sign-up send users here; the tracker starts at /applications.
export default function ProtectedPage() {
  redirect("/applications");
}
