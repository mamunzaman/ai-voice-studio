const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 12_000;

type TurnstileVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret,
        response: token,
      }),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });

    const raw = await response.text();

    let data: TurnstileVerifyResponse;
    try {
      data = JSON.parse(raw) as TurnstileVerifyResponse;
    } catch {
      console.error("[turnstile] Non-JSON response", response.status, raw.slice(0, 120));
      return false;
    }

    if (!data.success) {
      console.error("[turnstile] Verification failed", data["error-codes"]);
    }

    return data.success === true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[turnstile] Request failed:", message);
    return false;
  }
}
