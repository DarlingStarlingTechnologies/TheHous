import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  const isAdmin = user?.role === "admin";
  const firstName = ((user?.name as string) || "").split(" ")[0] || "Guest";
  const [projects, legalItems, financialItems, bookings] = await Promise.all([
    prisma.project.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.legalItem.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.financialItem.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.booking.findMany({
      where: { dateTime: { gte: new Date() } },
      orderBy: { dateTime: "asc" },
      take: 5,
    }),
  ]);

  const stats = [
    {
      label: "Active Projects",
      value: projects.filter((p) => p.status === "active").length,
      total: projects.length,
      href: "/portal/projects",
    },
    {
      label: "Legal Items",
      value: legalItems.filter((l) => l.status === "needs-attention").length,
      sublabel: "need attention",
      total: legalItems.length,
      href: "/portal/legal",
    },
    {
      label: "Active Financial",
      value: financialItems.filter((f) => f.status === "active").length,
      total: financialItems.length,
      href: "/portal/financial",
    },
    {
      label: "Upcoming Bookings",
      value: bookings.length,
      href: "/portal/bookings",
    },
  ];

  function statusColor(status: string) {
    const colors: Record<string, string> = {
      active: "text-emerald-400",
      completed: "text-cream-dim",
      paused: "text-amber-400",
      "in-progress": "text-blue-400",
      "needs-attention": "text-red-400",
      pending: "text-amber-400",
      confirmed: "text-emerald-400",
      tentative: "text-amber-400",
      canceled: "text-red-400/60",
    };
    return colors[status] || "text-cream-dim";
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-10">
        <p className="text-cream-dim/40 text-xs tracking-[0.3em] uppercase mb-3">
          {getGreeting()}
        </p>
        <h1 className="font-serif text-4xl font-light text-white tracking-wide">
          {firstName}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="block w-8 h-px bg-gold/30" />
          <p className="text-gold-dim text-xs tracking-widest uppercase">
            {isAdmin ? "Site Administrator" : "Guest of The Hous"}
          </p>
        </div>
        <p className="text-cream-dim/50 text-sm mt-4 max-w-lg">
          {isAdmin
            ? "Welcome back to your headquarters. Everything is running."
            : "Welcome inside. The Hous is still being built around you — thank you for being here early."}
        </p>
      </div>

      {/* Integration Notes — admin only */}
      {isAdmin && (
        <div className="mb-8 bg-bg-card border border-border rounded-lg p-4">
          <p className="text-amber-400/80 text-xs uppercase tracking-widest mb-1">Future Integration</p>
          <p className="text-cream-dim/60 text-sm">
            Booking talent performer list is currently hardcoded. This will be managed dynamically
            via Starling Premium Media Tools once that platform is live.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="bg-bg-card border border-border rounded-lg p-5 hover:border-border-light transition-colors group"
          >
            <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-3xl font-serif text-white group-hover:text-gold transition-colors">
              {stat.value}
            </p>
            {stat.sublabel && (
              <p className="text-cream-dim/40 text-xs mt-1">{stat.sublabel}</p>
            )}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-lg text-white">Recent Projects</h2>
            <a
              href="/portal/projects"
              className="text-cream-dim/40 text-xs hover:text-gold transition-colors"
            >
              View all →
            </a>
          </div>
          <div className="divide-y divide-border">
            {projects.length === 0 ? (
              <p className="p-4 text-cream-dim/40 text-sm">No projects yet</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-cream text-sm">{project.title}</p>
                    {project.nextAction && (
                      <p className="text-cream-dim/40 text-xs mt-0.5">
                        Next: {project.nextAction}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs capitalize ${statusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-lg text-white">Upcoming Bookings</h2>
            <a
              href="/portal/bookings"
              className="text-cream-dim/40 text-xs hover:text-gold transition-colors"
            >
              View all →
            </a>
          </div>
          <div className="divide-y divide-border">
            {bookings.length === 0 ? (
              <p className="p-4 text-cream-dim/40 text-sm">
                No upcoming bookings
              </p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-cream text-sm">{booking.title}</p>
                    {booking.location && (
                      <p className="text-cream-dim/40 text-xs mt-0.5">
                        {booking.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-cream-dim text-xs">
                      {formatDate(booking.dateTime)}
                    </p>
                    <span className={`text-xs capitalize ${statusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
