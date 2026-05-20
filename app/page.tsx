import PasswordGate from "@/components/PasswordGate";
import VoiceGeneratorCard from "@/components/VoiceGeneratorCard";

const HERO_PILLS = ["MP3 Export", "Live Credits", "Instant Generation"];

export default function Home() {
  return (
    <PasswordGate>
      <main className="relative min-h-screen w-full bg-[#050508] text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-vignette" />
          <div className="absolute inset-0 bg-noise" />
          <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(34,211,238,0.09)_0%,transparent_68%)]" />
          <div className="absolute -bottom-32 -right-24 hidden h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)] blur-3xl md:block" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <header className="mx-auto max-w-3xl text-center">
            <p className="animate-fade-in-up text-[11px] font-medium tracking-[0.14em] text-white/45 uppercase">
              Realistic German AI Voice
            </p>

            <h1 className="animate-fade-in-up-delayed mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem] lg:leading-[1.05]">
              Turn text into
              <br />
              <span className="text-white/90">human speech.</span>
            </h1>

            <p className="animate-fade-in-up-delayed-2 mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
              Studio-quality German AI voices with Bavarian warmth and Hochdeutsch
              clarity.
            </p>

            <ul className="animate-fade-in-up-delayed-2 mt-8 flex flex-wrap items-center justify-center gap-2 px-1">
              {HERO_PILLS.map((pill) => (
                <li
                  key={pill}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md transition hover:border-white/15 hover:bg-white/[0.07]"
                >
                  {pill}
                </li>
              ))}
            </ul>
          </header>

          <VoiceGeneratorCard />
        </div>
      </main>
    </PasswordGate>
  );
}
