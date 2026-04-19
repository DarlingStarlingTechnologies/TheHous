import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateQueueToken } from "@/lib/queue-auth";

export async function GET(request: NextRequest) {
  const authError = validateQueueToken(request);
  if (authError) return authError;

  try {
    const directive = await prisma.directive.findFirst({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    });

    if (!directive) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json({
      directive: {
        id: directive.id,
        instruction: directive.instruction,
        status: directive.status,
        targetPath: directive.targetPath,
        branch: directive.branch,
        createdAt: directive.createdAt,
        metadata: directive.metadata,
      },
    });
  } catch (error) {
    console.error("[Queue] GET /api/queue/directives/next failed:", error);
    return NextResponse.json({ error: "Failed to fetch next directive" }, { status: 500 });
  }
}
