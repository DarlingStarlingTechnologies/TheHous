import { auth } from "@/lib/auth";

export async function requirePortalUser() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return null;
  }
  return user;
}

export const INCOME_CATEGORIES = ["base_pay", "tips", "merch", "bonus", "other"] as const;

export const EXPENSE_CATEGORIES = [
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

export const ASSET_CATEGORIES = ["wig", "costume", "shoes", "accessories", "props", "other"] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];
