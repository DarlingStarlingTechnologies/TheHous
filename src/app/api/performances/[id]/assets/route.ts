import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/perf-auth";

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

    if (!body.assetId || typeof body.assetId !== "string") {
      return NextResponse.json({ error: "assetId is required" }, { status: 400 });
    }

    const usage = await prisma.assetUsage.create({
      data: { performanceId: id, assetId: body.assetId },
      include: { asset: true },
    });
    return NextResponse.json(usage, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Asset already linked to this performance" }, { status: 409 });
    }
    console.error("[API] POST asset usage failed:", error);
    return NextResponse.json({ error: "Failed to link asset" }, { status: 500 });
  }
}
