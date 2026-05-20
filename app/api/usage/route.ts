export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "ElevenLabs API key is missing." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
      headers: {
        "xi-api-key": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      return Response.json(
        {
          error: "Failed to load ElevenLabs usage.",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const used = Number(data.character_count || 0);
    const limit = Number(data.character_limit || 0);
    const remaining = Math.max(limit - used, 0);

    return Response.json({
      used,
      limit,
      remaining,
      tier: data.tier,
      resetUnix: data.next_character_count_reset_unix,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong while loading usage." },
      { status: 500 }
    );
  }
}
