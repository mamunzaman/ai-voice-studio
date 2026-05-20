import crypto from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { VoiceOption } from "@/types/voice";

type VoiceId = VoiceOption["id"];

const VALID_VOICES: VoiceId[] = [
  "male_bavarian",
  "female_bavarian",
  "male_hochdeutsch",
];

function isValidVoice(value: string): value is VoiceId {
  return VALID_VOICES.includes(value as VoiceId);
}

export async function POST(request: Request) {
  try {
    // In-memory limiter: 10 generations per IP per hour (resets on cold start).
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return Response.json(
        {
          error:
            "Rate limit exceeded. You can generate up to 10 voices per hour.",
          code: "RATE_LIMIT_EXCEEDED",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSec),
          },
        }
      );
    }

    const demoPassword = request.headers.get("x-demo-password");

    if (!demoPassword) {
      return Response.json(
        {
          error: "Demo password is required.",
          code: "MISSING_PASSWORD",
        },
        { status: 401 }
      );
    }

    if (!process.env.DEMO_PASSWORD) {
      return Response.json(
        {
          error: "Demo password is not configured on the server.",
          code: "SERVER_MISCONFIGURED",
        },
        { status: 500 }
      );
    }

    if (demoPassword !== process.env.DEMO_PASSWORD) {
      return Response.json(
        {
          error: "Invalid demo password.",
          code: "INVALID_PASSWORD",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const text = String(body.text || "").trim();
    const voiceInput = String(body.voice || "").trim();

    if (!text) {
      return Response.json(
        {
          error: "Text is required for voice generation.",
          code: "MISSING_TEXT",
        },
        { status: 400 }
      );
    }

    if (!voiceInput) {
      return Response.json(
        {
          error: "Voice selection is required.",
          code: "MISSING_VOICE",
        },
        { status: 400 }
      );
    }

    if (!isValidVoice(voiceInput)) {
      return Response.json(
        {
          error: `Invalid voice "${voiceInput}".`,
          code: "INVALID_VOICE",
          validVoices: VALID_VOICES,
        },
        { status: 400 }
      );
    }

    const voice = voiceInput;

    const MAX_SERVER_CHARACTERS =
      Number(process.env.MAX_TEXT_LENGTH) || 5000;

    if (text.length > MAX_SERVER_CHARACTERS) {
      return Response.json(
        {
          error: `This public demo is limited to ${MAX_SERVER_CHARACTERS} characters per generation.`,
          code: "TEXT_TOO_LONG",
        },
        { status: 400 }
      );
    }

    const cacheDir = path.join(process.cwd(), ".cache", "audio");
    await mkdir(cacheDir, { recursive: true });

    const cacheKey = crypto
      .createHash("sha256")
      .update(`${voice}:${text}`)
      .digest("hex");

    const cacheFilePath = path.join(cacheDir, `${cacheKey}.mp3`);

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: "Voice service is not configured.",
          code: "SERVER_MISCONFIGURED",
        },
        { status: 500 }
      );
    }

    if (existsSync(cacheFilePath)) {
      const cachedAudio = await readFile(cacheFilePath);

      return new Response(cachedAudio, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": "inline; filename=ai-voice-studio.mp3",
          "X-Cache": "HIT",
        },
      });
    }

    const voiceMap: Record<VoiceId, string> = {
      male_bavarian: process.env.ELEVENLABS_VOICE_MALE_BAVARIAN_ID ?? "",
      female_bavarian: process.env.ELEVENLABS_VOICE_FEMALE_BAVARIAN_ID ?? "",
      male_hochdeutsch: process.env.ELEVENLABS_VOICE_MALE_HOCHDEUTSCH_ID ?? "",
    };

    const voiceId = voiceMap[voice];

    if (!voiceId) {
      return Response.json(
        {
          error: `Voice "${voice}" is not configured on the server.`,
          code: "VOICE_NOT_CONFIGURED",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("ElevenLabs API error:", {
        status: response.status,
        body: errorText,
      });

      return Response.json(
        {
          error:
            "Voice generation failed. The text-to-speech provider could not complete this request.",
          code: "ELEVENLABS_ERROR",
        },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    await writeFile(cacheFilePath, Buffer.from(audioBuffer));

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline; filename=ai-voice-studio.mp3",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("generate-voice error:", error);

    return Response.json(
      {
        error: "Something went wrong while generating voice.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
