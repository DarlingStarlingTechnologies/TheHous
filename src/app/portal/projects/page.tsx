"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "@/components/portal/Modal";

/* ── types ─────────────────────────────────────────────────── */

type Status = "active" | "paused" | "completed" | "archived";
type Priority = "high" | "medium" | "low";

interface Project {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  notes: string;
  dueDate: string;
  nextAction: string;
}

interface FormData {
  title: string;
  status: Status;
  priority: Priority;
  notes: string;
  dueDate: string;
  nextAction: string;
}

const emptyForm: FormData = {
  title: "",
  status: "active",
  priority: "medium",
  notes: "",
  dueDate: "",
  nextAction: "",
};

const STATUSES: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

/* ── helpers ───────────────────────────────────────────────── */

function statusColor(s: Status) {
  switch (s) {
    case "active":
      return "text-emerald-400";
    case "paused":
      return "text-amber-400";
    case "completed":
      return "text-cream-dim";
    case "archived":
      return "text-cream-dim/40";
  }
}

function priorityColor(p: Priority) {
  switch (p) {
    case "high":
      return "text-red-400";
    case "medium":
      return "text-amber-400";
    case "low":
      return "text-cream-dim";
  }
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ── component ─────────────────────────────────────────────── */

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [saving, setSaving] = useState(false);

  /* ── fetch ─────────────────────────────────────────────── */

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // silent — table will show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /* ── modal helpers ─────────────────────────────────────── */

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setForm({
      title: project.title,
      status: project.status,
      priority: project.priority,
      notes: project.notes ?? "",
      dueDate: project.dueDate ?? "",
      nextAction: project.nextAction ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  /* ── save (create / update) ────────────────────────────── */

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/projects/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setItems((prev) =>
            prev.map((p) => (p.id === editing.id ? updated : p)),
          );
        }
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setItems((prev) => [created, ...prev]);
        }
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  /* ── delete ────────────────────────────────────────────── */

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // silent
    }
  }

  /* ── derived ───────────────────────────────────────────── */

  const visible =
    filter === "all" ? items : items.filter((p) => p.status === filter);

  /* ── input classes ─────────────────────────────────────── */

  const inputCls =
    "w-full bg-bg-card border border-border rounded px-3 py-2 text-cream focus:border-gold-dim focus:outline-none";

  /* ── render ────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* header row */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">
            Projects
          </h1>
          <p className="text-cream-dim/60 text-sm mt-1">
            Track and manage current projects.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors"
        >
          Add Project
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
            Loading projects...
          </div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-cream-dim/60 text-sm">
            {filter === "all"
              ? "No projects yet. Create one to get started."
              : `No ${filter} projects.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-cream-dim/60 uppercase tracking-wider text-xs">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Next Action</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-border/50 last:border-0 hover:bg-gold/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3 text-cream font-medium">
                      {project.title}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`capitalize ${statusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`capitalize ${priorityColor(project.priority)}`}
                      >
                        {project.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cream-dim">
                      {formatDate(project.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-cream-dim">
                      {project.nextAction || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(project)}
                          className="text-cream-dim/60 hover:text-gold transition-colors text-xs uppercase tracking-wider"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
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

      {/* modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Project" : "New Project"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          {/* title */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
              placeholder="Project title"
            />
          </div>

          {/* status + priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Status })
                }
                className={inputCls}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as Priority })
                }
                className={inputCls}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* due date */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className={inputCls}
            />
          </div>

          {/* next action */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
              Next Action
            </label>
            <input
              type="text"
              value={form.nextAction}
              onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
              className={inputCls}
              placeholder="What needs to happen next?"
            />
          </div>

          {/* notes */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-dim/60 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Additional notes..."
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
              disabled={saving || !form.title.trim()}
              className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
