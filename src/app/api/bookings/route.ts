import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    orderBy: { dateTime: "asc" },
  });
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const booking = await prisma.booking.create({
    data: {
      title: body.title,
      dateTime: new Date(body.dateTime),
      endTime: body.endTime ? new Date(body.endTime) : null,
      location: body.location || null,
      status: body.status || "confirmed",
      notes: body.notes || null,
    },
  });
  return NextResponse.json(booking, { status: 201 });
}
