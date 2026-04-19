"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "@/components/portal/Modal";
import {
  PERFORMANCE_TYPE_LABELS,
  SEASON_LABELS,
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  totalsFor,
  type PerformanceRow,
} from "@/lib/perf-labels";

type PerfType = "guest_appearance" | "featured" | "headliner" | "host" | "promo" | "seasonal";
type Season = "standard" | "pride" | "halloween" | "christmas" | "valentine" | "other";
type PerfStatus = "scheduled" | "completed" | "canceled";

interface FormState {
  title: string;
  persona: string;
  venue: string;
  date: string;
  hoursWorked: string;
  type: PerfType;
  season: Season;
  status: PerfStatus;
  brandScore: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  persona: "",
  venue: "",
  date: new Date().toISOString().slice(0, 10),
  hoursWorked: "",
  type: "featured",
  season: "standard",
  status: "scheduled",
  brandScore: "",
  notes: "",
};

const TYPE_OPTIONS: PerfType[] = ["guest_appearance", "featured", "headliner", "host", "promo", "seasonal"];
const SEASON_OPTIONS: Season[] = ["standard", "pride", "halloween", "christmas", "valentine", "other"];
const STATUS_OPTIONS: PerfStatus[] = ["scheduled", "completed", "canceled"];

const inputCls =
  "w-full bg-bg-card border border-border rounded px-3 py-2 text-cream text-sm focus:border-gold-dim focus:outline-none";

