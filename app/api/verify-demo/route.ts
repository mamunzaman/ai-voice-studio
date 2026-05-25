import { verifyTurnstileToken } from "@/lib/verify-turnstile";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password || "").trim();
    const turnstileToken = String(body.turnstileToken || "").trim();

    const demoPassword = process.env.DEMO_PASSWORD?.trim();

    if (!demoPassword) {
      return Response.json(
        { error: "Server demo password is not configured." },
        { status: 503 }
      );
    }

    if (!process.env.TURNSTILE_SECRET_KEY?.trim()) {
      return Response.json(
        { error: "Server Turnstile secret is not configured." },
        { status: 503 }
      );
    }

    if (!password || password !== demoPassword) {
      return Response.json({ error: "Incorrect password." }, { status: 401 });
    }

    if (!turnstileToken) {
      return Response.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 403 }
      );
    }

    const turnstileOk = await verifyTurnstileToken(turnstileToken);

    if (!turnstileOk) {
      return Response.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 403 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[verify-demo]", error);

    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Something went wrong.";

    return Response.json({ error: message }, { status: 500 });
  }
}
