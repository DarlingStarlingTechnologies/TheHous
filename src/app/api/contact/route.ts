import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["collaboration", "software-development", "booking-talent", "ecosystem-tools"];

// In-memory rate limiting by IP — max 5 submissions per 15 minutes
const rateMap = new Map<string, number[]>();
const RATE_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  rateMap.set(ip, timestamps);
  return false;
}

// Basic sanitization — strip HTML tags
function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

// Email format check
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, email, inquiryType, message, details } = body;

  // Required fields
  if (!name || !email || !inquiryType) {
    return NextResponse.json({ error: "Name, email, and inquiry type are required" }, { status: 400 });
  }

  // Type check
  if (!VALID_TYPES.includes(inquiryType)) {
    return NextResponse.json({ error: "Invalid inquiry type" }, { status: 400 });
  }

  // Email validation
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Length limits
  if (name.length > 200 || email.length > 200) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }
  if (message && message.length > 5000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  // Sanitize
  const cleanName = sanitize(name);
  const cleanMessage = message ? sanitize(message) : null;

  // Sanitize details values
  let cleanDetails: string | null = null;
  if (details && typeof details === "object") {
    const sanitized: Record<string, string> = {};
    for (const [key, val] of Object.entries(details)) {
      if (typeof val === "string" && val.length <= 1000) {
        sanitized[key] = sanitize(val);
      }
    }
    if (Object.keys(sanitized).length > 0) {
      cleanDetails = JSON.stringify(sanitized);
    }
  }

  const inquiry = await prisma.contactInquiry.create({
    data: {
      name: cleanName,
      email: email.trim().toLowerCase(),
      inquiryType,
      message: cleanMessage,
      details: cleanDetails,
    },
  });

  return NextResponse.json({ id: inquiry.id }, { status: 201 });
}
