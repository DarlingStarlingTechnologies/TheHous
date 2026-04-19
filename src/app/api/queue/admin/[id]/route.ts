import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const directive = await prisma.directive.findUnique({
      where: { id },
      include: { result: true },
    });

    if (!directive) {
      return NextResponse.json({ error: "Directive not found" }, { status: 404 });
    }

    return NextResponse.json(directive);
  } catch (error) {
    console.error("[API] GET /api/queue/admin/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch directive" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.directive.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] DELETE /api/queue/admin/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete directive" }, { status: 500 });
  }
}
