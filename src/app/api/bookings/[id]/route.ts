import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const booking = await prisma.booking.update({
    where: { id },
    data: {
      title: body.title,
      dateTime: new Date(body.dateTime),
      endTime: body.endTime ? new Date(body.endTime) : null,
      location: body.location || null,
      status: body.status,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(booking);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
