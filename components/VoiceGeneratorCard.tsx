"use client";

import { useEffect, useState } from "react";
import AudioPlayerCard from "@/components/AudioPlayerCard";
import { useDemoPassword } from "@/components/PasswordGate";
import { MAX_CHARACTERS, VOICE_OPTIONS } from "@/lib/constants";

function SectionHeading({
  step,
  title,
}: {
  step: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="step-badge">{step}</span>
      <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
    </div>
  );
}

export default function VoiceGeneratorCard() {
  const demoPassword = useDemoPassword();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("male_bavarian");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [creditLimit, setCreditLimit] = useState<number | null>(null);
  const [cacheStatus, setCacheStatus] = useState<"HIT" | "MISS" | "">("");

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const response = await fetch("/api/usage");

        if (!response.ok) return;

        const data = await response.json();

        setRemainingCredits(data.remaining);
        setCreditLimit(data.limit);
      } catch {
        // Ignore usage loading errors for MVP
      }
    };

    loadUsage();
  }, []);

  const handleGenerate = async () => {
    setError("");
    setAudioUrl("");
    setCacheStatus("");

    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-demo-password": demoPassword || "",
        },
        body: JSON.stringify({
          text,
          voice,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Voice generation failed.");
        return;
      }

      const cacheHeader = response.headers.get("X-Cache");

      if (cacheHeader === "HIT" || cacheHeader === "MISS") {
        setCacheStatus(cacheHeader);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      setAudioUrl(url);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isOverLimit = text.length > MAX_CHARACTERS;
  const canGenerate = !isOverLimit;

  return (
    <section className="mt-6 w-full sm:mt-7">
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5 lg:items-stretch">
        <div className="card-shell flex flex-col rounded-2xl p-4 sm:p-5">
          <SectionHeading step="1" title="Input Your Text" />

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="input-field mt-3 min-h-[7.5rem] w-full resize-none rounded-xl p-3.5 text-sm leading-relaxed text-white placeholder:text-white/28 sm:min-h-32"
            placeholder="Enter text to convert into realistic AI speech..."
          />

          <div className="mt-2 flex items-center justify-between text-[11px] text-white/38">
            <span>Max {MAX_CHARACTERS} characters</span>
            <span
              className={`font-mono tabular-nums ${isOverLimit ? "text-amber-300" : ""}`}
            >
              {text.length}/{MAX_CHARACTERS}
            </span>
          </div>

          {isOverLimit && (
            <p className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-1.5 text-xs text-amber-100/90">
              Demo limit: {MAX_CHARACTERS} characters per generation.
            </p>
          )}

          {(remainingCredits !== null || text.length > 0) && (
            <p className="mt-2 text-[11px] text-white/40">
              Est. {text.length} credits
              {remainingCredits !== null && creditLimit !== null && (
                <>
                  {" "}
                  · Balance{" "}
                  <span className="font-mono text-white/55">
                    {remainingCredits}/{creditLimit}
                  </span>
                </>
              )}
            </p>
          )}

          <div className="mt-5">
            <SectionHeading step="2" title="Choose a Voice" />
          </div>

          <div className="mt-2.5 space-y-2">
            {VOICE_OPTIONS.map((voiceOption) => {
              const isSelected = voice === voiceOption.id;

              return (
                <button
                  key={voiceOption.id}
                  type="button"
                  onClick={() => setVoice(voiceOption.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 ${
                    isSelected
                      ? "border-blue-400/45 bg-blue-500/10 ring-1 ring-blue-400/25"
                      : "border-white/[0.08] bg-black/20 hover:border-white/15 hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="text-lg leading-none">🇩🇪</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {voiceOption.label}
                    </p>
                    <p className="text-[11px] text-white/42">
                      {voiceOption.accent}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="shrink-0 rounded-md bg-blue-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-200">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200/90">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !canGenerate}
            className="btn-gradient mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isLoading ? "Generating..." : "Generate Voice"}
          </button>
        </div>

        <div className="card-shell flex flex-col rounded-2xl p-4 sm:p-5">
          <SectionHeading step="3" title="Generated Speech" />

          <div className="mt-3 flex flex-1 flex-col justify-center">
            {isLoading && (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 bg-black/25 px-4 py-10 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-blue-400" />
                <p className="mt-3 text-sm text-white/65">Synthesizing...</p>
              </div>
            )}

            {!isLoading && !audioUrl && (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 bg-black/25 px-4 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19V6l12-3v13M6 19h.01M18 19h.01"
                    />
                  </svg>
                </div>
                <p className="mt-3 text-sm text-white/60">Audio preview</p>
                <p className="mt-1 text-[11px] text-white/38">
                  Generate voice to play and download MP3
                </p>
              </div>
            )}

            {!isLoading && audioUrl && (
              <div className="space-y-3">
                <AudioPlayerCard audioUrl={audioUrl} />
                <a
                  href={audioUrl}
                  download="ai-voice-studio.mp3"
                  className="btn-gradient flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"
                    />
                  </svg>
                  Download MP3
                </a>
                {cacheStatus && (
                  <p className="text-center text-[11px] text-white/38">
                    {cacheStatus === "HIT"
                      ? "From cache — no credits used"
                      : "New generation — credits used"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
