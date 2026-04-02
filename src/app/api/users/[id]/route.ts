import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";

async function sendWelcomeEmail(dbUser: { email: string; name: string | null }) {
  try {
    await sendEmail({
      to: dbUser.email,
      subject: "Welcome to The Hous — Your Access Has Been Approved",
      html: welcomeEmail(dbUser.name),
    });
    return true;
  } catch (e) {
    console.error("[EMAIL] Failed to send welcome email:", e);
    return false;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const validStatuses = ["pending", "approved", "restricted"];
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Get current user before update to check status change
  const current = await prisma.user.findUnique({ where: { id } });

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.role && { role: body.role }),
    },
  });

  // Send welcome email when newly approved
  let emailSent = false;
  if (body.status === "approved" && current?.status !== "approved") {
    emailSent = await sendWelcomeEmail(updated);
  }

  return NextResponse.json({ ...updated, emailSent });
}

// Resend welcome email
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const dbUser = await prisma.user.findUnique({ where: { id } });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (dbUser.status !== "approved") {
    return NextResponse.json({ error: "User is not approved" }, { status: 400 });
  }

  const sent = await sendWelcomeEmail(dbUser);

  if (!sent) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
