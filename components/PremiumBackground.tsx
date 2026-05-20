export default function PremiumBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030712]" />
      <div className="absolute inset-0 bg-vignette" />
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute -left-32 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18)_0%,transparent_70%)] blur-3xl" />
      <div className="absolute -right-24 top-20 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16)_0%,transparent_70%)] blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(99,102,241,0.12)_0%,transparent_65%)]" />
    </div>
  );
}
