import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Receipt, Activity, SlidersHorizontal, Wallet, PiggyBank, CreditCard, PieChart,
  ShieldCheck, Lock, Eye, ChevronDown, Globe2, Mail,
} from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_MAILTO, SUPPORT_PHONE, SUPPORT_PHONE_TEL } from "@/lib/contact";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RotatingCard } from "@/components/site/RotatingCard";
import earthGlobe from "@/assets/earth-globe.jpg";
import heroBuilding from "@/assets/axiom-hero-building.jpg.asset.json";
import heroSigning from "@/assets/axiom-hero-signing.jpg.asset.json";
import reception from "@/assets/axiom-reception-hero.jpg.asset.json";
import counter from "@/assets/axiom-counter-hero.jpg.asset.json";
import branchDesk from "@/assets/axiom-branch-operations.jpg.asset.json";
import branchPhoto from "@/assets/axiom-branch-portrait.jpg.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AXIOM BANK — Transparent by Design" },
      { name: "description", content: "Modern digital banking with clear fees, real-time clarity and tools that put you in control." },
      { property: "og:title", content: "AXIOM BANK — Transparent by Design" },
      { property: "og:description", content: "Clear fees, real-time clarity and banking built around you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const countries = ["United States", "Canada", "Mexico", "United Kingdom", "Ireland", "France", "Germany", "Spain", "Portugal", "Italy", "Netherlands", "Belgium", "Luxembourg", "Switzerland", "Austria", "Denmark", "Sweden", "Norway", "Finland", "Iceland", "Poland", "Czechia", "Slovakia", "Hungary", "Slovenia", "Croatia", "Estonia", "Latvia", "Lithuania", "Greece", "Cyprus", "Malta", "Romania", "Bulgaria", "Japan", "South Korea", "Singapore", "Hong Kong", "Taiwan", "Australia", "New Zealand", "United Arab Emirates", "Qatar", "Saudi Arabia", "Israel", "India", "Malaysia", "Brazil", "Chile", "Argentina", "Colombia", "Peru", "Uruguay", "Costa Rica"];
const countryCodes = ["US", "CA", "MX", "UK", "IE", "FR", "DE", "ES", "PT", "IT", "NL", "BE", "LU", "CH", "AT", "DK", "SE", "NO", "FI", "IS", "PL", "CZ", "SK", "HU", "SI", "HR", "EE", "LV", "LT", "GR", "CY", "MT", "RO", "BG", "JP", "KR", "SG", "HK", "TW", "AU", "NZ", "AE", "QA", "SA", "IL", "IN", "MY", "BR", "CL", "AR", "CO", "PE", "UY", "CR"];
const promises = [
  { n: "01", icon: Receipt, t: "Clear Fees", d: "Know what you pay before you commit. We make account charges, card fees, and applicable conditions easy to find and understand." },
  { n: "02", icon: Activity, t: "Real-Time Clarity", d: "See your transactions, monitor your spending, and understand your available balance in one intuitive place." },
  { n: "03", icon: SlidersHorizontal, t: "Your Money, Your Control", d: "Manage your account, review your activity, and make informed financial decisions with tools designed around your everyday life." },
];
const features = [
  { icon: Wallet, t: "Everyday Banking", d: "Manage daily expenses, receive money, and keep track of your transactions in one place.", to: "/personal-banking" },
  { icon: PiggyBank, t: "Smart Savings", d: "Set savings goals, monitor your progress, and build better financial habits at your own pace.", to: "/savings" },
  { icon: CreditCard, t: "Cards That Work for You", d: "Manage your card, review transactions, and access available card controls directly from your banking experience.", to: "/cards" },
  { icon: PieChart, t: "Spending Insights", d: "Understand your spending patterns with intuitive summaries, helpful categories, and clear visual reports.", to: "/spending-insights" },
] as const;
const pillars = [
  { icon: Lock, t: "Security by Design", d: "256-bit TLS encryption, two-factor sign-in, biometric login, real-time fraud alerts and instant card freezing.", link: "Security information" },
  { icon: Eye, t: "Privacy With Purpose", d: "We never sell your personal data. We collect only what we need to run your account and meet legal requirements, and you can download or delete your data anytime.", link: "Privacy policy" },
  { icon: ShieldCheck, t: "Transparency at Every Step", d: "Every fee is listed in one simple schedule, shown before you confirm any transaction. We give you 30 days' notice before any change to your terms.", link: "Account terms" },
];
const faqs = [
  ["What makes AXIOM BANK different?", "We put clarity first: no monthly fees, no overdraft fees, and every charge is shown before you confirm a transaction."],
  ["Are there monthly account fees?", "No. The Everyday Account has a $0 monthly fee and no minimum balance. Full pricing is available on request from our support team."],
  ["How do I open an account?", "Apply online in about 10 minutes: enter your details, verify your identity with a government ID and a selfie, then start banking once approved — usually within 1 business day."],
  ["How can I manage my card?", "In the AXIOM app you can freeze and unfreeze your card, set spending limits, change your PIN, block online or international payments, and order a replacement."],
  ["How does AXIOM BANK protect my information?", "We use encryption in transit and at rest, two-factor authentication, biometric login and 24/7 fraud monitoring. We never sell your data."],
  ["What happens if I need help with my account?", `Our support team is available 24/7 via in-app chat, by phone at ${SUPPORT_PHONE}, or by email at ${SUPPORT_EMAIL}.`],
  ["Which countries or regions can open an account?", "Residents of 54 countries across North America, South America, Europe, Asia and Oceania can apply. Residents of African countries are not currently eligible. See the globe above for the full list."],
];

function SectionHead({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.08] text-navy">{title}</h2>
      {body && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <img src={heroBuilding.url} alt="AXIOM BANK headquarters building" width={1920} height={1088} className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_center]" />
          <div className="bg-hero-overlay absolute inset-0 -z-10" aria-hidden="true" />
          <div className="container-x flex min-h-[78vh] items-center py-20 md:min-h-[86vh]">
            <div className="reveal max-w-2xl text-navy-foreground">
              <div className="flex items-center gap-3" aria-label="AXIOM BANK">
                <svg width="44" height="44" viewBox="0 0 32 32" aria-hidden="true" className="drop-shadow-lg">
                  <rect width="32" height="32" rx="9" className="fill-navy-foreground" />
                  <path d="M11.6 18h8.8" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" />
                  <path d="M9 24L16 7.5L23 24" fill="none" className="stroke-navy" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="flex flex-col leading-none">
                  <span className="text-2xl font-extrabold tracking-[0.08em]">AXIOM</span>
                  <span className="mt-1 text-[0.65rem] font-semibold tracking-[0.42em] text-navy-foreground/80">BANK</span>
                </span>
              </div>
              <p className="eyebrow mt-8 text-navy-foreground/90"><span className="mr-2 tracking-normal text-primary" aria-label="5 stars">★★★★★</span>Banking, made clear.</p>
              <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[1.02]">
                Your Money. Your Clarity. <span className="text-primary [text-shadow:0_2px_20px_oklch(1_0_0/25%)]">Your Future.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-foreground/85">
                Meet a better way to bank. See where your money goes, understand what you pay, and manage your finances with confidence. No unnecessary complexity. Just banking designed around you.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/open-account">Open Your Account <ArrowRight /></Link>
                </Button>
                <Button variant="quiet" size="xl" asChild>
                  <Link to="/personal-banking">Explore Our Banking</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-navy-foreground/80">Simple to understand. Secure by design. Built around you. · Available in 54 countries.</p>
            </div>
          </div>
          <div className="flag-stripes h-1.5" aria-hidden="true" />
        </section>

        {/* Transparency */}
        <section id="about" className="section-y">
          <div className="container-x">
            <SectionHead eyebrow="Our promise" title="Banking Should Never Feel Like a Guess." body="We believe you deserve to know exactly what happens to your money. That means clearer fees, understandable information, and fewer unpleasant surprises." />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {promises.map((p) => (
                <article key={p.n} className="group rounded-3xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><p.icon className="size-5" strokeWidth={1.75} /></span>
                    <span className="text-sm font-bold text-muted-foreground/60">{p.n}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-navy">{p.t}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{p.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section-y bg-secondary">
          <div className="container-x">
            <SectionHead eyebrow="Features" title="Everything You Need. Nothing You Don't." body="From everyday spending to long-term savings, enjoy banking tools that work together seamlessly." />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {features.map((f) => (
                <article key={f.t} className="flex flex-col rounded-3xl bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-navy text-navy-foreground"><f.icon className="size-5" strokeWidth={1.75} /></span>
                  <h3 className="mt-6 text-lg font-bold text-navy">{f.t}</h3>
                  <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted-foreground">{f.d}</p>
                  <Link to={f.to} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
                    Learn more <ArrowRight className="size-4" />

                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="debit-card" className="section-y bg-secondary">
          <div className="container-x">
            <SectionHead eyebrow="AXIOM cards" title="AXIOM BANK Debit Card" />
            <div className="mx-auto mt-8 max-w-4xl">
              <RotatingCard />
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" asChild><Link to="/cards">Explore cards <ArrowRight className="size-4" /></Link></Button>
            </div>
          </div>
        </section>

        {/* Agreement band */}
        <section id="agreement" className="relative isolate overflow-hidden bg-navy">
          <img src={heroSigning.url} alt="Two clients signing AXIOM BANK account documents with an adviser beside them" loading="lazy" width={576} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_42%]" />
          <div className="bg-hero-overlay absolute inset-0 -z-10" aria-hidden="true" />
          <div className="container-x flex min-h-[64vh] items-center py-16 md:min-h-[72vh]">
            <div className="reveal max-w-xl text-navy-foreground">
              <p className="eyebrow text-navy-foreground/90">Sign with confidence</p>
              <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.08]">Everything in Writing. Nothing Hidden in the Fine Print.</h2>
              <p className="mt-5 text-lg leading-relaxed text-navy-foreground/85">
                From the moment you apply, you see the same information we do: what the account costs, what it earns, and what changes if anything does. No pressure, no small print, no surprises at the counter.
              </p>
              <ul className="mt-8 space-y-3">
                {["Fees shown before you confirm any transaction", "Account terms written in plain English", "30 days' notice before any change to your terms"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-navy-foreground/85">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/open-account">Open Your Account <ArrowRight /></Link>
                </Button>
                <Button variant="quiet" size="xl" asChild>
                  <Link to="/disclosures">Read the Disclosures</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="flag-stripes h-1.5" aria-hidden="true" />
        </section>

        {/* Trust */}
        <section id="security" className="section-y bg-navy text-navy-foreground">
          <div className="container-x">
            <div className="max-w-2xl">
              <p className="eyebrow">Trust & security</p>
              <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.08]">Your Trust Is Not a Feature. It's the Foundation.</h2>
              <p className="mt-4 text-lg leading-relaxed text-navy-foreground/70">Your financial life deserves thoughtful protection, clear communication, and control you can understand.</p>
            </div>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {pillars.map((p) => (
                <div key={p.t} className="border-t border-navy-foreground/15 pt-8">
                  <p.icon className="size-7 text-primary" strokeWidth={1.5} />
                  <h3 className="mt-5 text-xl font-bold">{p.t}</h3>
                  <p className="mt-3 leading-relaxed text-navy-foreground/70">{p.d}</p>
                  <Link to={p.link === "Security information" ? "/security" : p.link === "Privacy policy" ? "/privacy" : "/terms"} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">{p.link} <ArrowRight className="size-4" /></Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Human */}
        <section className="section-y">
          <div className="container-x grid items-center gap-12 lg:grid-cols-2">
            <img src={branchDesk.url} alt="A AXIOM BANK banker at a branch desk with account services on screen behind him" loading="lazy" width={1536} height={1024} className="aspect-[4/3] w-full rounded-3xl object-cover object-[50%_42%] shadow-lift" />
            <div>
              <p className="eyebrow">Made for real life</p>
              <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.08] text-navy">Money Is Personal. Banking Should Be Too.</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Your goals are your own. Whether you're building your savings, managing everyday expenses, or planning what's next, AXIOM BANK helps you move forward with greater confidence.</p>
              <Button variant="navy" size="xl" className="mt-8" asChild>
                <Link to="/open-account">Banking That Puts You First</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="section-y bg-secondary">
          <div className="container-x">
            <SectionHead eyebrow="Getting started" title="Your Next Chapter Starts Here." body="Get started with a straightforward account-opening experience designed to make every step clear." />
            <ol className="mt-14 grid gap-5 md:grid-cols-3">
              {[["Start Your Application", "Provide the required information."], ["Verify Your Identity", "Complete the applicable identity checks."], ["Start Banking", "Access your account once your application is approved."]].map(([t, d], i) => (
                <li key={t} className="rounded-3xl bg-card p-8 shadow-soft">
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{i + 1}</span>
                  <h3 className="mt-5 text-lg font-bold text-navy">{t}</h3>
                  <p className="mt-2 text-muted-foreground">{d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 text-center">
              <Button variant="hero" size="xl" asChild><Link to="/open-account">Open Your Account <ArrowRight /></Link></Button>
              <p className="mt-4 text-sm text-muted-foreground">Eligibility, verification, and approval requirements apply.</p>
            </div>
          </div>
        </section>

        {/* Eligibility globe */}
        <section id="eligibility" className="section-y overflow-hidden bg-navy text-navy-foreground">
          <div className="container-x text-center">
            <p className="eyebrow">Where we bank</p>
            <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.08]">Available in 54 countries.</h2>
            <p className="mx-auto mt-4 max-w-xl text-navy-foreground/70">Residents of these countries can apply. Residents of African countries are not currently eligible.</p>
            <div className="relative mx-auto mt-12 aspect-square w-full max-w-[640px]">
              <img src={earthGlobe} alt="Earth with blue oceans, green continents and white clouds" loading="lazy" width={1024} height={1024} className="earth-rotation absolute inset-0 h-full w-full rounded-full object-cover" />
              <svg viewBox="0 0 200 200" className="globe-spin absolute inset-0 h-full w-full" aria-hidden="true">
                <g fill="none" className="stroke-navy-foreground/15" strokeWidth="0.4">
                  {[20, 45, 70, 90].map((rx) => <ellipse key={rx} cx="100" cy="100" rx={rx} ry="99" />)}
                  {[-70, -40, 0, 40, 70].map((y) => { const r = Math.sqrt(99 * 99 - y * y); return <ellipse key={y} cx="100" cy={100 + y} rx={r} ry={r * 0.12} />; })}
                </g>
              </svg>
              <ul className="absolute inset-[8%] flex flex-col justify-center gap-[1.2%]" aria-label="Eligible countries">
                {[2, 4, 5, 6, 7, 7, 7, 6, 6, 4].reduce<{ rows: string[][]; i: number }>((acc, n) => { acc.rows.push(countries.slice(acc.i, acc.i + n)); acc.i += n; return acc; }, { rows: [], i: 0 }).rows.map((row, r) => (
                  <li key={r} className="flex flex-wrap justify-center gap-x-[1.5%] gap-y-1">
                    {row.map((c) => (
                      <span key={c} title={c} aria-label={c} className="earth-location inline-flex min-w-8 items-center justify-center gap-1 rounded-full border border-navy-foreground/25 bg-navy/80 px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap backdrop-blur-sm sm:min-w-12 sm:px-2 sm:text-xs">
                        <span className="earth-marker size-1 shrink-0 rounded-full bg-primary sm:size-1.5" aria-hidden="true" />
                        {countryCodes[countries.indexOf(c)]}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Reception band */}
        <section id="visit" className="relative isolate overflow-hidden bg-navy">
          <img src={reception.url} alt="A visitor signing in at a AXIOM BANK reception desk while a team member hands over a badge" loading="lazy" width={1400} height={939} className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_28%]" />
          <div className="bg-hero-overlay absolute inset-0 -z-10" aria-hidden="true" />
          <div className="container-x flex min-h-[58vh] items-center py-16 md:min-h-[66vh]">
            <div className="reveal max-w-xl text-navy-foreground">
              <div className="flex items-center gap-2.5" aria-label="AXIOM BANK">
                <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true" className="drop-shadow">
                  <rect width="32" height="32" rx="9" className="fill-navy-foreground" />
                  <path d="M11.6 18h8.8" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" />
                  <path d="M9 24L16 7.5L23 24" fill="none" className="stroke-navy" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="flex flex-col leading-none">
                  <span className="text-lg font-extrabold tracking-[0.08em]">AXIOM</span>
                  <span className="mt-1 text-[0.55rem] font-semibold tracking-[0.42em] text-navy-foreground/80">BANK</span>
                </span>
              </div>
              <p className="eyebrow mt-7 text-navy-foreground/90">Visit us</p>
              <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.08]">Walk In and See the Difference.</h2>
              <p className="mt-5 text-lg leading-relaxed text-navy-foreground/85">
                Prefer a face-to-face conversation? Our team will walk you through the account, the fees and the paperwork in plain language — then help you get started the same day.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/contact">Talk to Our Team <ArrowRight /></Link>
                </Button>
                <Button variant="quiet" size="xl" asChild>
                  <Link to="/open-account">Open Your Account</Link>
                </Button>
              </div>
              <div className="mt-8 border-t border-navy-foreground/25 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-foreground/70">Webmail</p>
                <a href={SUPPORT_MAILTO} className="mt-3 inline-flex max-w-full items-center gap-2.5 text-base font-semibold text-navy-foreground hover:text-primary sm:text-lg">
                  <Mail className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="break-all">{SUPPORT_EMAIL}</span>
                </a>
                <p className="mt-3 text-sm text-navy-foreground/70">
                  <a href={SUPPORT_PHONE_TEL} className="hover:text-primary">Call {SUPPORT_PHONE}</a>
                </p>
              </div>
            </div>
          </div>
          <div className="flag-stripes h-1.5" aria-hidden="true" />
        </section>

        {/* FAQ */}
        <section id="faq" className="section-y">
          <div className="container-x max-w-3xl">
            <SectionHead eyebrow="FAQ" title="Questions, answered clearly." />
            <div className="mt-12 divide-y divide-border border-y border-border">
              {faqs.map(([q, a]) => (
                <details key={q} className="group">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-navy [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-20">
          <div className="container-x">
            <div className="relative isolate overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12 md:py-28">
              <img src={counter.url} alt="A customer receiving a printed receipt at a AXIOM BANK counter after completing a transaction" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_50%]" />
              <div className="absolute inset-0 -z-10 bg-navy/82" aria-hidden="true" />
              <div className="relative flex flex-col items-center">
                <div className="flex items-center gap-2.5" aria-label="AXIOM BANK">
                  <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true" className="drop-shadow">
                    <rect width="32" height="32" rx="9" className="fill-navy-foreground" />
                    <path d="M11.6 18h8.8" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" />
                    <path d="M9 24L16 7.5L23 24" fill="none" className="stroke-navy" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="flex flex-col leading-none">
                    <span className="text-lg font-extrabold tracking-[0.08em] text-navy-foreground">AXIOM</span>
                    <span className="mt-1 text-[0.55rem] font-semibold tracking-[0.42em] text-navy-foreground/80">BANK</span>
                  </span>
                </div>
                <h2 className="mt-6 text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight text-navy-foreground">Feel Good About Your Money.</h2>
                <p className="mx-auto mt-4 max-w-lg text-lg text-navy-foreground/85">Clearer information. More confident decisions. Banking built around you.</p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button variant="hero" size="xl" asChild><Link to="/open-account">Open Your Account</Link></Button>
                  <Button variant="quiet" size="xl" asChild><Link to="/about">Discover AXIOM</Link></Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Branch band */}
        <section className="bg-navy text-navy-foreground">
          <div className="flag-stripes h-1.5" aria-hidden="true" />
          <div className="container-x py-16 md:py-24">
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="reveal order-2 md:order-1">
                <p className="eyebrow text-navy-foreground/90">Come in as you are</p>
                <h2 className="mt-3 text-[clamp(1.9rem,5vw,3.4rem)] font-extrabold leading-[1.06]">Better Banking. <span className="text-primary">Brighter Futures.</span></h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-navy-foreground/85">Every AXIOM branch is staffed by people who can walk you through your account, your card and your goals — in person, at your own pace.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button variant="hero" size="xl" asChild><Link to="/open-account">Open Your Account <ArrowRight /></Link></Button>
                  <Button variant="quiet" size="xl" asChild><Link to="/contact">Talk to Our Team</Link></Button>
                </div>
                <p className="mt-6 text-sm text-navy-foreground/75">Open 24/7 in the app · Support by phone <a href={SUPPORT_PHONE_TEL} className="hover:text-primary">{SUPPORT_PHONE}</a> · <a href={SUPPORT_MAILTO} className="break-all hover:text-primary">{SUPPORT_EMAIL}</a></p>
              </div>
              <div className="reveal order-1 md:order-2">
                <img src={branchPhoto.url} alt="A AXIOM BANK banker holding account documents inside a AXIOM BANK branch" loading="lazy" width={1305} height={1206} className="aspect-[1305/1206] w-full rounded-3xl border border-navy-foreground/15 object-cover shadow-lift" />
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