export default function PerformancesPage() {
  const router = useRouter();
  const [items, setItems] = useState<PerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [yearFilter, setYearFilter] = useState<string>(String(new Date().getFullYear()));
  const [statusFilter, setStatusFilter] = useState<"all" | PerfStatus>("all");
  const [seasonFilter, setSeasonFilter] = useState<"all" | Season>("all");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = yearFilter === "all" ? "/api/performances" : `/api/performances?year=${yearFilter}`;
      const res = await fetch(url);
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [yearFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const availableYears = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return [thisYear, thisYear - 1, thisYear - 2];
  }, []);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (seasonFilter !== "all" && p.season !== seasonFilter) return false;
      return true;
    });
  }, [items, statusFilter, seasonFilter]);

  const summary = useMemo(() => {
    let income = 0,
      expense = 0,
      assetCost = 0,
      completed = 0,
      scheduled = 0;
    for (const p of filtered) {
      const t = totalsFor(p);
      income += t.income;
      expense += t.directExpense;
      assetCost += t.amortizedAssetCost;
      if (p.status === "completed") completed++;
      if (p.status === "scheduled") scheduled++;
    }
    return { income, expense, assetCost, net: income - expense - assetCost, completed, scheduled };
  }, [filtered]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    const body = {
      title: form.title.trim(),
      persona: form.persona.trim() || null,
      venue: form.venue.trim() || null,
      date: form.date,
      hoursWorked: form.hoursWorked ? parseFloat(form.hoursWorked) : null,
      type: form.type,
      season: form.season,
      status: form.status,
      brandScore: form.brandScore ? parseInt(form.brandScore, 10) : null,
      notes: form.notes.trim() || null,
    };
    try {
      const res = await fetch("/api/performances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const created = await res.json();
        closeModal();
        router.push(`/portal/performances/${created.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">Performances</h1>
          <p className="text-cream-dim/60 text-sm mt-1">
            Track income and expenses per gig. Project upcoming shows, settle actuals after the curtain falls.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Link
            href="/portal/performances/analytics"
            className="border border-border text-cream-dim hover:text-cream hover:border-border-light rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors"
          >
            Analytics
          </Link>
          <button
            onClick={openAdd}
            className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors"
          >
            Add Performance
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-bg-card border border-border rounded-lg p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Income</p>
          <p className="font-serif text-2xl text-emerald-400 tabular-nums">{formatCurrency(summary.income)}</p>
        </div>
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Expenses</p>
          <p className="font-serif text-2xl text-red-400/80 tabular-nums">
            {formatCurrency(summary.expense + summary.assetCost)}
          </p>
          <p className="text-cream-dim/40 text-[10px] mt-0.5 tabular-nums">
            {formatCurrency(summary.expense)} direct · {formatCurrency(summary.assetCost)} amortized
          </p>
        </div>
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Net</p>
          <p
            className={`font-serif text-2xl tabular-nums ${
              summary.net >= 0 ? "text-gold" : "text-red-400"
            }`}
          >
            {formatCurrency(summary.net)}
          </p>
        </div>
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Count</p>
          <p className="font-serif text-2xl text-cream tabular-nums">{filtered.length}</p>
          <p className="text-cream-dim/40 text-[10px] mt-0.5">
            {summary.completed} done · {summary.scheduled} upcoming
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-cream-dim/60 text-xs uppercase tracking-widest">Year</span>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="all">All</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cream-dim/60 text-xs uppercase tracking-widest">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | PerfStatus)}
            className={`${inputCls} w-auto`}
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cream-dim/60 text-xs uppercase tracking-widest">Season</span>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value as "all" | Season)}
            className={`${inputCls} w-auto`}
          >
            <option value="all">All</option>
            {SEASON_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SEASON_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Date</th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Title</th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Venue</th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Persona</th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Type</th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Status</th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Income
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Expenses
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Net
                </th>
                <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Brand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-cream-dim/40">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-cream-dim/40">
                    No performances in this view. Try a different year or filter, or add your first show.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const t = totalsFor(p);
                  const netColor =
                    t.net > 0 ? "text-emerald-400" : t.net < 0 ? "text-red-400" : "text-cream-dim";
                  const statusColor =
                    p.status === "completed"
                      ? "text-emerald-400"
                      : p.status === "scheduled"
                      ? "text-amber-400"
                      : "text-red-400/60";
                  return (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/portal/performances/${p.id}`)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-cream-dim tabular-nums">{formatDate(p.date)}</td>
                      <td className="px-4 py-3 text-cream">
                        {p.title}
                        {t.hasProjected && (
                          <span className="ml-2 text-amber-400/70 text-[10px] uppercase tracking-wider">
                            projected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-cream-dim">{p.venue ?? "\u2014"}</td>
                      <td className="px-4 py-3 text-cream-dim">{p.persona ?? "\u2014"}</td>
                      <td className="px-4 py-3 text-cream-dim">{PERFORMANCE_TYPE_LABELS[p.type]}</td>
                      <td className="px-4 py-3">
                        <span className={statusColor}>{STATUS_LABELS[p.status]}</span>
                      </td>
                      <td className="px-4 py-3 text-emerald-400/80 text-right tabular-nums">
                        {formatCurrency(t.income)}
                      </td>
                      <td className="px-4 py-3 text-red-400/70 text-right tabular-nums">
                        {formatCurrency(t.directExpense + t.amortizedAssetCost)}
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums ${netColor}`}>{formatCurrency(t.net)}</td>
                      <td className="px-4 py-3 text-gold-dim">
                        {p.brandScore ? "★".repeat(p.brandScore) : "\u2014"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title="Add Performance">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder='e.g. "Janet promo at Rumors"'
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Persona</label>
              <input
                type="text"
                value={form.persona}
                onChange={(e) => setField("persona", e.target.value)}
                placeholder="Janet, Anastasia, …"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Venue</label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => setField("venue", e.target.value)}
                placeholder="Rumors, …"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Hours Worked</label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={form.hoursWorked}
                onChange={(e) => setField("hoursWorked", e.target.value)}
                placeholder="e.g. 4"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setField("type", e.target.value as PerfType)}
                className={inputCls}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {PERFORMANCE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Season</label>
              <select
                value={form.season}
                onChange={(e) => setField("season", e.target.value as Season)}
                className={inputCls}
              >
                {SEASON_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {SEASON_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as PerfStatus)}
                className={inputCls}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">
              Brand Score (1-5)
            </label>
            <select
              value={form.brandScore}
              onChange={(e) => setField("brandScore", e.target.value)}
              className={inputCls}
            >
              <option value="">Not rated</option>
              <option value="1">★ — Low brand value</option>
              <option value="2">★★</option>
              <option value="3">★★★ — Solid</option>
              <option value="4">★★★★</option>
              <option value="5">★★★★★ — Career-building</option>
            </select>
          </div>

          <div>
            <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              placeholder="Context, collaborators, why this matters…"
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
              disabled={saving || !form.title.trim()}
              className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create & Edit Details"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
