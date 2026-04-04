import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["contract", "license", "trademark", "compliance", "other"];
const VALID_STATUSES = ["pending", "active", "expired", "resolved"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim().length === 0)) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    if (body.title && body.title.length > 500) {
      return NextResponse.json({ error: "Title must be under 500 characters" }, { status: 400 });
    }
    if (body.type && !VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (body.deadline && isNaN(Date.parse(body.deadline))) {
      return NextResponse.json({ error: "Invalid deadline" }, { status: 400 });
    }

    const item = await prisma.legalItem.update({
      where: { id },
      data: {
        title: body.title,
        type: body.type,
        status: body.status,
        deadline: body.deadline ? new Date(body.deadline) : null,
        notes: body.notes || null,
        documentRef: body.documentRef || null,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("[API] PUT /api/legal/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update legal item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.legalItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] DELETE /api/legal/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete legal item" }, { status: 500 });
  }
}
