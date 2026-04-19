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

export async function GET(request: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {};
    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y)) {
        where.date = {
          gte: new Date(Date.UTC(y, 0, 1)),
          lt: new Date(Date.UTC(y + 1, 0, 1)),
        };
      }
    }

    const items = await prisma.performance.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        incomes: true,
        expenses: true,
        assetUsages: { include: { asset: true } },
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[API] GET /api/performances failed:", error);
    return NextResponse.json({ error: "Failed to fetch performances" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAuth())) {
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
    if (!body.date || isNaN(Date.parse(body.date))) {
      return NextResponse.json({ error: "Valid date is required" }, { status: 400 });
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

    const item = await prisma.performance.create({
      data: {
        title: body.title.trim(),
        persona: body.persona?.trim() || null,
        venue: body.venue?.trim() || null,
        date: new Date(body.date),
        hoursWorked: body.hoursWorked != null ? parseFloat(body.hoursWorked) : null,
        type: body.type || "featured",
        season: body.season || "standard",
        status: body.status || "scheduled",
        brandScore: body.brandScore != null ? parseInt(body.brandScore, 10) : null,
        notes: body.notes?.trim() || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/performances failed:", error);
    return NextResponse.json({ error: "Failed to create performance" }, { status: 500 });
  }
}
