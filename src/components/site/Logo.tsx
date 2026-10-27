import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="AXIOM BANK home">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-navy" />
        <path d="M9 24L16 7.5L23 24" fill="none" className="stroke-navy-foreground" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.6 18h8.8" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className="text-lg font-extrabold tracking-[0.08em] text-navy">AXIOM</span>
        <span className="hidden text-[0.62rem] font-semibold tracking-[0.3em] text-muted-foreground sm:inline">BANK</span>
      </span>
    </Link>
  );
}
