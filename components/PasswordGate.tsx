"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import AppNavbar from "@/components/AppNavbar";
import PremiumBackground from "@/components/PremiumBackground";
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
    <div className="relative min-h-screen w-full text-white">
      <PremiumBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <AppNavbar />

        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-gradient-hero">Unlock the Studio</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/50 sm:text-base">
              Enter the demo password and complete Cloudflare verification to
              access AI Voice Studio.
            </p>
          </div>

          <div className="glass-panel mt-8 w-full max-w-md rounded-3xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/25"
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
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200/90">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canUnlock || isSubmitting}
                className="btn-gradient w-full rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 disabled:cursor-not-allowed disabled:opacity-45"
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
