import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const directives = await prisma.directive.findMany({
      orderBy: { createdAt: "desc" },
      include: { result: true },
    });
    return NextResponse.json(directives);
  } catch (error) {
    console.error("[API] GET /api/queue/admin failed:", error);
    return NextResponse.json({ error: "Failed to fetch directives" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.instruction || typeof body.instruction !== "string" || body.instruction.trim().length === 0) {
      return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
    }

    if (body.metadata) {
      try {
        if (typeof body.metadata === "string") {
          JSON.parse(body.metadata);
        }
      } catch {
        return NextResponse.json({ error: "Metadata must be valid JSON" }, { status: 400 });
      }
    }

    const directive = await prisma.directive.create({
      data: {
        instruction: body.instruction.trim(),
        targetPath: body.targetPath?.trim() || null,
        branch: body.branch?.trim() || null,
        metadata: body.metadata
          ? typeof body.metadata === "string"
            ? JSON.parse(body.metadata)
            : body.metadata
          : null,
      },
    });
    return NextResponse.json(directive, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/queue/admin failed:", error);
    return NextResponse.json({ error: "Failed to create directive" }, { status: 500 });
  }
}
