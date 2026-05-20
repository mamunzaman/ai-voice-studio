"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import TurnstileWidget from "@/components/TurnstileWidget";

type DemoAuthContextValue = {
  demoPassword: string;
};

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function useDemoPassword() {
  return useContext(DemoAuthContext)?.demoPassword ?? "";
}

type PasswordGateProps = {
  children: ReactNode;
};

export default function PasswordGate({ children }: PasswordGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionPassword, setSessionPassword] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileKey((current) => current + 1);
  };

  const canUnlock = password.trim().length > 0 && !!turnstileToken;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!demoPassword) {
      setError("Demo password is not configured.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter the demo password.");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the CAPTCHA verification first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/verify-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Could not unlock demo. Please try again.");
        resetTurnstile();
        return;
      }

      setSessionPassword(password);
      setIsUnlocked(true);
    } catch {
      setError("Something went wrong. Please try again.");
      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUnlocked) {
    return (
      <DemoAuthContext.Provider value={{ demoPassword: sessionPassword }}>
        {children}
      </DemoAuthContext.Provider>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-vignette" />
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(34,211,238,0.09)_0%,transparent_68%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md overflow-visible rounded-[28px] bg-gradient-to-b from-white/[0.1] to-white/[0.02] p-px shadow-[0_24px_80px_-28px_rgba(0,0,0,0.9)]">
          <div className="rounded-[27px] bg-[#0a0a0c]/92 p-6 sm:p-8">
            <p className="text-[11px] font-medium tracking-[0.14em] text-white/45 uppercase">
              Portfolio demo
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              AI Voice Studio
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-white/45">
              Enter the demo password and complete verification to access this
              portfolio project.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="demo-password"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Demo password
                </label>

                <input
                  id="demo-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="off"
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/35 focus:ring-1 focus:ring-cyan-400/20"
                  placeholder="Enter password"
                />
              </div>

              <div className="relative z-20 flex w-full justify-center overflow-visible py-1">
                <TurnstileWidget
                  key={turnstileKey}
                  onTokenChange={handleTurnstileToken}
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-500/15 border-l-2 border-l-red-400/90 bg-red-500/[0.06] px-3 py-2 text-sm text-red-200/90">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canUnlock || isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-6 py-3.5 text-sm font-semibold tracking-tight text-black shadow-[0_0_32px_-10px_rgba(34,211,238,0.5)] transition hover:from-cyan-300 hover:to-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
              >
                {isSubmitting ? "Verifying..." : "Unlock demo"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
