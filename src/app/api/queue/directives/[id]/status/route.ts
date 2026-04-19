import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateQueueToken } from "@/lib/queue-auth";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  claimed: ["running", "failed"],
  running: ["failed"],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = validateQueueToken(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.status || typeof body.status !== "string") {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const directive = await prisma.directive.findUnique({ where: { id } });
    if (!directive) {
      return NextResponse.json({ error: "Directive not found" }, { status: 404 });
    }

    const allowed = ALLOWED_TRANSITIONS[directive.status];
    if (!allowed || !allowed.includes(body.status)) {
      return NextResponse.json(
        { error: `Cannot transition from '${directive.status}' to '${body.status}'` },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = { status: body.status };
    if (body.status === "running") {
      data.startedAt = new Date();
    }
    if (body.status === "failed" && body.error) {
      // Store error in metadata
      data.metadata = { ...(directive.metadata as object || {}), error: body.error };
    }

    await prisma.directive.update({ where: { id }, data });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Queue] PATCH /api/queue/directives/[id]/status failed:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
