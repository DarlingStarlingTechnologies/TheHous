import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = await prisma.project.create({
    data: {
      title: body.title,
      status: body.status || "active",
      priority: body.priority || "medium",
      notes: body.notes || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      nextAction: body.nextAction || null,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
