import { NextResponse } from "next/server";
import { streamText, convertToModelMessages, stepCountIs, tool, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "@/lib/perf-auth";

export const maxDuration = 60;

const INCOME_ENUM = z.enum(INCOME_CATEGORIES);
const EXPENSE_ENUM = z.enum(EXPENSE_CATEGORIES);
const TYPE_ENUM = z.enum([
  "guest_appearance",
  "featured",
  "headliner",
  "host",
  "promo",
  "seasonal",
]);
const SEASON_ENUM = z.enum(["standard", "pride", "halloween", "christmas", "valentine", "other"]);
const STATUS_ENUM = z.enum(["scheduled", "completed", "canceled"]);

function buildSystemPrompt() {
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  return `You are the financial assistant for Anastasia Starling, a professional drag queen and actor.

Today is ${weekday}, ${todayISO}.

You help her track performances (shows, gigs, appearances) and their income and expenses. Income categories: ${INCOME_CATEGORIES.join(", ")}. Expense categories: ${EXPENSE_CATEGORIES.join(", ")}. Performance types: guest_appearance, featured, headliner, host, promo, seasonal. Seasons: standard, pride, halloween, christmas, valentine, other. Statuses: scheduled, completed, canceled.

RULES:
1. When she mentions a show, always call findPerformances to identify it before doing anything else. Resolve natural dates ("last night", "Friday", "next month") against today's date. Be flexible with venue matches (partial/fuzzy).
2. If there are multiple matches, ask her to clarify which one.
3. Before adding a line item, always call getPerformance to check for existing entries in that category. If one exists, ask whether she wants to (a) add a new line, (b) update the existing line to a new total, or (c) add to the existing amount. Do not assume.
4. For scheduled (future) performances, use isProjected=true when adding estimates. For completed performances, isProjected=false.
5. Always confirm in plain language before calling any write tool (create/update). Example: "Want me to add $31 tips to your Janet show at Rumors from Friday?" Then wait for yes/confirmation before calling the tool.
6. If she asks about totals, trends, or best/worst shows, use queryAnalytics. Present numbers cleanly (e.g. "$31.00").
7. If she wants to log a show that doesn't exist yet, offer to create it first with createPerformance.
8. Be warm but efficient. Match her brand — elegant, a little theatrical, never corporate. Short responses; no filler.
9. Never invent data. If a tool returns nothing, say so and ask for clarification.`;
}

async function requireUser() {
  const session = await auth();
  const u = session?.user as Record<string, unknown> | undefined;
  if (!u || (u.role !== "admin" && u.status !== "approved")) return null;
  return u;
}

export async function POST(req: Request) {
  if (!(await requireUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const tools = {
    findPerformances: tool({
      description:
        "Search for performances by venue, persona, title keywords, and/or date range. Use this to identify which show the user is talking about.",
      inputSchema: z.object({
        searchText: z.string().optional().describe("loose match against title, venue, or persona"),
        venue: z.string().optional(),
        persona: z.string().optional(),
        dateFrom: z.string().optional().describe("YYYY-MM-DD inclusive"),
        dateTo: z.string().optional().describe("YYYY-MM-DD inclusive"),
        status: STATUS_ENUM.optional(),
        limit: z.number().int().min(1).max(25).optional().default(10),
      }),
      execute: async (input) => {
        const where: Record<string, unknown> = {};
        const and: Record<string, unknown>[] = [];
        if (input.venue) and.push({ venue: { contains: input.venue, mode: "insensitive" } });
        if (input.persona) and.push({ persona: { contains: input.persona, mode: "insensitive" } });
        if (input.searchText) {
          and.push({
            OR: [
              { title: { contains: input.searchText, mode: "insensitive" } },
              { venue: { contains: input.searchText, mode: "insensitive" } },
              { persona: { contains: input.searchText, mode: "insensitive" } },
              { notes: { contains: input.searchText, mode: "insensitive" } },
            ],
          });
        }
        if (input.dateFrom || input.dateTo) {
          const date: Record<string, Date> = {};
          if (input.dateFrom) date.gte = new Date(input.dateFrom + "T00:00:00.000Z");
          if (input.dateTo) date.lte = new Date(input.dateTo + "T23:59:59.999Z");
          and.push({ date });
        }
        if (input.status) and.push({ status: input.status });
        if (and.length > 0) where.AND = and;

        const items = await prisma.performance.findMany({
          where,
          orderBy: { date: "desc" },
          take: input.limit ?? 10,
          select: {
            id: true,
            title: true,
            persona: true,
            venue: true,
            date: true,
            type: true,
            season: true,
            status: true,
            brandScore: true,
          },
        });
        return { count: items.length, performances: items };
      },
    }),

    getPerformance: tool({
      description:
        "Fetch full performance detail including all income lines, expense lines, and linked assets. Call this before adding/updating line items so you can check for duplicates.",
      inputSchema: z.object({ id: z.string() }),
      execute: async ({ id }) => {
        const p = await prisma.performance.findUnique({
          where: { id },
          include: {
            incomes: { orderBy: { createdAt: "asc" } },
            expenses: { orderBy: { createdAt: "asc" } },
            assetUsages: { include: { asset: true } },
          },
        });
        if (!p) return { error: "not found" };
        const income = p.incomes.reduce((s, i) => s + i.amount, 0);
        const directExpense = p.expenses.reduce((s, e) => s + e.amount, 0);
        const amortizedAssetCost = p.assetUsages.reduce(
          (s, u) => s + u.asset.purchaseCost / Math.max(u.asset.expectedUses, 1),
          0
        );
        return {
          performance: p,
          totals: {
            income,
            directExpense,
            amortizedAssetCost,
            net: income - directExpense - amortizedAssetCost,
          },
        };
      },
    }),

    createPerformance: tool({
      description:
        "Create a new performance record. Always confirm the details with the user before calling this.",
      inputSchema: z.object({
        title: z.string().min(1),
        date: z.string().describe("YYYY-MM-DD"),
        type: TYPE_ENUM.optional().default("featured"),
        season: SEASON_ENUM.optional().default("standard"),
        status: STATUS_ENUM.optional().default("scheduled"),
        persona: z.string().optional(),
        venue: z.string().optional(),
        hoursWorked: z.number().min(0).optional(),
        brandScore: z.number().int().min(1).max(5).optional(),
        notes: z.string().optional(),
      }),
      execute: async (input) => {
        const created = await prisma.performance.create({
          data: {
            title: input.title.trim(),
            date: new Date(input.date + "T12:00:00.000Z"),
            type: input.type ?? "featured",
            season: input.season ?? "standard",
            status: input.status ?? "scheduled",
            persona: input.persona?.trim() || null,
            venue: input.venue?.trim() || null,
            hoursWorked: input.hoursWorked ?? null,
            brandScore: input.brandScore ?? null,
            notes: input.notes?.trim() || null,
          },
        });
        return { ok: true, id: created.id, performance: created };
      },
    }),

    addIncomeLine: tool({
      description:
        "Add an income line to a performance. Confirm details with the user first. Use isProjected=true for future/estimated, false for actuals.",
      inputSchema: z.object({
        performanceId: z.string(),
        category: INCOME_ENUM,
        amount: z.number().min(0),
        isProjected: z.boolean().optional().default(false),
        notes: z.string().optional(),
      }),
      execute: async (input) => {
        const line = await prisma.performanceIncome.create({
          data: {
            performanceId: input.performanceId,
            category: input.category,
            amount: input.amount,
            isProjected: input.isProjected ?? false,
            notes: input.notes?.trim() || null,
          },
        });
        return { ok: true, line };
      },
    }),

    updateIncomeLine: tool({
      description:
        "Update an existing income line (amount, category, notes, projected flag). Confirm with the user first.",
      inputSchema: z.object({
        lineId: z.string(),
        amount: z.number().min(0).optional(),
        category: INCOME_ENUM.optional(),
        isProjected: z.boolean().optional(),
        notes: z.string().optional(),
      }),
      execute: async (input) => {
        const data: Record<string, unknown> = {};
        if (input.amount != null) data.amount = input.amount;
        if (input.category) data.category = input.category;
        if (input.isProjected != null) data.isProjected = input.isProjected;
        if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
        const line = await prisma.performanceIncome.update({ where: { id: input.lineId }, data });
        return { ok: true, line };
      },
    }),

    addExpenseLine: tool({
      description:
        "Add an expense line to a performance. Confirm details with the user first. Use isProjected=true for future/estimated, false for actuals.",
      inputSchema: z.object({
        performanceId: z.string(),
        category: EXPENSE_ENUM,
        amount: z.number().min(0),
        isProjected: z.boolean().optional().default(false),
        notes: z.string().optional(),
      }),
      execute: async (input) => {
        const line = await prisma.performanceExpense.create({
          data: {
            performanceId: input.performanceId,
            category: input.category,
            amount: input.amount,
            isProjected: input.isProjected ?? false,
            notes: input.notes?.trim() || null,
          },
        });
        return { ok: true, line };
      },
    }),

    updateExpenseLine: tool({
      description:
        "Update an existing expense line. Confirm with the user first.",
      inputSchema: z.object({
        lineId: z.string(),
        amount: z.number().min(0).optional(),
        category: EXPENSE_ENUM.optional(),
        isProjected: z.boolean().optional(),
        notes: z.string().optional(),
      }),
      execute: async (input) => {
        const data: Record<string, unknown> = {};
        if (input.amount != null) data.amount = input.amount;
        if (input.category) data.category = input.category;
        if (input.isProjected != null) data.isProjected = input.isProjected;
        if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
        const line = await prisma.performanceExpense.update({ where: { id: input.lineId }, data });
        return { ok: true, line };
      },
    }),

    queryAnalytics: tool({
      description:
        "Aggregate totals (income, expenses, net) across performances matching the filters. Returns overall totals plus a list of the matching performances with their net.",
      inputSchema: z.object({
        dateFrom: z.string().optional().describe("YYYY-MM-DD inclusive"),
        dateTo: z.string().optional().describe("YYYY-MM-DD inclusive"),
        year: z.number().int().optional(),
        persona: z.string().optional(),
        venue: z.string().optional(),
        season: SEASON_ENUM.optional(),
        type: TYPE_ENUM.optional(),
        status: STATUS_ENUM.optional(),
      }),
      execute: async (input) => {
        const and: Record<string, unknown>[] = [];
        if (input.year) {
          and.push({
            date: {
              gte: new Date(Date.UTC(input.year, 0, 1)),
              lt: new Date(Date.UTC(input.year + 1, 0, 1)),
            },
          });
        }
        if (input.dateFrom || input.dateTo) {
          const date: Record<string, Date> = {};
          if (input.dateFrom) date.gte = new Date(input.dateFrom + "T00:00:00.000Z");
          if (input.dateTo) date.lte = new Date(input.dateTo + "T23:59:59.999Z");
          and.push({ date });
        }
        if (input.persona) and.push({ persona: { contains: input.persona, mode: "insensitive" } });
        if (input.venue) and.push({ venue: { contains: input.venue, mode: "insensitive" } });
        if (input.season) and.push({ season: input.season });
        if (input.type) and.push({ type: input.type });
        if (input.status) and.push({ status: input.status });

        const items = await prisma.performance.findMany({
          where: and.length ? { AND: and } : {},
          orderBy: { date: "desc" },
          include: {
            incomes: true,
            expenses: true,
            assetUsages: { include: { asset: true } },
          },
        });

        let totalIncome = 0,
          totalDirectExpense = 0,
          totalAssetCost = 0;
        const perShow = items.map((p) => {
          const income = p.incomes.reduce((s, i) => s + i.amount, 0);
          const directExpense = p.expenses.reduce((s, e) => s + e.amount, 0);
          const assetCost = p.assetUsages.reduce(
            (s, u) => s + u.asset.purchaseCost / Math.max(u.asset.expectedUses, 1),
            0
          );
          totalIncome += income;
          totalDirectExpense += directExpense;
          totalAssetCost += assetCost;
          return {
            id: p.id,
            title: p.title,
            date: p.date,
            venue: p.venue,
            persona: p.persona,
            status: p.status,
            net: income - directExpense - assetCost,
          };
        });

        return {
          count: items.length,
          totals: {
            income: totalIncome,
            directExpense: totalDirectExpense,
            amortizedAssetCost: totalAssetCost,
            net: totalIncome - totalDirectExpense - totalAssetCost,
          },
          performances: perShow,
        };
      },
    }),
  };

  try {
    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: openai("gpt-4o"),
      system: buildSystemPrompt(),
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(10),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[API] /api/chat failed:", error);
    return NextResponse.json({ error: "Assistant error" }, { status: 500 });
  }
}
