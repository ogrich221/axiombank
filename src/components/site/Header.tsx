import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const nav = [
  { label: "Personal Banking", href: "/#features" },
  { label: "Savings", href: "/#preview" },
  { label: "Cards", href: "/#features" },
  { label: "About Us", href: "/#about" },
  { label: "Help & Support", href: "/#faq" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm font-medium text-muted-foreground">
            {nav.map((n) => (
              <li key={n.label}>
                <a href={n.href} className="transition-colors hover:text-navy">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden rounded-full text-navy sm:inline-flex" asChild>
            <a href="/#login">Log In</a>
          </Button>
          <Button variant="hero" className="h-10 px-4 font-semibold" asChild>
            <Link to="/open-account">Open an Account</Link>
          </Button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-navy hover:bg-secondary lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t border-border bg-background lg:hidden">
          <ul className="container-x flex flex-col py-3">
            {nav.map((n) => (
              <li key={n.label}>
                <a href={n.href} onClick={() => setOpen(false)} className="flex h-12 items-center text-base font-medium text-navy">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/#login" onClick={() => setOpen(false)} className="flex h-12 items-center text-base font-medium text-muted-foreground">
                Log In
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
