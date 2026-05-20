"use client";

import Script from "next/script";

export default function TurnstileScript() {
  return (
    <Script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      strategy="afterInteractive"
      onLoad={() => {
        window.dispatchEvent(new Event("turnstile-script-loaded"));
      }}
      onError={() => {
        window.dispatchEvent(new Event("turnstile-script-error"));
      }}
    />
  );
}
