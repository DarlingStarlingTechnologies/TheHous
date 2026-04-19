export const PERFORMANCE_TYPE_LABELS: Record<string, string> = {
  guest_appearance: "Guest Appearance",
  featured: "Featured",
  headliner: "Headliner",
  host: "Host",
  promo: "Promo",
  seasonal: "Seasonal",
};

export const SEASON_LABELS: Record<string, string> = {
  standard: "Standard",
  pride: "Pride",
  halloween: "Halloween",
  christmas: "Christmas",
  valentine: "Valentine",
  other: "Other",
};

export const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  canceled: "Canceled",
};

export const INCOME_LABELS: Record<string, string> = {
  base_pay: "Base Pay",
  tips: "Tips",
  merch: "Merch",
  bonus: "Bonus",
  other: "Other",
};

export const EXPENSE_LABELS: Record<string, string> = {
  makeup: "Makeup",
  nails: "Nails",
  lashes: "Lashes",
  travel: "Travel",
  lodging: "Lodging",
  music_licensing: "Music / Licensing",
  coaching: "Coaching",
  photography: "Photo / Video",
  promo_materials: "Promo Materials",
  staff_tips: "Staff Tips",
  meals: "Meals",
  rehearsal_space: "Rehearsal Space",
  other: "Other",
};

export const ASSET_LABELS: Record<string, string> = {
  wig: "Wig",
  costume: "Costume",
  shoes: "Shoes",
  accessories: "Accessories",
  props: "Props",
  other: "Other",
};

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "\u2014";
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "\u2014";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export interface PerformanceIncomeLine {
  id: string;
  category: string;
  amount: number;
  isProjected: boolean;
  notes: string | null;
}

export interface PerformanceExpenseLine {
  id: string;
  category: string;
  amount: number;
  isProjected: boolean;
  notes: string | null;
}

export interface AssetLite {
  id: string;
  name: string;
  category: string;
  purchaseCost: number;
  expectedUses: number;
  status: string;
}

export interface AssetUsageRow {
  id: string;
  asset: AssetLite;
}

export interface PerformanceRow {
  id: string;
  title: string;
  persona: string | null;
  venue: string | null;
  date: string;
  hoursWorked: number | null;
  type: string;
  season: string;
  status: string;
  brandScore: number | null;
  notes: string | null;
  incomes: PerformanceIncomeLine[];
  expenses: PerformanceExpenseLine[];
  assetUsages: AssetUsageRow[];
}

export function amortizedAssetCost(asset: AssetLite): number {
  if (asset.expectedUses < 1) return asset.purchaseCost;
  return asset.purchaseCost / asset.expectedUses;
}

export interface Totals {
  income: number;
  directExpense: number;
  amortizedAssetCost: number;
  net: number;
  hasProjected: boolean;
}

export function totalsFor(p: PerformanceRow): Totals {
  const income = p.incomes.reduce((s, i) => s + i.amount, 0);
  const directExpense = p.expenses.reduce((s, e) => s + e.amount, 0);
  const assetCost = p.assetUsages.reduce((s, u) => s + amortizedAssetCost(u.asset), 0);
  const hasProjected =
    p.incomes.some((i) => i.isProjected) || p.expenses.some((e) => e.isProjected);
  return {
    income,
    directExpense,
    amortizedAssetCost: assetCost,
    net: income - directExpense - assetCost,
    hasProjected,
  };
}
