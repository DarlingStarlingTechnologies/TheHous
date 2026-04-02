import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const item = await prisma.financialItem.update({
    where: { id },
    data: {
      title: body.title,
      category: body.category,
      status: body.status,
      amount: body.amount ? parseFloat(body.amount) : null,
      frequency: body.frequency || null,
      notes: body.notes || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.financialItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
