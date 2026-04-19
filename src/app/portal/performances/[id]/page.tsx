"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PERFORMANCE_TYPE_LABELS,
  SEASON_LABELS,
  STATUS_LABELS,
  INCOME_LABELS,
  EXPENSE_LABELS,
  ASSET_LABELS,
  formatCurrency,
  formatDate,
  totalsFor,
  amortizedAssetCost,
  type PerformanceRow,
  type AssetLite,
} from "@/lib/perf-labels";

interface Asset extends AssetLite {
  purchaseDate: string;
}

const INCOME_OPTS = ["base_pay", "tips", "merch", "bonus", "other"] as const;
const EXPENSE_OPTS = [
  "makeup",
  "nails",
  "lashes",
  "travel",
  "lodging",
  "music_licensing",
  "coaching",
  "photography",
  "promo_materials",
  "staff_tips",
  "meals",
  "rehearsal_space",
  "other",
] as const;
const TYPE_OPTS = ["guest_appearance", "featured", "headliner", "host", "promo", "seasonal"] as const;
const SEASON_OPTS = ["standard", "pride", "halloween", "christmas", "valentine", "other"] as const;
const STATUS_OPTS = ["scheduled", "completed", "canceled"] as const;

const inputCls =
  "w-full bg-bg-card border border-border rounded px-3 py-2 text-cream text-sm focus:border-gold-dim focus:outline-none";

const smallInputCls =
  "bg-bg-deep border border-border rounded px-2 py-1 text-cream text-sm focus:border-gold-dim focus:outline-none";

export default function PerformanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [perf, setPerf] = useState<PerformanceRow | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPerf = useCallback(async () => {
    const res = await fetch(`/api/performances/${id}`);
    if (res.ok) setPerf(await res.json());
    else if (res.status === 404) router.push("/portal/performances");
  }, [id, router]);

  const fetchAssets = useCallback(async () => {
    const res = await fetch("/api/assets");
    if (res.ok) setAssets(await res.json());
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchPerf(), fetchAssets()]);
      setLoading(false);
    })();
  }, [fetchPerf, fetchAssets]);

  async function updatePerf(patch: Partial<PerformanceRow> | Record<string, unknown>) {
    const res = await fetch(`/api/performances/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) await fetchPerf();
  }

  async function deletePerf() {
    if (!window.confirm("Delete this performance and all its line items? Cannot be undone.")) return;
    const res = await fetch(`/api/performances/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/portal/performances");
  }

  if (loading || !perf) {
    return <div className="text-cream-dim/40 py-16 text-center">Loading...</div>;
  }

  const t = totalsFor(perf);
  const netColor = t.net > 0 ? "text-emerald-400" : t.net < 0 ? "text-red-400" : "text-cream-dim";

  const usedAssetIds = new Set(perf.assetUsages.map((u) => u.asset.id));
  const availableAssets = assets.filter((a) => a.status === "active" && !usedAssetIds.has(a.id));

  return (
    <div className="space-y-8">
      {/* Breadcrumb + title */}
      <div>
        <Link
          href="/portal/performances"
          className="text-cream-dim/50 hover:text-cream text-xs uppercase tracking-widest transition-colors"
        >
          ← All Performances
        </Link>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-light text-white">{perf.title}</h1>
            <p className="text-cream-dim/60 text-sm mt-1">
              {formatDate(perf.date)}
              {perf.venue && ` · ${perf.venue}`}
              {perf.persona && ` · as ${perf.persona}`}
            </p>
          </div>
          <button
            onClick={deletePerf}
            className="border border-red-400/30 text-red-400/80 hover:bg-red-400/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors self-start sm:self-auto"
          >
            Delete Performance
          </button>
        </div>
      </div>

      {/* P&L summary */}
      <div className="bg-bg-card border border-border rounded-lg p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Income</p>
          <p className="font-serif text-2xl text-emerald-400 tabular-nums">{formatCurrency(t.income)}</p>
        </div>
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Direct Expenses</p>
          <p className="font-serif text-2xl text-red-400/80 tabular-nums">{formatCurrency(t.directExpense)}</p>
        </div>
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Amortized Assets</p>
          <p className="font-serif text-2xl text-red-400/60 tabular-nums">
            {formatCurrency(t.amortizedAssetCost)}
          </p>
        </div>
        <div>
          <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Net</p>
          <p className={`font-serif text-2xl tabular-nums ${netColor}`}>{formatCurrency(t.net)}</p>
          {t.hasProjected && (
            <p className="text-amber-400/70 text-[10px] uppercase tracking-wider mt-0.5">Includes projections</p>
          )}
        </div>
      </div>

      {/* Info edit */}
      <PerformanceInfo perf={perf} onUpdate={updatePerf} />

      {/* Income */}
      <LineSection
        title="Income"
        accent="emerald"
        emptyHint="No income yet. Add base pay, tips, merch sales, or bonuses."
        lines={perf.incomes.map((i) => ({
          id: i.id,
          category: i.category,
          amount: i.amount,
          isProjected: i.isProjected,
          notes: i.notes,
        }))}
        labels={INCOME_LABELS}
        options={INCOME_OPTS as unknown as string[]}
        endpoint={`/api/performances/${id}/income`}
        reload={fetchPerf}
      />

      {/* Expenses */}
      <LineSection
        title="Direct Expenses"
        accent="red"
        emptyHint="Add consumables and per-show costs: makeup, nails, travel, staff tips, meals."
        lines={perf.expenses.map((e) => ({
          id: e.id,
          category: e.category,
          amount: e.amount,
          isProjected: e.isProjected,
          notes: e.notes,
        }))}
        labels={EXPENSE_LABELS}
        options={EXPENSE_OPTS as unknown as string[]}
        endpoint={`/api/performances/${id}/expense`}
        reload={fetchPerf}
      />

      {/* Assets */}
      <section className="bg-bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-serif text-lg text-white">Assets Used</h2>
            <p className="text-cream-dim/50 text-xs mt-0.5">
              Reusable wigs, costumes, shoes, props — amortized cost added to this show.
            </p>
          </div>
        </div>

        <AssetUsageEditor
          usages={perf.assetUsages}
          availableAssets={availableAssets}
          performanceId={id}
          reload={fetchPerf}
        />
      </section>
    </div>
  );
}

