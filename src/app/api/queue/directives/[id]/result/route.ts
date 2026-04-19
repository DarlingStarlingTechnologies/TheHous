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
    const body = await request.json();

    const directive = await prisma.directive.findUnique({ where: { id } });
    if (!directive) {
      return NextResponse.json({ error: "Directive not found" }, { status: 404 });
    }

    if (directive.status !== "running" && directive.status !== "claimed") {
      return NextResponse.json(
        { error: `Cannot post result for directive in '${directive.status}' status` },
        { status: 400 },
      );
    }

    // Create result and update directive status in a transaction
    await prisma.$transaction([
      prisma.directiveResult.create({
        data: {
          directiveId: id,
          success: body.success ?? false,
          exitCode: body.exitCode ?? null,
          stdout: body.stdout ?? "",
          stderr: body.stderr ?? "",
          summary: body.summary ?? "",
          startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
          completedAt: body.completedAt ? new Date(body.completedAt) : new Date(),
          durationMs: body.durationMs ?? 0,
          truncated: body.truncated ?? false,
          error: body.error ?? null,
        },
      }),
      prisma.directive.update({
        where: { id },
        data: {
          status: body.success ? "completed" : "failed",
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Queue] POST /api/queue/directives/[id]/result failed:", error);
    return NextResponse.json({ error: "Failed to store result" }, { status: 500 });
  }
}
