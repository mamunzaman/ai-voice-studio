"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
};

const RETRY_MS = 500;
const RETRY_MAX = 20;

const RENDER_OPTIONS = {
  theme: "light" as const,
  size: "normal" as const,
  appearance: "always" as const,
};

function getSiteKey() {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  if (!key || key === "your_site_key_here") return "";
  return key;
}

export default function TurnstileWidget({ onTokenChange }: TurnstileWidgetProps) {
  const siteKey = getSiteKey();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  onTokenChangeRef.current = onTokenChange;

  const [scriptError, setScriptError] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");
  const [renderError, setRenderError] = useState("");

  const setContainerNode = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);

  useEffect(() => {
    const handleError = () => setScriptError(true);

    window.addEventListener("turnstile-script-error", handleError);
    return () => {
      window.removeEventListener("turnstile-script-error", handleError);
    };
  }, []);

  useEffect(() => {
    if (!siteKey) return;

    let attempts = 0;

    const tryRender = () => {
      attempts += 1;

      if (!containerRef.current) return;

      if (typeof window.turnstile?.render !== "function") {
        setLoadMessage("Loading verification...");
        return;
      }

      setLoadMessage("");

      const container = containerRef.current;

      if (widgetIdRef.current && container.childElementCount > 0) {
        return;
      }

      if (widgetIdRef.current && container.childElementCount === 0) {
        try {
          window.turnstile?.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }

      setRenderError("");

      try {
        const id = window.turnstile.render(container, {
          sitekey: siteKey,
          ...RENDER_OPTIONS,
          callback: (token: string) => {
            setRenderError("");
            onTokenChangeRef.current(token);
          },
          "expired-callback": () => {
            onTokenChangeRef.current("");
            setRenderError("Verification expired. Please complete CAPTCHA again.");
          },
          "error-callback": () => {
            onTokenChangeRef.current("");
            setRenderError(
              "Verification failed. Refresh the page or check hostname settings."
            );
          },
        });

        widgetIdRef.current = id;

        if (!id) {
          setRenderError("CAPTCHA could not start. Refresh and try again.");
        }
      } catch (error) {
        onTokenChangeRef.current("");
        const message =
          error instanceof Error ? error.message : "Unknown render error";
        setRenderError(`CAPTCHA error: ${message}`);
      }
    };

    tryRender();
    const interval = window.setInterval(() => {
      if (attempts >= RETRY_MAX) {
        window.clearInterval(interval);
        if (!widgetIdRef.current) {
          setRenderError("CAPTCHA timed out loading. Refresh the page.");
        }
        return;
      }
      if (!widgetIdRef.current || containerRef.current?.childElementCount === 0) {
        tryRender();
      } else {
        window.clearInterval(interval);
      }
    }, RETRY_MS);

    return () => {
      window.clearInterval(interval);
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) {
    return (
      <p className="text-center text-xs text-amber-100/70">
        CAPTCHA is not configured. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY to
        .env.local and restart the dev server.
      </p>
    );
  }

  if (scriptError) {
    return (
      <p className="text-center text-xs text-red-200/80">
        CAPTCHA script failed to load. Check your connection or ad blocker.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div
        ref={setContainerNode}
        data-turnstile-container
        className="relative z-50 mx-auto flex min-h-[72px] w-full max-w-[300px] min-w-[260px] items-center justify-center overflow-visible sm:min-w-[300px]"
      />
      {loadMessage && (
        <p className="text-xs text-white/40">{loadMessage}</p>
      )}
      {renderError && (
        <p className="max-w-[300px] text-center text-xs text-red-200/80">
          {renderError}
        </p>
      )}
    </div>
  );
}
