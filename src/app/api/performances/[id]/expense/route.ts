import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePortalUser, EXPENSE_CATEGORIES } from "@/lib/perf-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePortalUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.category || !EXPENSE_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: "Amount must be a non-negative number" }, { status: 400 });
    }

    const line = await prisma.performanceExpense.create({
      data: {
        performanceId: id,
        category: body.category,
        amount,
        isProjected: Boolean(body.isProjected),
        notes: body.notes?.trim() || null,
      },
    });
    return NextResponse.json(line, { status: 201 });
  } catch (error) {
    console.error("[API] POST expense line failed:", error);
    return NextResponse.json({ error: "Failed to create expense line" }, { status: 500 });
  }
}
