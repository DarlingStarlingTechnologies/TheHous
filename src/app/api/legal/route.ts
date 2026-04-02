import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.legalItem.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const item = await prisma.legalItem.create({
    data: {
      title: body.title,
      type: body.type || "other",
      status: body.status || "pending",
      deadline: body.deadline ? new Date(body.deadline) : null,
      notes: body.notes || null,
      documentRef: body.documentRef || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
