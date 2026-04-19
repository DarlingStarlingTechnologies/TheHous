import { NextRequest, NextResponse } from "next/server";

/**
 * Validates bearer token for queue API endpoints.
 * Returns null if valid, or a 401 NextResponse if invalid.
 */
export function validateQueueToken(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 },
    );
  }

  const token = authHeader.slice(7);
  const expectedToken = process.env.QUEUE_API_TOKEN;

  if (!expectedToken) {
    console.error("[Queue] QUEUE_API_TOKEN environment variable is not set");
    return NextResponse.json(
      { error: "Queue authentication not configured" },
      { status: 500 },
    );
  }

  if (token !== expectedToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return null;
}
