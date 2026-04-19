"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/portal/Modal";
import { ASSET_LABELS, formatCurrency, formatDate } from "@/lib/perf-labels";

type AssetStatus = "active" | "retired";
type AssetCategory = "wig" | "costume" | "shoes" | "accessories" | "props" | "other";

interface AssetUsageRow {
  id: string;
  performance: { id: string; title: string; date: string };
}

interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  purchaseCost: number;
  purchaseDate: string;
  expectedUses: number;
  status: AssetStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  usages: AssetUsageRow[];
}

interface FormState {
  name: string;
  category: AssetCategory;
  purchaseCost: string;
  purchaseDate: string;
  expectedUses: string;
  status: AssetStatus;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "wig",
  purchaseCost: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  expectedUses: "10",
  status: "active",
  notes: "",
};

const CATEGORY_OPTIONS: AssetCategory[] = ["wig", "costume", "shoes", "accessories", "props", "other"];

const inputCls =
  "w-full bg-bg-card border border-border rounded px-3 py-2 text-cream text-sm focus:border-gold-dim focus:outline-none";

export default function AssetsPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "all">("all");

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/assets");
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = categoryFilter === "all" ? items : items.filter((a) => a.category === categoryFilter);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(a: Asset) {
    setEditingId(a.id);
    setForm({
      name: a.name,
      category: a.category,
      purchaseCost: String(a.purchaseCost),
      purchaseDate: a.purchaseDate.slice(0, 10),
      expectedUses: String(a.expectedUses),
      status: a.status,
      notes: a.notes ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const body = {
      name: form.name.trim(),
      category: form.category,
      purchaseCost: parseFloat(form.purchaseCost) || 0,
      purchaseDate: form.purchaseDate,
      expectedUses: parseInt(form.expectedUses, 10) || 1,
      status: form.status,
      notes: form.notes.trim() || null,
    };
    try {
      if (editingId) {
        await fetch(`/api/assets/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/assets", {
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
    if (!window.confirm("Delete this asset? It will be unlinked from all performances. Cannot be undone.")) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    await fetchItems();
  }

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  const totalInvested = items.reduce((s, a) => s + a.purchaseCost, 0);
  const activeCount = items.filter((a) => a.status === "active").length;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">Assets</h1>
          <p className="text-cream-dim/60 text-sm mt-1">
            Wigs, costumes, shoes, and props — amortized across the performances that use them.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors self-start sm:self-auto"
        >
          Add Asset
        </button>
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Total Invested</p>
          <p className="font-serif text-2xl text-gold">{formatCurrency(totalInvested)}</p>
        </div>
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Active Assets</p>
          <p className="font-serif text-2xl text-cream">{activeCount}</p>
        </div>
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Retired</p>
          <p className="font-serif text-2xl text-cream-dim">{items.length - activeCount}</p>
        </div>
      </div>

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
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`rounded px-3 py-1.5 text-xs uppercase tracking-wider transition-colors border ${
              categoryFilter === c
                ? "border-gold/30 bg-gold/10 text-gold"
                : "border-border text-cream-dim/60 hover:border-border-light hover:text-cream-dim"
            }`}
          >
            {ASSET_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Name</th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Category</th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Cost
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Uses (used / expected)
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Per-Use
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Status</th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-cream-dim/40">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-cream-dim/40">
                    No assets yet. Add wigs, costumes, shoes, or props to amortize their cost across shows.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const perUse = a.expectedUses > 0 ? a.purchaseCost / a.expectedUses : a.purchaseCost;
                  return (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-cream">
                        <div>{a.name}</div>
                        {a.notes && <div className="text-cream-dim/50 text-xs mt-0.5">{a.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-cream-dim">{ASSET_LABELS[a.category]}</td>
                      <td className="px-4 py-3 text-cream text-right tabular-nums">{formatCurrency(a.purchaseCost)}</td>
                      <td className="px-4 py-3 text-cream-dim text-right tabular-nums">
                        {a.usages.length} / {a.expectedUses}
                      </td>
                      <td className="px-4 py-3 text-gold-dim text-right tabular-nums">{formatCurrency(perUse)}</td>
                      <td className="px-4 py-3">
                        <span className={a.status === "active" ? "text-emerald-400" : "text-cream-dim/50"}>
                          {a.status === "active" ? "Active" : "Retired"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openEdit(a)}
                            className="text-cream-dim/60 hover:text-gold text-xs uppercase tracking-wider transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="text-red-400/60 hover:text-red-400 text-xs uppercase tracking-wider transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Edit Asset" : "Add Asset"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder='e.g. "Janet Sequin Dress"'
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value as AssetCategory)}
                className={inputCls}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {ASSET_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as AssetStatus)}
                className={inputCls}
              >
                <option value="active">Active</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
                Purchase Cost <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.purchaseCost}
                onChange={(e) => setField("purchaseCost", e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Purchase Date</label>
              <input
                type="date"
                required
                value={form.purchaseDate}
                onChange={(e) => setField("purchaseDate", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
              Expected Uses
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.expectedUses}
              onChange={(e) => setField("expectedUses", e.target.value)}
              className={inputCls}
            />
            <p className="text-cream-dim/50 text-xs mt-1">
              Cost is divided by this number and added to each show the asset is used in. Edit later as reality sets in.
            </p>
          </div>

          <div>
            <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              placeholder="Optional"
              className={`${inputCls} resize-none`}
            />
          </div>

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
              disabled={saving || !form.name.trim()}
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
