import { verifyTurnstileToken } from "@/lib/verify-turnstile";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password || "");
    const turnstileToken = String(body.turnstileToken || "");

    if (!password || password !== process.env.DEMO_PASSWORD) {
      return Response.json({ error: "Incorrect password." }, { status: 401 });
    }

    if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken))) {
      return Response.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 403 }
      );
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
