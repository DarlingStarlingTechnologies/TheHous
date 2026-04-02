"use client";

import { useCallback, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  status: string;
  role: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  approved: "text-emerald-400",
  pending: "text-amber-400",
  restricted: "text-red-400",
};

const statusBgColors: Record<string, string> = {
  approved: "bg-emerald-400/10 border-emerald-400/20",
  pending: "bg-amber-400/10 border-amber-400/20",
  restricted: "bg-red-400/10 border-red-400/20",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      setUsers(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );
    if (newStatus === "approved") {
      const data = await res.json();
      if (data.emailSent) {
        showToast("User approved. Welcome email sent.", "success");
      } else {
        showToast("User approved. Welcome email could not be sent.", "error");
      }
    } else if (newStatus === "restricted") {
      showToast("User access restricted.", "success");
    }
  }

  async function removeUser(id: string) {
    if (!window.confirm("Remove this user permanently?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  const [sending, setSending] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function resendWelcome(id: string) {
    setSending(id);
    const res = await fetch(`/api/users/${id}`, { method: "POST" });
    if (res.ok) {
      showToast("Welcome email delivered.", "success");
    } else {
      showToast("Failed to send email. Check SendGrid configuration.", "error");
    }
    setSending(null);
  }

  const filtered =
    filter === "all" ? users : users.filter((u) => u.status === filter);

  const counts = {
    all: users.length,
    pending: users.filter((u) => u.status === "pending").length,
    approved: users.filter((u) => u.status === "approved").length,
    restricted: users.filter((u) => u.status === "restricted").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-white">
          User Management
        </h1>
        <p className="text-cream-dim/60 text-sm mt-1">
          Approve or restrict access for Google-authenticated users.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(["all", "pending", "approved", "restricted"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 ${
              filter === key
                ? "bg-gold/10 border-gold/20"
                : "bg-bg-card border-border hover:border-border-light"
            }`}
          >
            <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">
              {key}
            </p>
            <p className={`text-2xl font-serif ${filter === key ? "text-gold" : "text-white"}`}>
              {counts[key]}
            </p>
          </button>
        ))}
      </div>

      {/* Pending alert */}
      {counts.pending > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-amber-400/20 bg-amber-400/5">
          <p className="text-amber-400/80 text-sm">
            {counts.pending} user{counts.pending !== 1 && "s"} awaiting approval.
          </p>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <p className="text-cream-dim/40 text-sm">Loading users...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-cream-dim/40 text-sm">
            {filter === "all"
              ? "No users have signed in yet."
              : `No ${filter} users.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-bg-card border border-border rounded-lg p-4 flex items-center gap-4"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-cream-dim/40 text-sm">
                    {(user.name || user.email)[0].toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm truncate">
                  {user.name || "No name"}
                </p>
                <p className="text-cream-dim/50 text-xs truncate">
                  {user.email}
                </p>
              </div>

              {/* Status badge */}
              <span
                className={`text-xs capitalize px-2.5 py-1 rounded-full border ${statusColors[user.status]} ${statusBgColors[user.status]}`}
              >
                {user.status}
              </span>

              {/* Joined */}
              <span className="text-cream-dim/30 text-xs hidden sm:block">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {user.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(user.id, "approved")}
                    className="text-xs text-emerald-400/70 hover:text-emerald-400 border border-emerald-400/20 hover:border-emerald-400/40 rounded px-3 py-1.5 transition-all"
                  >
                    Approve
                  </button>
                )}
                {user.status === "approved" && (
                  <button
                    onClick={() => resendWelcome(user.id)}
                    disabled={sending === user.id}
                    className="text-xs text-gold/50 hover:text-gold border border-gold/15 hover:border-gold/30 rounded px-3 py-1.5 transition-all disabled:opacity-40"
                  >
                    {sending === user.id ? "Sending..." : "Resend Welcome"}
                  </button>
                )}
                {user.status !== "restricted" && (
                  <button
                    onClick={() => updateStatus(user.id, "restricted")}
                    className="text-xs text-red-400/50 hover:text-red-400 border border-red-400/15 hover:border-red-400/30 rounded px-3 py-1.5 transition-all"
                  >
                    Restrict
                  </button>
                )}
                <button
                  onClick={() => removeUser(user.id)}
                  className="text-xs text-cream-dim/20 hover:text-red-400 transition-colors px-1"
                  title="Remove permanently"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-lg border backdrop-blur-sm ${
              toast.type === "success"
                ? "bg-bg-card/95 border-gold/20 text-gold"
                : "bg-bg-card/95 border-red-400/20 text-red-400/80"
            }`}
          >
            <span className="text-sm">{toast.type === "success" ? "✦" : "!"}</span>
            <p className="text-sm">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="text-cream-dim/30 hover:text-cream-dim/60 transition-colors ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
