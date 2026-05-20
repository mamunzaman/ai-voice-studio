import AppNavbar from "@/components/AppNavbar";
import PasswordGate from "@/components/PasswordGate";
import PremiumBackground from "@/components/PremiumBackground";
import VoiceGeneratorCard from "@/components/VoiceGeneratorCard";

const FEATURES = [
  {
    title: "High Quality",
    description: "Studio-grade German voices powered by ElevenLabs.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19V6l12-3v13M6 19h.01M18 19h.01"
      />
    ),
  },
  {
    title: "Secure & Private",
    description: "Password gate, Turnstile verification, and server-side keys.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 1 0-6 0v2c0 1.657 1.343 3 3 3Zm0 0v5m0 3h.01"
      />
    ),
  },
  {
    title: "Lightning Fast",
    description: "Generate speech in seconds with instant MP3 playback.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7Z"
      />
    ),
  },
];

export default function Home() {
  return (
    <PasswordGate>
      <main className="relative min-h-screen w-full text-white">
        <PremiumBackground />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <AppNavbar />

          <section className="mx-auto mt-10 max-w-4xl text-center sm:mt-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient-hero">
                Create Realistic AI Voices
              </span>
              <br />
              <span className="text-white">in Seconds</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
              Transform your text into studio-quality German speech with Bavarian
              warmth and Hochdeutsch clarity. Built for portfolio demos and
              professional presentations.
            </p>
          </section>

          <VoiceGeneratorCard />

          <section className="mt-10 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="glass-panel rounded-2xl p-5 transition hover:border-white/15"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  {feature.description}
                </p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </PasswordGate>
  );
}
