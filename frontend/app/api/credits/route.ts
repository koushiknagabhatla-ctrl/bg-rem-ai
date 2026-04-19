import { NextRequest, NextResponse } from "next/server";

const RENDER_API_URL = process.env.RENDER_API_URL!;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization required" },
      { status: 401 }
    );
  }

  if (!RENDER_API_URL) {
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${RENDER_API_URL}/me/credits`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: body },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
