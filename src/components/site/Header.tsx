import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const languages = [
  ["en", "English"], ["es", "Español"], ["fr", "Français"], ["pt", "Português"], ["de", "Deutsch"], ["it", "Italiano"],
  ["nl", "Nederlands"], ["lb", "Lëtzebuergesch"], ["da", "Dansk"], ["sv", "Svenska"], ["no", "Norsk"], ["fi", "Suomi"],
  ["is", "Íslenska"], ["pl", "Polski"], ["cs", "Čeština"], ["sk", "Slovenčina"], ["hu", "Magyar"], ["sl", "Slovenščina"],
  ["hr", "Hrvatski"], ["et", "Eesti"], ["lv", "Latviešu"], ["lt", "Lietuvių"], ["el", "Ελληνικά"], ["mt", "Malti"],
  ["ro", "Română"], ["bg", "Български"], ["ja", "日本語"], ["ko", "한국어"], ["zh-Hant", "繁體中文"], ["ms", "Bahasa Melayu"],
  ["ta", "தமிழ்"], ["ar", "العربية"], ["he", "עברית"], ["hi", "हिन्दी"], ["rm", "Rumantsch"],
];

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
      <div className="container-x flex h-16 items-center justify-between gap-2 md:h-[72px]">
        <div className="flex items-center gap-2">
          <Logo />
          <label className="sr-only" htmlFor="lang">Language</label>
          <select id="lang" defaultValue="en" className="h-7 max-w-[4rem] cursor-pointer rounded-md border border-border bg-background px-1 text-[0.65rem] font-medium text-muted-foreground sm:max-w-[6.5rem]">
            {languages.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </div>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm font-medium text-muted-foreground">
            {nav.map((n) => (
              <li key={n.label}>
                <a href={n.href} className="transition-colors hover:text-navy">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="hidden rounded-full text-navy sm:inline-flex" asChild>
            <a href="/#login">Log In</a>
          </Button>
          <Button variant="hero" className="hidden h-10 px-3.5 text-[0.8rem] min-[400px]:inline-flex font-semibold sm:px-4 sm:text-sm" asChild>
            <Link to="/open-account"><span className="sm:hidden">Open Account</span><span className="hidden sm:inline">Open an Account</span></Link>
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
            <li>
              <Link to="/open-account" onClick={() => setOpen(false)} className="flex h-12 items-center text-base font-semibold text-primary">
                Open an Account
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
