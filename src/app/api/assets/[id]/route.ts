import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePortalUser, ASSET_CATEGORIES } from "@/lib/perf-auth";

const VALID_STATUSES = ["active", "retired"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePortalUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      data.name = body.name.trim();
    }
    if (body.category !== undefined) {
      if (!ASSET_CATEGORIES.includes(body.category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      data.category = body.category;
    }
    if (body.purchaseCost !== undefined) {
      const c = parseFloat(body.purchaseCost);
      if (isNaN(c) || c < 0) {
        return NextResponse.json({ error: "purchaseCost must be a non-negative number" }, { status: 400 });
      }
      data.purchaseCost = c;
    }
    if (body.purchaseDate !== undefined) {
      if (isNaN(Date.parse(body.purchaseDate))) {
        return NextResponse.json({ error: "Invalid purchaseDate" }, { status: 400 });
      }
      data.purchaseDate = new Date(body.purchaseDate);
    }
    if (body.expectedUses !== undefined) {
      const e = parseInt(body.expectedUses, 10);
      if (isNaN(e) || e < 1) {
        return NextResponse.json({ error: "expectedUses must be >= 1" }, { status: 400 });
      }
      data.expectedUses = e;
    }
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    const item = await prisma.asset.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (error) {
    console.error("[API] PUT /api/assets/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePortalUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] DELETE /api/assets/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
