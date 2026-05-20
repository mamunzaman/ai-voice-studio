"use client";

import { useEffect, useState } from "react";
import AudioPlayerCard from "@/components/AudioPlayerCard";
import { useDemoPassword } from "@/components/PasswordGate";
import { MAX_CHARACTERS, VOICE_OPTIONS } from "@/lib/constants";

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
    <section className="mx-auto mt-10 w-full max-w-6xl lg:mt-12">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="glass-panel rounded-3xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-white">
            1. Input Your Text
          </h2>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mt-4 min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/30 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/25 sm:min-h-40"
            placeholder="Enter the text you want to convert into realistic AI speech..."
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
            <span>Maximum {MAX_CHARACTERS} characters</span>
            <span
              className={`font-mono ${isOverLimit ? "text-amber-300" : "text-white/55"}`}
            >
              {text.length} / {MAX_CHARACTERS}
            </span>
          </div>

          {isOverLimit && (
            <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100/90">
              Demo limit: {MAX_CHARACTERS} characters per generation.
            </p>
          )}

          <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-xs text-white/45">
            <p>
              Estimated usage:{" "}
              <span className="font-mono text-blue-200/80">{text.length}</span>{" "}
              credits
            </p>
            {remainingCredits !== null && creditLimit !== null && (
              <p className="mt-1">
                Live balance:{" "}
                <span className="font-mono text-white/60">
                  {remainingCredits} / {creditLimit}
                </span>
              </p>
            )}
          </div>

          <h2 className="mt-8 text-base font-semibold text-white">
            2. Choose a Voice
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {VOICE_OPTIONS.map((voiceOption) => {
              const isSelected = voice === voiceOption.id;

              return (
                <button
                  key={voiceOption.id}
                  type="button"
                  onClick={() => setVoice(voiceOption.id)}
                  className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 ${
                    isSelected
                      ? "border-blue-400/50 bg-blue-500/10 ring-1 ring-blue-400/30"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xl">🇩🇪</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        isSelected
                          ? "bg-blue-400/20 text-blue-200"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {isSelected ? "Selected" : "Voice"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {voiceOption.label}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {voiceOption.accent}
                  </p>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200/90">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !canGenerate}
            className="btn-gradient mt-6 w-full rounded-2xl px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isLoading ? "Generating voice..." : "Generate Voice"}
          </button>
        </div>

        <div className="glass-panel flex min-h-[420px] flex-col rounded-3xl p-5 sm:min-h-[480px] sm:p-6">
          <h2 className="text-base font-semibold text-white">
            3. Generated Speech
          </h2>

          <div className="mt-4 flex flex-1 flex-col">
            {isLoading && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-12 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-blue-400" />
                <p className="mt-4 text-sm font-medium text-white/70">
                  Synthesizing your speech...
                </p>
                <p className="mt-1 text-xs text-white/40">
                  This may take a few seconds
                </p>
              </div>
            )}

            {!isLoading && !audioUrl && !error && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-7 w-7"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19V6l12-3v13M6 19h.01M18 19h.01"
                    />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-medium text-white/70">
                  Your generated audio will appear here
                </p>
                <p className="mt-1 max-w-xs text-xs text-white/40">
                  Enter text, choose a voice, and click Generate Voice
                </p>
              </div>
            )}

            {!isLoading && error && !audioUrl && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
                <p className="text-sm font-medium text-red-200/90">{error}</p>
                <p className="mt-2 text-xs text-white/40">
                  Fix the issue on the left and try again
                </p>
              </div>
            )}

            {!isLoading && audioUrl && (
              <div className="flex flex-1 flex-col gap-4">
                <AudioPlayerCard audioUrl={audioUrl} />
                <a
                  href={audioUrl}
                  download="ai-voice-studio.mp3"
                  className="btn-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
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
                  <p className="text-center text-xs text-white/40">
                    {cacheStatus === "HIT"
                      ? "Loaded from cache — no new credits used."
                      : "Fresh generation — credits used."}
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
