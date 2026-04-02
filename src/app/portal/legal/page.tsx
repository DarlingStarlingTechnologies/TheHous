"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "@/components/portal/Modal";

/* ───────── Types ───────── */

type LegalType =
  | "formation"
  | "contract"
  | "filing"
  | "license"
  | "trademark"
  | "other";

type LegalStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "needs-attention";

interface LegalItem {
  id: string;
  title: string;
  type: LegalType;
  status: LegalStatus;
  deadline: string | null;
  notes: string | null;
  documentRef: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LegalFormData {
  title: string;
  type: LegalType;
  status: LegalStatus;
  deadline: string;
  notes: string;
  documentRef: string;
}

/* ───────── Constants ───────── */

const LEGAL_TYPES: { value: LegalType; label: string }[] = [
  { value: "formation", label: "Formation" },
  { value: "contract", label: "Contract" },
  { value: "filing", label: "Filing" },
  { value: "license", label: "License" },
  { value: "trademark", label: "Trademark" },
  { value: "other", label: "Other" },
];

const LEGAL_STATUSES: { value: LegalStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "needs-attention", label: "Needs Attention" },
];

const STATUS_COLORS: Record<LegalStatus, string> = {
  pending: "text-amber-400",
  "in-progress": "text-blue-400",
  completed: "text-emerald-400",
  "needs-attention": "text-red-400",
};

const TYPE_BADGE_COLORS: Record<LegalType, string> = {
  formation: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  contract: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  filing: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  license: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  trademark: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  other: "bg-cream-dim/10 text-cream-dim border-cream-dim/30",
};

const EMPTY_FORM: LegalFormData = {
  title: "",
  type: "formation",
  status: "pending",
  deadline: "",
  notes: "",
  documentRef: "",
};

/* ───────── Helpers ───────── */

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDeadlineRelative(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = new Date();
  const deadline = new Date(dateStr);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays <= 7) return `in ${diffDays}d`;
  return "";
}

/* ───────── Component ───────── */

