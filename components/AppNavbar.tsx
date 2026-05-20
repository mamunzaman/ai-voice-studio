export default function AppNavbar() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-[0_0_28px_rgba(99,102,241,0.45)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 text-white"
            aria-hidden
          >
            <path
              d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M6 11.5c0 3.038 2.686 5.5 6 5.5s6-2.462 6-5.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M12 17v4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-white">
            AI Voice Studio
          </p>
          <p className="text-xs text-white/45">German AI voice generation</p>
        </div>
      </div>

      <div className="flex w-fit items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-100/90 backdrop-blur-md">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-orange-300"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2l7 4v6c0 4.2-2.9 7.9-7 9-4.1-1.1-7-4.8-7-9V6l7-4Z" />
        </svg>
        Protected by Cloudflare Turnstile
      </div>
    </header>
  );
}
