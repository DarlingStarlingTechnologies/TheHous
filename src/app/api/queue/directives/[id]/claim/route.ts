import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateQueueToken } from "@/lib/queue-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = validateQueueToken(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    // Atomic claim: only update if status is still "pending"
    const result = await prisma.directive.updateMany({
      where: { id, status: "pending" },
      data: { status: "claimed", claimedAt: new Date() },
    });

    if (result.count === 0) {
      return NextResponse.json({
        success: false,
        error: "Directive is not in pending status",
      });
    }

    const directive = await prisma.directive.findUnique({ where: { id } });

    return NextResponse.json({
      success: true,
      directive: {
        id: directive!.id,
        instruction: directive!.instruction,
        status: directive!.status,
        createdAt: directive!.createdAt,
      },
    });
  } catch (error) {
    console.error("[Queue] POST /api/queue/directives/[id]/claim failed:", error);
    return NextResponse.json({ error: "Failed to claim directive" }, { status: 500 });
  }
}
