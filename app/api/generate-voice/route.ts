import crypto from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { VoiceOption } from "@/types/voice";

type VoiceId = VoiceOption["id"];

export async function POST(request: Request) {
  try {
    const demoPassword = request.headers.get("x-demo-password");

    if (!demoPassword || demoPassword !== process.env.DEMO_PASSWORD) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const text = String(body.text || "").trim();
    const voice = String(body.voice || "male_bavarian") as VoiceId;

    if (!text) {
      return Response.json(
        { error: "Text is required." },
        { status: 400 }
      );
    }

    const MAX_SERVER_CHARACTERS =
      Number(process.env.MAX_TEXT_LENGTH) || 5000;

    if (text.length > MAX_SERVER_CHARACTERS) {
      return Response.json(
        {
          error: `This public demo is currently limited to ${MAX_SERVER_CHARACTERS} characters per generation.`,
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
        { error: "ElevenLabs API key is missing." },
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

    const voiceId = voiceMap[voice] || voiceMap.male_bavarian;

    if (!voiceId) {
      return Response.json(
        { error: `ElevenLabs voice ID is missing for "${voice}".` },
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
          error: `Voice generation failed. ElevenLabs returned ${response.status}.`,
          details: errorText,
        },
        { status: response.status }
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
    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
