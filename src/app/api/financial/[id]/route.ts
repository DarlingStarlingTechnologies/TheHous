import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_CATEGORIES = ["income", "expense", "investment", "subscription", "other"];
const VALID_STATUSES = ["active", "paid", "overdue", "cancelled"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim().length === 0)) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    if (body.title && body.title.length > 500) {
      return NextResponse.json({ error: "Title must be under 500 characters" }, { status: 400 });
    }
    if (body.category && !VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (body.amount !== undefined && body.amount !== null) {
      const amount = parseFloat(body.amount);
      if (isNaN(amount)) {
        return NextResponse.json({ error: "Amount must be a valid number" }, { status: 400 });
      }
    }
    if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
      return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
    }

    const item = await prisma.financialItem.update({
      where: { id },
      data: {
        title: body.title,
        category: body.category,
        status: body.status,
        amount: body.amount ? parseFloat(body.amount) : null,
        frequency: body.frequency || null,
        notes: body.notes || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("[API] PUT /api/financial/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update financial item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.financialItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] DELETE /api/financial/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete financial item" }, { status: 500 });
  }
}
