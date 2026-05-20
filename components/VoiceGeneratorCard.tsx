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
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isOverLimit = text.length > MAX_CHARACTERS;
  const canGenerate = !isOverLimit;

  return (
    <section className="animate-fade-in-up-delayed-2 mx-auto mt-10 w-full max-w-3xl sm:mt-12 md:mt-14">
      <div className="overflow-visible rounded-[28px] bg-gradient-to-b from-white/[0.1] to-white/[0.02] p-px shadow-[0_24px_80px_-28px_rgba(0,0,0,0.9)]">
        <div className="rounded-[27px] bg-[#0a0a0c]/92 p-5 sm:p-7 md:p-8">
          <div className="mb-8 flex items-start justify-between gap-4 border-b border-white/[0.05] pb-6">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-white/25 uppercase">
                Studio
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Create your voice
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/45">
                Write your script, choose a German voice, and generate studio-ready
                speech in seconds.
              </p>
            </div>

            <span className="hidden shrink-0 rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-3 py-1 text-xs font-medium text-cyan-300/90 md:inline-flex">
              MVP
            </span>
          </div>

          <div className="space-y-8">
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="w-5 shrink-0 font-mono text-[10px] tabular-nums text-white/30">
                  01
                </span>
                <label className="text-sm font-medium text-white/80">
                  Your text
                </label>
              </div>

              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="min-h-40 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/50 p-4 text-sm leading-relaxed text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-white/25 focus:border-cyan-400/35 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.2),inset_0_1px_0_rgba(255,255,255,0.04)] focus:ring-1 focus:ring-cyan-400/20 md:min-h-48"
                placeholder="Schreiben Sie Ihren Text — or write in any language you need spoken aloud..."
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/35">
                <span>Maximum {MAX_CHARACTERS} characters</span>
                <span
                  className={`font-mono ${isOverLimit ? "text-amber-200/80" : "text-white/45"}`}
                >
                  {text.length} / {MAX_CHARACTERS}
                </span>
              </div>

              {isOverLimit && (
                <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100/80">
                  Demo version limit reached — this public portfolio demo is
                  currently limited to {MAX_CHARACTERS} characters per
                  generation.
                </div>
              )}

              <div className="mt-3 space-y-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
                <p className="text-xs text-cyan-300/70">
                  Estimated usage:{" "}
                  <span className="font-mono text-cyan-200/80">{text.length}</span>{" "}
                  credits
                </p>

                {remainingCredits !== null && creditLimit !== null && (
                  <p className="text-xs text-white/40">
                    Live balance:{" "}
                    <span className="font-mono text-white/55">
                      {remainingCredits} / {creditLimit}
                    </span>{" "}
                    credits
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="w-5 shrink-0 font-mono text-[10px] tabular-nums text-white/30">
                  02
                </span>
                <label className="text-sm font-medium text-white/80">
                  Voice
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {VOICE_OPTIONS.map((voiceOption) => {
                  const isSelected = voice === voiceOption.id;

                  return (
                    <button
                      key={voiceOption.id}
                      type="button"
                      onClick={() => setVoice(voiceOption.id)}
                      className={`group rounded-2xl border p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/35 ${
                        isSelected
                          ? "border-cyan-400/40 bg-cyan-400/[0.07] ring-1 ring-cyan-400/25"
                          : "border-white/[0.08] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <span className="text-2xl">🇩🇪</span>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${
                            isSelected
                              ? "bg-cyan-300/15 text-cyan-200"
                              : "bg-white/5 text-white/40"
                          }`}
                        >
                          {isSelected ? "Selected" : "Voice"}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-white">
                        {voiceOption.label}
                      </h3>

                      <p className="mt-1 text-xs text-white/45">
                        {voiceOption.accent}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {voiceOption.traits.map((trait) => (
                          <span
                            key={trait}
                            className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-white/45"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/15 border-l-2 border-l-red-400/90 bg-red-500/[0.06] px-4 py-3 text-sm leading-relaxed text-red-200/90">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading || !canGenerate}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-6 py-4 text-sm font-semibold tracking-tight text-black shadow-[0_0_32px_-10px_rgba(34,211,238,0.5)] transition hover:from-cyan-300 hover:to-cyan-200 hover:shadow-[0_0_40px_-8px_rgba(34,211,238,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
              >
                {isLoading ? "Synthesizing..." : "Generate speech"}
              </button>
            </div>

            {audioUrl && (
              <div className="space-y-3 pt-2">
                <div className="flex items-baseline gap-3">
                  <span className="w-5 shrink-0 font-mono text-[10px] tabular-nums text-white/30">
                    03
                  </span>
                  <p className="text-sm font-medium text-white/80">
                    Generated audio
                  </p>
                </div>

                <AudioPlayerCard audioUrl={audioUrl} />

                {cacheStatus && (
                  <p className="text-center text-xs leading-relaxed text-white/38">
                    {cacheStatus === "HIT"
                      ? "Loaded from cache — no new credits used."
                      : "Generated with ElevenLabs — credits used."}
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
