import AppNavbar from "@/components/AppNavbar";
import PasswordGate from "@/components/PasswordGate";
import PremiumBackground from "@/components/PremiumBackground";
import VoiceGeneratorCard from "@/components/VoiceGeneratorCard";

const FEATURES = [
  {
    title: "High Quality",
    description: "Studio-grade ElevenLabs voices",
  },
  {
    title: "Secure & Private",
    description: "Password + Turnstile protected",
  },
  {
    title: "Lightning Fast",
    description: "MP3 in seconds",
  },
];

export default function Home() {
  return (
    <PasswordGate>
      <main className="relative min-h-screen w-full text-white">
        <PremiumBackground />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
          <AppNavbar />

          <section className="mt-6 text-center sm:mt-7">
            <h1 className="text-[1.65rem] font-bold leading-tight tracking-tight sm:text-4xl">
              <span className="text-gradient-hero">Create Realistic AI Voices</span>
              <span className="text-white"> in Seconds</span>
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/50">
              Studio-quality German speech — Bavarian warmth and Hochdeutsch clarity
              for portfolio demos.
            </p>
          </section>

          <VoiceGeneratorCard />

          <footer className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="card-shell rounded-xl px-3.5 py-3 text-center sm:text-left"
              >
                <p className="text-xs font-semibold text-white/90">
                  {feature.title}
                </p>
                <p className="mt-0.5 text-[11px] text-white/42">
                  {feature.description}
                </p>
              </div>
            ))}
          </footer>
        </div>
      </main>
    </PasswordGate>
  );
}
