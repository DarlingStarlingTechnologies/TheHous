import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function QueueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;

  if (user?.role !== "admin") {
    redirect("/portal");
  }

  return <>{children}</>;
}
