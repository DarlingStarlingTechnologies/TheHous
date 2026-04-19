import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["guest_appearance", "featured", "headliner", "host", "promo", "seasonal"];
const VALID_SEASONS = ["standard", "pride", "halloween", "christmas", "valentine", "other"];
const VALID_STATUSES = ["scheduled", "completed", "canceled"];

async function requireAuth() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return null;
  }
  return user;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const item = await prisma.performance.findUnique({
      where: { id },
      include: {
        incomes: { orderBy: { createdAt: "asc" } },
        expenses: { orderBy: { createdAt: "asc" } },
        assetUsages: {
          include: { asset: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("[API] GET /api/performances/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch performance" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim().length === 0)) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    if (body.date && isNaN(Date.parse(body.date))) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    if (body.type && !VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (body.season && !VALID_SEASONS.includes(body.season)) {
      return NextResponse.json({ error: "Invalid season" }, { status: 400 });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (body.brandScore != null) {
      const b = parseInt(body.brandScore, 10);
      if (isNaN(b) || b < 1 || b > 5) {
        return NextResponse.json({ error: "brandScore must be 1-5" }, { status: 400 });
      }
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.persona !== undefined) data.persona = body.persona?.trim() || null;
    if (body.venue !== undefined) data.venue = body.venue?.trim() || null;
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.hoursWorked !== undefined) data.hoursWorked = body.hoursWorked != null ? parseFloat(body.hoursWorked) : null;
    if (body.type !== undefined) data.type = body.type;
    if (body.season !== undefined) data.season = body.season;
    if (body.status !== undefined) data.status = body.status;
    if (body.brandScore !== undefined) data.brandScore = body.brandScore != null ? parseInt(body.brandScore, 10) : null;
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    const item = await prisma.performance.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (error) {
    console.error("[API] PUT /api/performances/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update performance" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.performance.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] DELETE /api/performances/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete performance" }, { status: 500 });
  }
}
