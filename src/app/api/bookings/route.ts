import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["confirmed", "tentative", "cancelled", "completed"];

export async function GET() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { dateTime: "asc" },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[API] GET /api/bookings failed:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;
  if (!user || (user.role !== "admin" && user.status !== "approved")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (body.title.length > 500) {
      return NextResponse.json({ error: "Title must be under 500 characters" }, { status: 400 });
    }
    if (!body.dateTime || isNaN(Date.parse(body.dateTime))) {
      return NextResponse.json({ error: "Valid date/time is required" }, { status: 400 });
    }
    if (body.endTime && isNaN(Date.parse(body.endTime))) {
      return NextResponse.json({ error: "Invalid end time" }, { status: 400 });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        title: body.title.trim(),
        dateTime: new Date(body.dateTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
        location: body.location || null,
        status: body.status || "confirmed",
        notes: body.notes || null,
      },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/bookings failed:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
