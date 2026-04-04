import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["contract", "license", "trademark", "compliance", "other"];
const VALID_STATUSES = ["pending", "active", "expired", "resolved"];

export async function GET() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.legalItem.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[API] GET /api/legal failed:", error);
    return NextResponse.json({ error: "Failed to fetch legal items" }, { status: 500 });
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
    if (body.type && !VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (body.deadline && isNaN(Date.parse(body.deadline))) {
      return NextResponse.json({ error: "Invalid deadline" }, { status: 400 });
    }

    const item = await prisma.legalItem.create({
      data: {
        title: body.title.trim(),
        type: body.type || "other",
        status: body.status || "pending",
        deadline: body.deadline ? new Date(body.deadline) : null,
        notes: body.notes || null,
        documentRef: body.documentRef || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/legal failed:", error);
    return NextResponse.json({ error: "Failed to create legal item" }, { status: 500 });
  }
}
