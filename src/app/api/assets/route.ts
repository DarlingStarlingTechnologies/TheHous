import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePortalUser, ASSET_CATEGORIES } from "@/lib/perf-auth";

const VALID_STATUSES = ["active", "retired"];

export async function GET() {
  if (!(await requirePortalUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.asset.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        usages: {
          include: {
            performance: { select: { id: true, title: true, date: true } },
          },
        },
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[API] GET /api/assets failed:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requirePortalUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.category || !ASSET_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    const purchaseCost = parseFloat(body.purchaseCost);
    if (isNaN(purchaseCost) || purchaseCost < 0) {
      return NextResponse.json({ error: "purchaseCost must be a non-negative number" }, { status: 400 });
    }
    if (!body.purchaseDate || isNaN(Date.parse(body.purchaseDate))) {
      return NextResponse.json({ error: "Valid purchaseDate is required" }, { status: 400 });
    }
    const expectedUses = body.expectedUses != null ? parseInt(body.expectedUses, 10) : 10;
    if (isNaN(expectedUses) || expectedUses < 1) {
      return NextResponse.json({ error: "expectedUses must be >= 1" }, { status: 400 });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const item = await prisma.asset.create({
      data: {
        name: body.name.trim(),
        category: body.category,
        purchaseCost,
        purchaseDate: new Date(body.purchaseDate),
        expectedUses,
        status: body.status || "active",
        notes: body.notes?.trim() || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/assets failed:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
