const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const ipBuckets = new Map<string, RateLimitEntry>();

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = ipBuckets.get(ip);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    ipBuckets.set(ip, { count: 1, windowStart: now });
    return { allowed: true as const };
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000)
    );
    return { allowed: false as const, retryAfterSec };
  }

  entry.count += 1;
  ipBuckets.set(ip, entry);

  return { allowed: true as const };
}
