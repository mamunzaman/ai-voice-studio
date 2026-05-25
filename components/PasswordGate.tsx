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
          password: password.trim(),
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
    <div className="relative flex min-h-screen w-full flex-col text-white">
      <PremiumBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-5 sm:px-6">
        <AppNavbar compact />

        <div className="flex flex-1 flex-col justify-center py-6 sm:py-8">
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-[1.65rem]">
              <span className="text-gradient-hero">Unlock Demo</span>
            </h1>
            <p className="mt-2 text-sm text-white/45">
              Password and verification required
            </p>
          </div>

          <div className="card-shell rounded-2xl p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="demo-password"
                  className="mb-1.5 block text-xs font-medium text-white/70"
                >
                  Demo password
                </label>
                <input
                  id="demo-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="off"
                  className="input-field w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30"
                  placeholder="Enter password"
                />
              </div>

              <div className="relative z-20 flex justify-center overflow-visible py-0.5">
                <TurnstileWidget
                  key={turnstileKey}
                  onTokenChange={handleTurnstileToken}
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200/90">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canUnlock || isSubmitting}
                className="btn-gradient w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 disabled:cursor-not-allowed disabled:opacity-45"
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
