"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: "◈" },
  { href: "/portal/projects", label: "Projects", icon: "◆" },
  { href: "/portal/legal", label: "Legal", icon: "◇" },
  { href: "/portal/financial", label: "Financial", icon: "◊" },
  { href: "/portal/performances", label: "Performances", icon: "✦" },
  { href: "/portal/assets", label: "Assets", icon: "❖" },
  { href: "/portal/bookings", label: "Bookings", icon: "◈" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const isAdmin = user?.role === "admin";
  const userName = (user?.name as string) || null;
  const userEmail = (user?.email as string) || null;
  const userImage = (user?.image as string) || null;

  return (
    <aside className="w-64 bg-bg-dark border-r border-border flex flex-col min-h-screen">
      {/* Branding */}
      <div className="p-6 pb-5 border-b border-border">
        <Link href="/portal" className="flex items-center gap-4">
          <img src="/logo.png" alt="" className="w-14 h-14 opacity-90 flex-shrink-0" />
          <div>
            <h1 className="font-serif text-xl font-light text-gold tracking-wide leading-tight">
              Hous of The
              <br />
              Darling Starling
            </h1>
            <p className="text-cream-dim/30 text-[10px] mt-1 tracking-widest uppercase">
              Private Portal
            </p>
          </div>
        </Link>
      </div>

      {/* User profile card */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
            {userImage ? (
              <img
                src={userImage}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-gold/60 text-sm font-serif">
                {(userName || userEmail || "?")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-cream text-sm truncate">
              {userName || "Guest"}
            </p>
            <p className="text-gold-dim text-[10px] tracking-widest uppercase">
              {isAdmin ? "Site Administrator" : "Guest of The Hous"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200
                ${
                  isActive
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-cream-dim hover:text-cream hover:bg-bg-card border border-transparent"
                }`}
            >
              <span className={`text-xs ${isActive ? "text-gold" : "text-cream-dim/50"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* Admin-only: User Management */}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-cream-dim/25 text-[10px] tracking-widest uppercase">Admin</p>
            </div>
            <Link
              href="/portal/users"
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200
                ${
                  pathname.startsWith("/portal/users")
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-cream-dim hover:text-cream hover:bg-bg-card border border-transparent"
                }`}
            >
              <span className={`text-xs ${pathname.startsWith("/portal/users") ? "text-gold" : "text-cream-dim/50"}`}>
                ◉
              </span>
              User Management
            </Link>
            <Link
              href="/portal/queue"
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200
                ${
                  pathname.startsWith("/portal/queue")
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-cream-dim hover:text-cream hover:bg-bg-card border border-transparent"
                }`}
            >
              <span className={`text-xs ${pathname.startsWith("/portal/queue") ? "text-gold" : "text-cream-dim/50"}`}>
                ◆
              </span>
              Directive Queue
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 pb-16 border-t border-border space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded text-sm text-cream-dim/60
                     hover:text-cream-dim hover:bg-bg-card transition-all duration-200"
        >
          <span className="text-xs">←</span>
          Public Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-cream-dim/60
                     hover:text-red-400/80 hover:bg-red-400/5 transition-all duration-200 text-left"
        >
          <span className="text-xs">⏻</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
