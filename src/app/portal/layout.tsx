import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/portal/Sidebar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;

  if (!session?.user) {
    redirect("/login");
  }

  // Non-admin users must be approved
  if (user?.role !== "admin" && user?.status !== "approved") {
    redirect("/login?error=pending");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-bg-deep">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
