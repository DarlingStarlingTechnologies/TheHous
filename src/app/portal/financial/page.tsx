"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/portal/Modal";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Category =
  | "subscription"
  | "obligation"
  | "account"
  | "expense"
  | "reference";

type Status = "active" | "pending" | "canceled" | "completed";

type Frequency = "monthly" | "annual" | "quarterly" | "one-time";

interface FinancialItem {
  id: string;
  title: string;
  category: Category;
  status: Status;
  amount: number | null;
  frequency: string | null;
  notes: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  title: string;
  category: Category;
  status: Status;
  amount: string;
  frequency: string;
  notes: string;
  dueDate: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "subscription", label: "Subscription" },
  { value: "obligation", label: "Obligation" },
  { value: "account", label: "Account" },
  { value: "expense", label: "Expense" },
  { value: "reference", label: "Reference" },
];

const STATUSES: { value: Status; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "canceled", label: "Canceled" },
  { value: "completed", label: "Completed" },
];

const FREQUENCIES: { value: Frequency | ""; label: string }[] = [
  { value: "", label: "None" },
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
  { value: "quarterly", label: "Quarterly" },
  { value: "one-time", label: "One-time" },
];

const STATUS_COLORS: Record<Status, string> = {
  active: "text-emerald-400",
  pending: "text-amber-400",
  canceled: "text-red-400/60",
  completed: "text-cream-dim",
};

const EMPTY_FORM: FormState = {
  title: "",
  category: "expense",
  status: "active",
  amount: "",
  frequency: "",
  notes: "",
  dueDate: "",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatAmount(amount: number | null): string {
  if (amount == null) return "\u2014";
  return `$${amount.toFixed(2)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toMonthly(amount: number, frequency: string | null): number {
  switch (frequency) {
    case "monthly":
      return amount;
    case "annual":
      return amount / 12;
    case "quarterly":
      return amount / 3;
    case "one-time":
      return 0;
    default:
      return 0;
  }
}

/* ------------------------------------------------------------------ */
/*  Shared input classes                                              */
/* ------------------------------------------------------------------ */

const inputCls =
  "w-full bg-bg-card border border-border rounded px-3 py-2 text-cream text-sm focus:border-gold-dim focus:outline-none";

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default function FinancialPage() {
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  /* ----- Fetch ---------------------------------------------------- */

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/financial");
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
    fetchItems();
  }, [fetchItems]);

  /* ----- Derived -------------------------------------------------- */

  const filteredItems =
    categoryFilter === "all"
      ? items
      : items.filter((i) => i.category === categoryFilter);

  const totalMonthlyCost = items.reduce((sum, item) => {
    if (item.status !== "active" || item.amount == null) return sum;
    return sum + toMonthly(item.amount, item.frequency);
  }, 0);

  /* ----- Modal helpers -------------------------------------------- */

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(item: FinancialItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      status: item.status,
      amount: item.amount != null ? String(item.amount) : "",
      frequency: item.frequency ?? "",
      notes: item.notes ?? "",
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  /* ----- CRUD ----------------------------------------------------- */

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);

    const body: Record<string, unknown> = {
      title: form.title.trim(),
      category: form.category,
      status: form.status,
      amount: form.amount ? parseFloat(form.amount) : null,
      frequency: form.frequency || null,
      notes: form.notes.trim() || null,
      dueDate: form.dueDate || null,
    };

    try {
      if (editingId) {
        await fetch(`/api/financial/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/financial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      closeModal();
      await fetchItems();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this financial item? This cannot be undone.")) {
      return;
    }
    await fetch(`/api/financial/${id}`, { method: "DELETE" });
    await fetchItems();
  }

  /* ----- Form field updater --------------------------------------- */

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">
            Financial
          </h1>
          <p className="text-cream-dim/60 text-sm mt-1">
            Track subscriptions, expenses, and financial obligations.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors self-start sm:self-auto"
        >
          Add Item
        </button>
      </div>

      {/* Summary bar */}
      <div className="bg-bg-card border border-border rounded-lg p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">
            Est. Monthly Cost (Active)
          </p>
          <p className="font-serif text-2xl text-gold">
            {formatAmount(totalMonthlyCost)}
          </p>
        </div>
        <div className="flex gap-6 text-sm text-cream-dim/60">
          <span>
            <span className="text-cream">{items.length}</span> total items
          </span>
          <span>
            <span className="text-emerald-400">
              {items.filter((i) => i.status === "active").length}
            </span>{" "}
            active
          </span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`rounded px-3 py-1.5 text-xs uppercase tracking-wider transition-colors border ${
            categoryFilter === "all"
              ? "border-gold/30 bg-gold/10 text-gold"
              : "border-border text-cream-dim/60 hover:border-border-light hover:text-cream-dim"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`rounded px-3 py-1.5 text-xs uppercase tracking-wider transition-colors border ${
              categoryFilter === cat.value
                ? "border-gold/30 bg-gold/10 text-gold"
                : "border-border text-cream-dim/60 hover:border-border-light hover:text-cream-dim"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">
                  Title
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">
                  Category
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">
                  Status
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Amount
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">
                  Frequency
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">
                  Due Date
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-cream-dim/40"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-cream-dim/40"
                  >
                    {categoryFilter === "all"
                      ? "No financial items yet. Add one to get started."
                      : "No items in this category."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-cream">{item.title}</td>
                    <td className="px-4 py-3 text-cream-dim capitalize">
                      {item.category}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`capitalize ${STATUS_COLORS[item.status] ?? "text-cream-dim"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cream text-right tabular-nums">
                      {formatAmount(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-cream-dim capitalize">
                      {item.frequency ?? "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-cream-dim">
                      {formatDate(item.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-cream-dim/60 hover:text-gold text-xs uppercase tracking-wider transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400/60 hover:text-red-400 text-xs uppercase tracking-wider transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Financial Item" : "Add Financial Item"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Adobe Creative Cloud"
              className={inputCls}
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setField("category", e.target.value as Category)
                }
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as Status)}
                className={inputCls}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
                Frequency
              </label>
              <select
                value={form.frequency}
                onChange={(e) => setField("frequency", e.target.value)}
                className={inputCls}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setField("dueDate", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              placeholder="Optional notes..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
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
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
