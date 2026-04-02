import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.financialItem.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const item = await prisma.financialItem.create({
    data: {
      title: body.title,
      category: body.category || "expense",
      status: body.status || "active",
      amount: body.amount ? parseFloat(body.amount) : null,
      frequency: body.frequency || null,
      notes: body.notes || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