export default function LegalPage() {
  const [items, setItems] = useState<LegalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<LegalStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<LegalType | "all">("all");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LegalItem | null>(null);
  const [formData, setFormData] = useState<LegalFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  /* ── Fetch ── */

  const fetchItems = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/legal");
      if (!res.ok) throw new Error("Failed to fetch legal items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ── Filtered items ── */

  const filteredItems = items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    return true;
  });

  /* ── Modal open / close ── */

  function openCreateModal() {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(item: LegalItem) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      status: item.status,
      deadline: item.deadline ? item.deadline.slice(0, 10) : "",
      notes: item.notes ?? "",
      documentRef: item.documentRef ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
  }

  /* ── Save (create / update) ── */

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      const body = {
        title: formData.title.trim(),
        type: formData.type,
        status: formData.status,
        deadline: formData.deadline || null,
        notes: formData.notes.trim() || null,
        documentRef: formData.documentRef.trim() || null,
      };

      if (editingItem) {
        const res = await fetch(`/api/legal/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update item");
      } else {
        const res = await fetch("/api/legal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create item");
      }

      closeModal();
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  /* ── Delete ── */

  async function handleDelete(item: LegalItem) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/legal/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  /* ── Form field updater ── */

  function updateField<K extends keyof LegalFormData>(
    key: K,
    value: LegalFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  /* ── Render ── */

  const inputClass =
    "w-full bg-bg-card border border-border rounded px-3 py-2 text-cream text-sm focus:border-gold-dim focus:outline-none";

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">Legal</h1>
          <p className="text-cream-dim/60 text-sm mt-1">
            Track legal and business formation items.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors"
        >
          Add Item
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400/60 hover:text-red-400 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-cream-dim/60 text-xs uppercase tracking-widest mr-1">
          Filter
        </span>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              statusFilter === "all"
                ? "bg-gold/10 text-gold border border-gold/30"
                : "text-cream-dim/60 hover:text-cream border border-transparent"
            }`}
          >
            All
          </button>
          {LEGAL_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                statusFilter === s.value
                  ? "bg-gold/10 text-gold border border-gold/30"
                  : "text-cream-dim/60 hover:text-cream border border-transparent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <span className="text-border mx-1">|</span>

        {/* Type filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              typeFilter === "all"
                ? "bg-gold/10 text-gold border border-gold/30"
                : "text-cream-dim/60 hover:text-cream border border-transparent"
            }`}
          >
            All Types
          </button>
          {LEGAL_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                typeFilter === t.value
                  ? "bg-gold/10 text-gold border border-gold/30"
                  : "text-cream-dim/60 hover:text-cream border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-cream-dim/40 text-sm">Loading legal items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-cream-dim/40 text-sm">
              {items.length === 0
                ? "No legal items yet. Add one to get started."
                : "No items match the current filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-xs uppercase tracking-widest text-cream-dim/60 font-normal">
                    Title
                  </th>
                  <th className="px-5 py-3 text-xs uppercase tracking-widest text-cream-dim/60 font-normal">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs uppercase tracking-widest text-cream-dim/60 font-normal">
                    Deadline
                  </th>
                  <th className="px-5 py-3 text-xs uppercase tracking-widest text-cream-dim/60 font-normal">
                    Document Ref
                  </th>
                  <th className="px-5 py-3 text-xs uppercase tracking-widest text-cream-dim/60 font-normal text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => {
                  const relativeDeadline = formatDeadlineRelative(item.deadline);
                  const isOverdue = relativeDeadline === "overdue";

                  return (
                    <tr
                      key={item.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Title + Type Badge */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-cream text-sm">
                            {item.title}
                          </span>
                          <span
                            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider leading-none ${TYPE_BADGE_COLORS[item.type]}`}
                          >
                            {item.type}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-cream-dim/40 text-xs mt-1 line-clamp-1 max-w-xs">
                            {item.notes}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm capitalize ${STATUS_COLORS[item.status]}`}
                        >
                          {item.status.replace("-", " ")}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm ${isOverdue ? "text-red-400" : "text-cream-dim"}`}
                        >
                          {formatDate(item.deadline)}
                        </span>
                        {relativeDeadline && (
                          <span
                            className={`ml-2 text-xs ${isOverdue ? "text-red-400/80" : "text-cream-dim/40"}`}
                          >
                            ({relativeDeadline})
                          </span>
                        )}
                      </td>

                      {/* Document Ref */}
                      <td className="px-5 py-4">
                        {item.documentRef ? (
                          <span className="text-sm text-cream-dim">
                            {item.documentRef}
                          </span>
                        ) : (
                          <span className="text-sm text-cream-dim/30">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-cream-dim/60 hover:text-gold text-xs uppercase tracking-wider transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-400/60 hover:text-red-400 text-xs uppercase tracking-wider transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {!loading && items.length > 0 && (
          <div className="border-t border-border px-5 py-3 flex items-center justify-between">
            <p className="text-cream-dim/40 text-xs">
              {filteredItems.length} of {items.length} item
              {items.length !== 1 ? "s" : ""}
              {statusFilter !== "all" || typeFilter !== "all"
                ? " (filtered)"
                : ""}
            </p>
            <p className="text-cream-dim/40 text-xs">
              {items.filter((i) => i.status === "needs-attention").length} need
              attention
            </p>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? "Edit Legal Item" : "Add Legal Item"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-cream-dim text-xs uppercase tracking-widest mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. LLC Formation"
              className={inputClass}
            />
          </div>

          {/* Type + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cream-dim text-xs uppercase tracking-widest mb-1.5">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  updateField("type", e.target.value as LegalType)
                }
                className={inputClass}
              >
                {LEGAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-cream-dim text-xs uppercase tracking-widest mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  updateField("status", e.target.value as LegalStatus)
                }
                className={inputClass}
              >
                {LEGAL_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-cream-dim text-xs uppercase tracking-widest mb-1.5">
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => updateField("deadline", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Document Ref */}
          <div>
            <label className="block text-cream-dim text-xs uppercase tracking-widest mb-1.5">
              Document Reference
            </label>
            <input
              type="text"
              value={formData.documentRef}
              onChange={(e) => updateField("documentRef", e.target.value)}
              placeholder="Link or reference number"
              className={inputClass}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-cream-dim text-xs uppercase tracking-widest mb-1.5">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="text-cream-dim/60 hover:text-cream text-sm transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title.trim()}
              className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving..."
                : editingItem
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
