import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
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
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.legalItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
