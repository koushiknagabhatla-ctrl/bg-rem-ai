import { NextRequest, NextResponse } from "next/server";
import { createHmac, createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase";

const RENDER_API_URL = process.env.RENDER_API_URL!;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "koushiknagabhatla@gmail.com";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    if (!RENDER_API_URL) {
      return NextResponse.json(
        { error: "Backend not configured (RENDER_API_URL missing)" },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 20MB)" },
        { status: 413 }
      );
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());

    const timestamp = Date.now().toString();
    const bodyHash = createHash("sha256").update(imageBuffer).digest("hex");
    const signature = createHmac("sha256", WEBHOOK_SECRET)
      .update(`${timestamp}:${bodyHash}`)
      .digest("hex");

    const isAdmin = user.email === ADMIN_EMAIL;

    const backendForm = new FormData();
    backendForm.append(
      "image",
      new Blob([imageBuffer], { type: file.type }),
      file.name || "image.png"
    );

    const backendHeaders: Record<string, string> = {
      "X-Timestamp": timestamp,
      "X-Signature": signature,
      Authorization: isAdmin
        ? `Bearer ${ADMIN_API_KEY}`
        : `Bearer ${token}`,
    };

    const backendResponse = await fetch(`${RENDER_API_URL}/remove-bg`, {
      method: "POST",
      headers: backendHeaders,
      body: backendForm,
      signal: AbortSignal.timeout(30000),
    });

    if (!backendResponse.ok) {
      const errText = await backendResponse.text();
      let errJson: { error?: string; detail?: string } = {};
      try {
        errJson = JSON.parse(errText);
      } catch {
        errJson = { error: errText };
      }

      return NextResponse.json(
        {
          error:
            errJson.detail || errJson.error || "Backend processing failed",
        },
        { status: backendResponse.status }
      );
    }

    const resultBuffer = await backendResponse.arrayBuffer();

    const response = new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition":
          backendResponse.headers.get("Content-Disposition") ||
          'inline; filename="result.png"',
      },
    });

    const creditsRemaining = backendResponse.headers.get(
      "X-Credits-Remaining"
    );
    const processingTime = backendResponse.headers.get(
      "X-Processing-Time-Ms"
    );

    if (creditsRemaining)
      response.headers.set("X-Credits-Remaining", creditsRemaining);
    if (processingTime)
      response.headers.set("X-Processing-Time-Ms", processingTime);

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown proxy error";
    console.error("API proxy error:", message);

    if (message.includes("timeout") || message.includes("abort")) {
      return NextResponse.json(
        { error: "Backend timeout. Try a smaller image." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Internal proxy error" },
      { status: 500 }
    );
  }
}
