import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/perf-auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; usageId: string }> }
) {
  if (!(await requirePortalUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { usageId } = await params;
    await prisma.assetUsage.delete({ where: { id: usageId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] DELETE asset usage failed:", error);
    return NextResponse.json({ error: "Failed to unlink asset" }, { status: 500 });
  }
}
