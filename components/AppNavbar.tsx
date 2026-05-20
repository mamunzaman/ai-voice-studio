type AppNavbarProps = {
  compact?: boolean;
};

export default function AppNavbar({ compact = false }: AppNavbarProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 text-white"
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
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-white sm:text-[15px]">
            AI Voice Studio
          </p>
          {!compact && (
            <p className="hidden text-[11px] text-white/40 sm:block">
              German AI voice generation
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-500/[0.08] px-2.5 py-1 text-[10px] font-medium text-orange-100/85 sm:px-3 sm:text-[11px]">
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3 text-orange-300 sm:h-3.5 sm:w-3.5"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2l7 4v6c0 4.2-2.9 7.9-7 9-4.1-1.1-7-4.8-7-9V6l7-4Z" />
        </svg>
        <span className="hidden xs:inline sm:inline">Cloudflare</span>
        <span className="sm:hidden">Protected</span>
        <span className="hidden md:inline">Turnstile</span>
      </div>
    </header>
  );
}
