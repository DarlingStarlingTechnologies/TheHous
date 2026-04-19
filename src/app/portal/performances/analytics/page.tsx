"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  PERFORMANCE_TYPE_LABELS,
  SEASON_LABELS,
  formatCurrency,
  formatDate,
  totalsFor,
  amortizedAssetCost,
  type PerformanceRow,
} from "@/lib/perf-labels";

interface Breakdown {
  key: string;
  label: string;
  count: number;
  income: number;
  expense: number;
  net: number;
  avgNet: number;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  purchaseCost: number;
  purchaseDate: string;
  expectedUses: number;
  status: string;
  usages: { id: string; performance: { id: string; title: string; date: string } }[];
}

const inputCls =
  "bg-bg-card border border-border rounded px-3 py-2 text-cream text-sm focus:border-gold-dim focus:outline-none";

export default function PerformanceAnalyticsPage() {
  const [items, setItems] = useState<PerformanceRow[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, ar] = await Promise.all([
        fetch(year === "all" ? "/api/performances" : `/api/performances?year=${year}`),
        fetch("/api/assets"),
      ]);
      if (pr.ok) setItems(await pr.json());
      if (ar.ok) setAssets(await ar.json());
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const thisYear = new Date().getFullYear();
  const availableYears = [thisYear, thisYear - 1, thisYear - 2];

  const completed = useMemo(() => items.filter((p) => p.status === "completed"), [items]);
  const scheduled = useMemo(() => items.filter((p) => p.status === "scheduled"), [items]);

  const ytd = useMemo(() => {
    let income = 0,
      expense = 0,
      assetCost = 0;
    for (const p of completed) {
      const t = totalsFor(p);
      income += t.income;
      expense += t.directExpense;
      assetCost += t.amortizedAssetCost;
    }
    return { income, expense, assetCost, net: income - expense - assetCost, count: completed.length };
  }, [completed]);

  const projected = useMemo(() => {
    let income = 0,
      expense = 0,
      assetCost = 0;
    for (const p of scheduled) {
      const t = totalsFor(p);
      income += t.income;
      expense += t.directExpense;
      assetCost += t.amortizedAssetCost;
    }
    return {
      income,
      expense,
      assetCost,
      net: income - expense - assetCost,
      count: scheduled.length,
    };
  }, [scheduled]);

  function breakdown(keyFn: (p: PerformanceRow) => string | null, labelFn: (k: string) => string): Breakdown[] {
    const map = new Map<string, { income: number; expense: number; count: number }>();
    for (const p of completed) {
      const k = keyFn(p);
      if (!k) continue;
      const t = totalsFor(p);
      const entry = map.get(k) ?? { income: 0, expense: 0, count: 0 };
      entry.income += t.income;
      entry.expense += t.directExpense + t.amortizedAssetCost;
      entry.count += 1;
      map.set(k, entry);
    }
    return Array.from(map.entries())
      .map(([key, v]) => ({
        key,
        label: labelFn(key),
        count: v.count,
        income: v.income,
        expense: v.expense,
        net: v.income - v.expense,
        avgNet: v.count > 0 ? (v.income - v.expense) / v.count : 0,
      }))
      .sort((a, b) => b.net - a.net);
  }

  const byPersona = useMemo(
    () => breakdown((p) => p.persona, (k) => k),
    [completed]
  );
  const byVenue = useMemo(
    () => breakdown((p) => p.venue, (k) => k),
    [completed]
  );
  const byType = useMemo(
    () => breakdown((p) => p.type, (k) => PERFORMANCE_TYPE_LABELS[k] ?? k),
    [completed]
  );
  const bySeason = useMemo(
    () => breakdown((p) => p.season, (k) => SEASON_LABELS[k] ?? k),
    [completed]
  );

  // Scatter matrix data: brand score vs net profit
  const matrixPoints = useMemo(() => {
    return completed
      .filter((p) => p.brandScore != null)
      .map((p) => {
        const t = totalsFor(p);
        return {
          id: p.id,
          title: p.title,
          date: p.date,
          brand: p.brandScore!,
          net: t.net,
        };
      });
  }, [completed]);

  const netRange = useMemo(() => {
    if (matrixPoints.length === 0) return { min: -100, max: 100 };
    const nets = matrixPoints.map((p) => p.net);
    const min = Math.min(...nets, 0);
    const max = Math.max(...nets, 0);
    const pad = Math.max(50, (max - min) * 0.1);
    return { min: min - pad, max: max + pad };
  }, [matrixPoints]);

  // Asset ROI
  const assetRoi = useMemo(() => {
    return assets
      .map((a) => {
        const perUse = a.expectedUses > 0 ? a.purchaseCost / a.expectedUses : a.purchaseCost;
        const used = a.usages.length;
        const amortizedConsumed = perUse * used;
        const progress = a.expectedUses > 0 ? (used / a.expectedUses) * 100 : 0;
        return {
          id: a.id,
          name: a.name,
          category: a.category,
          purchaseCost: a.purchaseCost,
          expectedUses: a.expectedUses,
          used,
          perUse,
          amortizedConsumed,
          remaining: a.purchaseCost - amortizedConsumed,
          progress,
          status: a.status,
        };
      })
      .sort((a, b) => b.progress - a.progress);
  }, [assets]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/portal/performances"
          className="text-cream-dim/50 hover:text-cream text-xs uppercase tracking-widest transition-colors"
        >
          ← All Performances
        </Link>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-light text-white">Performance Analytics</h1>
            <p className="text-cream-dim/60 text-sm mt-1">
              Where the money comes from, where it goes, and which shows carry the most weight.
            </p>
          </div>
          <select value={year} onChange={(e) => setYear(e.target.value)} className={inputCls}>
            <option value="all">All Time</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-cream-dim/40 py-16 text-center">Loading...</div>
      ) : completed.length === 0 && scheduled.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-lg p-10 text-center text-cream-dim/40">
          No performances yet in this window. Add some to see analytics.
        </div>
      ) : (
        <>
          {/* YTD + Projected */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-white">
                  {year === "all" ? "All-Time Actuals" : `${year} Actuals`}
                </h2>
                <span className="text-cream-dim/50 text-xs uppercase tracking-widest">
                  {ytd.count} completed
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Income" value={formatCurrency(ytd.income)} color="emerald" />
                <Stat
                  label="Expenses"
                  value={formatCurrency(ytd.expense + ytd.assetCost)}
                  color="red"
                  hint={`${formatCurrency(ytd.expense)} direct · ${formatCurrency(ytd.assetCost)} assets`}
                />
                <Stat
                  label="Net"
                  value={formatCurrency(ytd.net)}
                  color={ytd.net >= 0 ? "gold" : "red"}
                />
              </div>
            </div>

            <div className="bg-bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-white">Upcoming Projections</h2>
                <span className="text-cream-dim/50 text-xs uppercase tracking-widest">
                  {projected.count} scheduled
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Est. Income" value={formatCurrency(projected.income)} color="emerald" faded />
                <Stat
                  label="Est. Expenses"
                  value={formatCurrency(projected.expense + projected.assetCost)}
                  color="red"
                  faded
                />
                <Stat
                  label="Est. Net"
                  value={formatCurrency(projected.net)}
                  color={projected.net >= 0 ? "gold" : "red"}
                  faded
                />
              </div>
            </div>
          </section>

          {/* Brand vs Profit Matrix */}
          <section className="bg-bg-card border border-border rounded-lg p-5">
            <div className="mb-4">
              <h2 className="font-serif text-lg text-white">Brand vs Profit</h2>
              <p className="text-cream-dim/50 text-xs mt-1">
                Completed shows, plotted by brand score and net profit. Top-right is ideal; top-left is career-building;
                bottom-right is cash; bottom-left is the pile to rethink.
              </p>
            </div>
            {matrixPoints.length === 0 ? (
              <div className="py-12 text-center text-cream-dim/40 text-sm">
                Add brand scores to completed performances to see this chart.
              </div>
            ) : (
              <ScatterMatrix points={matrixPoints} netMin={netRange.min} netMax={netRange.max} />
            )}
          </section>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BreakdownTable title="By Persona" rows={byPersona} />
            <BreakdownTable title="By Venue" rows={byVenue} />
            <BreakdownTable title="By Type" rows={byType} />
            <BreakdownTable title="By Season" rows={bySeason} />
          </div>

          {/* Asset ROI */}
          <section className="bg-bg-card border border-border rounded-lg">
            <div className="p-5 border-b border-border">
              <h2 className="font-serif text-lg text-white">Asset ROI</h2>
              <p className="text-cream-dim/50 text-xs mt-1">
                How much of each asset's cost has been earned out, based on how many shows it has appeared in.
              </p>
            </div>
            {assetRoi.length === 0 ? (
              <div className="py-12 text-center text-cream-dim/40 text-sm">
                No assets yet. Add wigs, costumes, and props on the{" "}
                <Link href="/portal/assets" className="text-gold hover:text-gold/80">
                  Assets page
                </Link>
                .
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">
                        Asset
                      </th>
                      <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">
                        Uses
                      </th>
                      <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                        Cost
                      </th>
                      <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                        Per-Use
                      </th>
                      <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                        Amortized So Far
                      </th>
                      <th className="px-4 py-3 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {assetRoi.map((a) => (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-cream">
                          {a.name}
                          <span className="text-cream-dim/50 text-xs ml-2 capitalize">{a.category}</span>
                        </td>
                        <td className="px-4 py-3 text-cream-dim tabular-nums">
                          {a.used} / {a.expectedUses}
                        </td>
                        <td className="px-4 py-3 text-cream text-right tabular-nums">
                          {formatCurrency(a.purchaseCost)}
                        </td>
                        <td className="px-4 py-3 text-gold-dim text-right tabular-nums">
                          {formatCurrency(a.perUse)}
                        </td>
                        <td className="px-4 py-3 text-cream-dim text-right tabular-nums">
                          {formatCurrency(a.amortizedConsumed)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-32 bg-bg-deep rounded h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${a.progress >= 100 ? "bg-emerald-400" : "bg-gold"}`}
                              style={{ width: `${Math.min(a.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-cream-dim/50 text-[10px] mt-1 block tabular-nums">
                            {a.progress.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  hint,
  faded,
}: {
  label: string;
  value: string;
  color: "emerald" | "red" | "gold";
  hint?: string;
  faded?: boolean;
}) {
  const colorCls =
    color === "emerald"
      ? faded
        ? "text-emerald-400/60"
        : "text-emerald-400"
      : color === "red"
      ? faded
        ? "text-red-400/50"
        : "text-red-400/80"
      : faded
      ? "text-gold/70"
      : "text-gold";
  return (
    <div>
      <p className="text-cream-dim/60 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-serif text-2xl tabular-nums ${colorCls}`}>{value}</p>
      {hint && <p className="text-cream-dim/40 text-[10px] mt-0.5">{hint}</p>}
    </div>
  );
}

function BreakdownTable({ title, rows }: { title: string; rows: Breakdown[] }) {
  return (
    <section className="bg-bg-card border border-border rounded-lg">
      <div className="p-5 border-b border-border">
        <h2 className="font-serif text-lg text-white">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <div className="py-10 text-center text-cream-dim/40 text-sm">No data yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2 text-cream-dim/60 text-xs uppercase tracking-widest font-normal">Name</th>
                <th className="px-4 py-2 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Shows
                </th>
                <th className="px-4 py-2 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Net
                </th>
                <th className="px-4 py-2 text-cream-dim/60 text-xs uppercase tracking-widest font-normal text-right">
                  Avg
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const netColor = r.net > 0 ? "text-emerald-400" : r.net < 0 ? "text-red-400" : "text-cream-dim";
                return (
                  <tr key={r.key} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2 text-cream">{r.label}</td>
                    <td className="px-4 py-2 text-cream-dim text-right tabular-nums">{r.count}</td>
                    <td className={`px-4 py-2 text-right tabular-nums ${netColor}`}>{formatCurrency(r.net)}</td>
                    <td className="px-4 py-2 text-cream-dim text-right tabular-nums">{formatCurrency(r.avgNet)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ScatterMatrix({
  points,
  netMin,
  netMax,
}: {
  points: { id: string; title: string; date: string; brand: number; net: number }[];
  netMin: number;
  netMax: number;
}) {
  // Axes: X = net profit (netMin → netMax), Y = brand score (1 → 5, bottom to top)
  const netSpan = netMax - netMin || 1;
  const zeroX = ((0 - netMin) / netSpan) * 100;

  return (
    <div>
      <div className="relative h-80 bg-bg-deep rounded border border-border/50 overflow-hidden">
        {/* Horizontal gridlines (brand 1-5) */}
        {[1, 2, 3, 4, 5].map((b) => {
          const y = 100 - ((b - 0.5) / 5) * 100;
          return (
            <div
              key={b}
              className="absolute left-0 right-0 border-t border-border/30"
              style={{ top: `${y}%` }}
            >
              <span className="absolute left-2 -top-2 text-cream-dim/40 text-[10px] bg-bg-deep px-1">
                {"★".repeat(b)}
              </span>
            </div>
          );
        })}

        {/* Zero X line */}
        <div
          className="absolute top-0 bottom-0 border-l border-gold/30"
          style={{ left: `${zeroX}%` }}
        >
          <span className="absolute bottom-1 -translate-x-1/2 text-gold/60 text-[10px] bg-bg-deep px-1">$0</span>
        </div>

        {/* Median brand line (3) */}
        <div className="absolute left-0 right-0 border-t border-gold/20" style={{ top: "50%" }} />

        {/* Points */}
        {points.map((p) => {
          const x = ((p.net - netMin) / netSpan) * 100;
          const y = 100 - ((p.brand - 0.5) / 5) * 100;
          const color =
            p.brand >= 4 && p.net >= 0
              ? "bg-emerald-400"
              : p.brand >= 4
              ? "bg-amber-400"
              : p.net >= 0
              ? "bg-gold"
              : "bg-red-400/70";
          return (
            <div
              key={p.id}
              className={`absolute w-2.5 h-2.5 rounded-full ${color} ring-2 ring-bg-deep group cursor-pointer hover:scale-150 transition-transform`}
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-bg-card border border-border px-2 py-1 text-[10px] text-cream rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                {p.title} — {formatCurrency(p.net)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 text-cream-dim/40 text-[10px] uppercase tracking-widest">
        <span>← Loss</span>
        <span>Net Profit</span>
        <span>Profit →</span>
      </div>
    </div>
  );
}
