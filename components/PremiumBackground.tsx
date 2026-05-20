export default function PremiumBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030712]" />
      <div className="absolute inset-0 bg-vignette" />
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute -left-40 top-0 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.14)_0%,transparent_68%)] blur-3xl" />
      <div className="absolute -right-32 top-24 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_68%)] blur-3xl" />
    </div>
  );
}
