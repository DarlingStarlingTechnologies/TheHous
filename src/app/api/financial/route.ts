import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_CATEGORIES = ["income", "expense", "investment", "subscription", "other"];
const VALID_STATUSES = ["active", "paid", "overdue", "cancelled"];

export async function GET() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.financialItem.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[API] GET /api/financial failed:", error);
    return NextResponse.json({ error: "Failed to fetch financial items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (body.title.length > 500) {
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

    const item = await prisma.financialItem.create({
      data: {
        title: body.title.trim(),
        category: body.category || "expense",
        status: body.status || "active",
        amount: body.amount ? parseFloat(body.amount) : null,
        frequency: body.frequency || null,
        notes: body.notes || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/financial failed:", error);
    return NextResponse.json({ error: "Failed to create financial item" }, { status: 500 });
  }
}
