import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePortalUser, EXPENSE_CATEGORIES } from "@/lib/perf-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  if (!(await requirePortalUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lineId } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.category !== undefined) {
      if (!EXPENSE_CATEGORIES.includes(body.category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      data.category = body.category;
    }
    if (body.amount !== undefined) {
      const amount = parseFloat(body.amount);
      if (isNaN(amount) || amount < 0) {
        return NextResponse.json({ error: "Amount must be a non-negative number" }, { status: 400 });
      }
      data.amount = amount;
    }
    if (body.isProjected !== undefined) data.isProjected = Boolean(body.isProjected);
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    const line = await prisma.performanceExpense.update({ where: { id: lineId }, data });
    return NextResponse.json(line);
  } catch (error) {
    console.error("[API] PUT expense line failed:", error);
    return NextResponse.json({ error: "Failed to update expense line" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  if (!(await requirePortalUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lineId } = await params;
    await prisma.performanceExpense.delete({ where: { id: lineId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] DELETE expense line failed:", error);
    return NextResponse.json({ error: "Failed to delete expense line" }, { status: 500 });
  }
}