/* ----- Performance info editor ----- */

function PerformanceInfo({
  perf,
  onUpdate,
}: {
  perf: PerformanceRow;
  onUpdate: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: perf.title,
    persona: perf.persona ?? "",
    venue: perf.venue ?? "",
    date: perf.date.slice(0, 10),
    hoursWorked: perf.hoursWorked != null ? String(perf.hoursWorked) : "",
    type: perf.type,
    season: perf.season,
    status: perf.status,
    brandScore: perf.brandScore != null ? String(perf.brandScore) : "",
    notes: perf.notes ?? "",
  });

  function reset() {
    setForm({
      title: perf.title,
      persona: perf.persona ?? "",
      venue: perf.venue ?? "",
      date: perf.date.slice(0, 10),
      hoursWorked: perf.hoursWorked != null ? String(perf.hoursWorked) : "",
      type: perf.type,
      season: perf.season,
      status: perf.status,
      brandScore: perf.brandScore != null ? String(perf.brandScore) : "",
      notes: perf.notes ?? "",
    });
  }

  async function save() {
    await onUpdate({
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
    });
    setEditing(false);
  }

  return (
    <section className="bg-bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h2 className="font-serif text-lg text-white">Details</h2>
        {!editing ? (
          <button
            onClick={() => {
              reset();
              setEditing(true);
            }}
            className="text-cream-dim/60 hover:text-gold text-xs uppercase tracking-wider transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(false)}
              className="text-cream-dim/60 hover:text-cream text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!form.title.trim()}
              className="text-gold hover:text-gold/80 text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className="p-5">
        {!editing ? (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <InfoRow label="Type" value={PERFORMANCE_TYPE_LABELS[perf.type]} />
            <InfoRow label="Season" value={SEASON_LABELS[perf.season]} />
            <InfoRow
              label="Status"
              value={
                <span
                  className={
                    perf.status === "completed"
                      ? "text-emerald-400"
                      : perf.status === "scheduled"
                      ? "text-amber-400"
                      : "text-red-400/60"
                  }
                >
                  {STATUS_LABELS[perf.status]}
                </span>
              }
            />
            <InfoRow label="Hours" value={perf.hoursWorked != null ? `${perf.hoursWorked}h` : "\u2014"} />
            <InfoRow
              label="Brand Score"
              value={perf.brandScore ? <span className="text-gold-dim">{"★".repeat(perf.brandScore)}</span> : "\u2014"}
            />
            {perf.notes && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">Notes</dt>
                <dd className="text-cream whitespace-pre-wrap">{perf.notes}</dd>
              </div>
            )}
          </dl>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Persona</Label>
                <input
                  className={inputCls}
                  value={form.persona}
                  onChange={(e) => setForm({ ...form, persona: e.target.value })}
                />
              </div>
              <div>
                <Label>Venue</Label>
                <input
                  className={inputCls}
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Hours Worked</Label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  className={inputCls}
                  value={form.hoursWorked}
                  onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Type</Label>
                <select
                  className={inputCls}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {TYPE_OPTS.map((t) => (
                    <option key={t} value={t}>
                      {PERFORMANCE_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Season</Label>
                <select
                  className={inputCls}
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                >
                  {SEASON_OPTS.map((s) => (
                    <option key={s} value={s}>
                      {SEASON_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select
                  className={inputCls}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUS_OPTS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Brand Score</Label>
              <select
                className={inputCls}
                value={form.brandScore}
                onChange={(e) => setForm({ ...form, brandScore: e.target.value })}
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
              <Label>Notes</Label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">{label}</dt>
      <dd className="text-cream">{value}</dd>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-cream-dim/60 text-xs uppercase tracking-widest mb-1.5">{children}</label>;
}

/* ----- Income / Expense line section ----- */

interface Line {
  id: string;
  category: string;
  amount: number;
  isProjected: boolean;
  notes: string | null;
}

function LineSection({
  title,
  accent,
  emptyHint,
  lines,
  labels,
  options,
  endpoint,
  reload,
}: {
  title: string;
  accent: "emerald" | "red";
  emptyHint: string;
  lines: Line[];
  labels: Record<string, string>;
  options: string[];
  endpoint: string;
  reload: () => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState(options[0]);
  const [newAmount, setNewAmount] = useState("");
  const [newProjected, setNewProjected] = useState(false);
  const [newNotes, setNewNotes] = useState("");

  const total = lines.reduce((s, l) => s + l.amount, 0);
  const accentCls = accent === "emerald" ? "text-emerald-400" : "text-red-400/80";

  async function create() {
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt < 0) return;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: newCategory,
        amount: amt,
        isProjected: newProjected,
        notes: newNotes.trim() || null,
      }),
    });
    if (res.ok) {
      setNewCategory(options[0]);
      setNewAmount("");
      setNewProjected(false);
      setNewNotes("");
      setAdding(false);
      await reload();
    }
  }

  return (
    <section className="bg-bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h2 className="font-serif text-lg text-white">{title}</h2>
          <p className="text-cream-dim/50 text-xs mt-0.5 tabular-nums">
            {lines.length} {lines.length === 1 ? "line" : "lines"} · <span className={accentCls}>{formatCurrency(total)}</span>
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-3 py-1.5 text-xs uppercase tracking-wider transition-colors"
        >
          {adding ? "Cancel" : "Add Line"}
        </button>
      </div>

      {adding && (
        <div className="p-4 border-b border-border bg-bg-deep/50 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-3 items-start">
          <select className={smallInputCls} value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            {options.map((o) => (
              <option key={o} value={o}>
                {labels[o]}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount"
            className={smallInputCls}
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            className={smallInputCls}
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />
          <label className="flex items-center gap-2 text-xs text-cream-dim whitespace-nowrap px-1">
            <input
              type="checkbox"
              checked={newProjected}
              onChange={(e) => setNewProjected(e.target.checked)}
              className="accent-amber-400"
            />
            Projected
          </label>
          <button
            onClick={create}
            disabled={!newAmount}
            className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-3 py-1 text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
          >
            Add
          </button>
        </div>
      )}

      {lines.length === 0 ? (
        <div className="p-10 text-center text-cream-dim/40 text-sm">{emptyHint}</div>
      ) : (
        <div className="divide-y divide-border">
          {lines.map((line) => (
            <LineRow key={line.id} line={line} labels={labels} options={options} endpoint={endpoint} reload={reload} />
          ))}
        </div>
      )}
    </section>
  );
}

function LineRow({
  line,
  labels,
  options,
  endpoint,
  reload,
}: {
  line: Line;
  labels: Record<string, string>;
  options: string[];
  endpoint: string;
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(line.category);
  const [amount, setAmount] = useState(String(line.amount));
  const [isProjected, setIsProjected] = useState(line.isProjected);
  const [notes, setNotes] = useState(line.notes ?? "");

  async function save() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) return;
    const res = await fetch(`${endpoint}/${line.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, amount: amt, isProjected, notes: notes.trim() || null }),
    });
    if (res.ok) {
      setEditing(false);
      await reload();
    }
  }

  async function remove() {
    if (!window.confirm("Delete this line?")) return;
    await fetch(`${endpoint}/${line.id}`, { method: "DELETE" });
    await reload();
  }

  if (editing) {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-3 items-center">
        <select className={smallInputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
          {options.map((o) => (
            <option key={o} value={o}>
              {labels[o]}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          className={smallInputCls}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Notes"
          className={smallInputCls}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <label className="flex items-center gap-2 text-xs text-cream-dim whitespace-nowrap px-1">
          <input
            type="checkbox"
            checked={isProjected}
            onChange={(e) => setIsProjected(e.target.checked)}
            className="accent-amber-400"
          />
          Projected
        </label>
        <button
          onClick={() => setEditing(false)}
          className="text-cream-dim/60 hover:text-cream text-xs uppercase tracking-wider transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={save}
          className="text-gold hover:text-gold/80 text-xs uppercase tracking-wider transition-colors"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <span className="text-cream w-40 shrink-0">{labels[line.category] ?? line.category}</span>
        <span className="text-cream tabular-nums w-24 shrink-0">{formatCurrency(line.amount)}</span>
        {line.isProjected && (
          <span className="text-amber-400/70 text-[10px] uppercase tracking-wider shrink-0">projected</span>
        )}
        {line.notes && <span className="text-cream-dim/60 text-sm truncate">{line.notes}</span>}
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <button
          onClick={() => setEditing(true)}
          className="text-cream-dim/60 hover:text-gold text-xs uppercase tracking-wider transition-colors"
        >
          Edit
        </button>
        <button
          onClick={remove}
          className="text-red-400/60 hover:text-red-400 text-xs uppercase tracking-wider transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ----- Asset usage editor ----- */

function AssetUsageEditor({
  usages,
  availableAssets,
  performanceId,
  reload,
}: {
  usages: PerformanceRow["assetUsages"];
  availableAssets: Asset[];
  performanceId: string;
  reload: () => Promise<void>;
}) {
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const totalAmortized = usages.reduce((s, u) => s + amortizedAssetCost(u.asset), 0);

  async function addUsage() {
    if (!selectedAssetId) return;
    const res = await fetch(`/api/performances/${performanceId}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId: selectedAssetId }),
    });
    if (res.ok) {
      setSelectedAssetId("");
      await reload();
    }
  }

  async function removeUsage(usageId: string) {
    await fetch(`/api/performances/${performanceId}/assets/${usageId}`, { method: "DELETE" });
    await reload();
  }

  return (
    <div>
      {availableAssets.length > 0 && (
        <div className="p-4 border-b border-border bg-bg-deep/50 flex gap-3 items-center">
          <select
            className={smallInputCls + " flex-1"}
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
          >
            <option value="">Select an asset to link...</option>
            {availableAssets.map((a) => (
              <option key={a.id} value={a.id}>
                {ASSET_LABELS[a.category]} · {a.name} ({formatCurrency(a.purchaseCost / a.expectedUses)}/use)
              </option>
            ))}
          </select>
          <button
            onClick={addUsage}
            disabled={!selectedAssetId}
            className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-3 py-1.5 text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
          >
            Link
          </button>
        </div>
      )}

      {usages.length === 0 ? (
        <div className="p-10 text-center text-cream-dim/40 text-sm">
          {availableAssets.length === 0 ? (
            <>
              No assets available. Add wigs, costumes, or props on the{" "}
              <Link href="/portal/assets" className="text-gold hover:text-gold/80">
                Assets page
              </Link>{" "}
              first.
            </>
          ) : (
            "No assets linked to this performance yet."
          )}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {usages.map((u) => {
            const amortized = amortizedAssetCost(u.asset);
            return (
              <div
                key={u.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-cream-dim w-28 shrink-0 text-xs uppercase tracking-wider">
                    {ASSET_LABELS[u.asset.category]}
                  </span>
                  <span className="text-cream flex-1 truncate">{u.asset.name}</span>
                  <span className="text-red-400/60 tabular-nums text-sm shrink-0">
                    {formatCurrency(amortized)}
                    <span className="text-cream-dim/40 text-xs ml-1">
                      ({formatCurrency(u.asset.purchaseCost)} / {u.asset.expectedUses})
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => removeUsage(u.id)}
                  className="text-red-400/60 hover:text-red-400 text-xs uppercase tracking-wider transition-colors ml-4 shrink-0"
                >
                  Unlink
                </button>
              </div>
            );
          })}
          <div className="px-5 py-3 flex items-center justify-between bg-bg-deep/30">
            <span className="text-cream-dim/60 text-xs uppercase tracking-widest">Total Amortized</span>
            <span className="text-red-400/80 font-serif tabular-nums">{formatCurrency(totalAmortized)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
