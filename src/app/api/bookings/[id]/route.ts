import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["confirmed", "tentative", "cancelled", "completed"];

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
    if (body.dateTime && isNaN(Date.parse(body.dateTime))) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
    }
    if (body.endTime && isNaN(Date.parse(body.endTime))) {
      return NextResponse.json({ error: "Invalid end time" }, { status: 400 });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        title: body.title,
        dateTime: body.dateTime ? new Date(body.dateTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : null,
        location: body.location || null,
        status: body.status,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(booking);
  } catch (error) {
    console.error("[API] PUT /api/bookings/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
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
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] DELETE /api/bookings/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
