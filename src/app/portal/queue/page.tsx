"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Modal from "@/components/portal/Modal";

/* ── types ─────────────────────────────────────────────────── */

type DirectiveStatus = "pending" | "claimed" | "running" | "completed" | "failed";

interface Directive {
  id: string;
  instruction: string;
  status: DirectiveStatus;
  targetPath: string | null;
  branch: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  claimedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  result: {
    durationMs: number;
    summary: string;
  } | null;
}

interface FormData {
  instruction: string;
  targetPath: string;
  branch: string;
  metadata: string;
}

const emptyForm: FormData = {
  instruction: "",
  targetPath: "",
  branch: "",
  metadata: "",
};

const STATUSES: { value: DirectiveStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "claimed", label: "Claimed" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

/* ── helpers ───────────────────────────────────────────────── */

function statusColor(s: DirectiveStatus) {
  switch (s) {
    case "pending":
      return "text-cream-dim/60";
    case "claimed":
      return "text-blue-400";
    case "running":
      return "text-amber-400";
    case "completed":
      return "text-emerald-400";
    case "failed":
      return "text-red-400";
  }
}

function statusBg(s: DirectiveStatus) {
  switch (s) {
    case "pending":
      return "bg-cream-dim/5 border-cream-dim/20";
    case "claimed":
      return "bg-blue-400/10 border-blue-400/20";
    case "running":
      return "bg-amber-400/10 border-amber-400/20";
    case "completed":
      return "bg-emerald-400/10 border-emerald-400/20";
    case "failed":
      return "bg-red-400/10 border-red-400/20";
  }
}

function formatDate(iso: string) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

function truncateText(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max) + "\u2026";
}

/* ── component ─────────────────────────────────────────────── */

export default function QueuePage() {
  const [items, setItems] = useState<Directive[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [filter, setFilter] = useState<DirectiveStatus | "all">("all");
  const [saving, setSaving] = useState(false);

  /* ── fetch ─────────────────────────────────────────────── */

  const fetchDirectives = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/queue/admin");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectives();
  }, [fetchDirectives]);

  /* ── modal helpers ─────────────────────────────────────── */

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
  }

  /* ── save ──────────────────────────────────────────────── */

  async function handleSave() {
    if (!form.instruction.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        instruction: form.instruction,
      };
      if (form.targetPath.trim()) payload.targetPath = form.targetPath;
      if (form.branch.trim()) payload.branch = form.branch;
      if (form.metadata.trim()) payload.metadata = form.metadata;

      const res = await fetch("/api/queue/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [created, ...prev]);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  /* ── delete ────────────────────────────────────────────── */

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this directive? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/queue/admin/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      // silent
    }
  }

  /* ── derived ───────────────────────────────────────────── */

  const visible =
    filter === "all" ? items : items.filter((d) => d.status === filter);

  const inputCls =
    "w-full bg-bg-card border border-border rounded px-3 py-2 text-cream focus:border-gold-dim focus:outline-none";

  /* ── render ────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* header row */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">
            Directive Queue
          </h1>
          <p className="text-cream-dim/60 text-sm mt-1">
            Manage directives for the RunIt Worker.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors"
        >
          New Directive
        </button>
      </div>

      {/* status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`rounded-full px-3 py-1 text-xs tracking-wider uppercase transition-colors ${
              filter === s.value
                ? "bg-gold/10 border border-gold/30 text-gold"
                : "border border-border text-cream-dim/60 hover:text-cream hover:border-border"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* table card */}
      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-cream-dim/60 text-sm">
            Loading directives...
          </div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-cream-dim/60 text-sm">
            {filter === "all"
              ? "No directives yet. Create one to get started."
              : `No ${filter} directives.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-cream-dim/60 uppercase tracking-wider text-xs">
                  <th className="px-4 py-3 font-medium">Instruction</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/50 last:border-0 hover:bg-gold/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3 text-cream font-medium max-w-md">
                      <Link
                        href={`/portal/queue/${d.id}`}
                        className="hover:text-gold transition-colors"
                      >
                        {truncateText(d.instruction, 80)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs border capitalize ${statusColor(d.status)} ${statusBg(d.status)}`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cream-dim">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-cream-dim">
                      {d.result ? formatDuration(d.result.durationMs) : "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/portal/queue/${d.id}`}
                          className="text-cream-dim/60 hover:text-gold transition-colors text-xs uppercase tracking-wider"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="text-red-400/60 hover:text-red-400 transition-colors text-xs uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* create modal */}
      <Modal open={modalOpen} onClose={closeModal} title="New Directive">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          {/* instruction */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
              Instruction <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              value={form.instruction}
              onChange={(e) => setForm({ ...form, instruction: e.target.value })}
              rows={4}
              className={inputCls + " resize-none"}
              placeholder="What should Claude Code do?"
            />
          </div>

          {/* target path */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
              Target Path
            </label>
            <input
              type="text"
              value={form.targetPath}
              onChange={(e) => setForm({ ...form, targetPath: e.target.value })}
              className={inputCls}
              placeholder="/optional/path/to/codebase"
            />
          </div>

          {/* branch */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
              Branch
            </label>
            <input
              type="text"
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className={inputCls}
              placeholder="feature/my-branch"
            />
          </div>

          {/* metadata */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
              Metadata (JSON)
            </label>
            <textarea
              value={form.metadata}
              onChange={(e) => setForm({ ...form, metadata: e.target.value })}
              rows={2}
              className={inputCls + " resize-none font-mono text-xs"}
              placeholder='{"key": "value"}'
            />
          </div>

          {/* actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="border border-border text-cream-dim/60 hover:text-cream rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.instruction.trim()}
              className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
