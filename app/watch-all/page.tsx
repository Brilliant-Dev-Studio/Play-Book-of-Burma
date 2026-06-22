import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/auth-helpers";

export default async function WatchAllPage() {
  const session = await getSession();
  if (session) redirect("/user-portal/library");
  redirect("/membership");
}
