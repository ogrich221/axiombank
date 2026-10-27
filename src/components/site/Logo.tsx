import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="VARENTA BANK home">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-navy" />
        <path d="M7 19h18" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M10 13.5l6 9 6-9" fill="none" className="stroke-navy-foreground" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className="text-lg font-extrabold tracking-[0.08em] text-navy">VARENTA</span>
        <span className="hidden text-[0.62rem] font-semibold tracking-[0.3em] text-muted-foreground sm:inline">BANK</span>
      </span>
    </Link>
  );
}
