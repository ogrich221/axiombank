import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Receipt, Activity, SlidersHorizontal, Wallet, PiggyBank, CreditCard, PieChart,
  ShieldCheck, Lock, Eye, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HeroDashboard } from "@/components/site/HeroDashboard";
import { BankingPreview } from "@/components/site/BankingPreview";
import lifestyle from "@/assets/lifestyle.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VARENTA BANK — Transparent by Design" },
      { name: "description", content: "Modern digital banking with clear fees, real-time clarity and tools that put you in control." },
      { property: "og:title", content: "VARENTA BANK — Transparent by Design" },
      { property: "og:description", content: "Clear fees, real-time clarity and banking built around you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const promises = [
  { n: "01", icon: Receipt, t: "Clear Fees", d: "Know what you pay before you commit. We make account charges, card fees, and applicable conditions easy to find and understand." },
  { n: "02", icon: Activity, t: "Real-Time Clarity", d: "See your transactions, monitor your spending, and understand your available balance in one intuitive place." },
  { n: "03", icon: SlidersHorizontal, t: "Your Money, Your Control", d: "Manage your account, review your activity, and make informed financial decisions with tools designed around your everyday life." },
];
const features = [
  { icon: Wallet, t: "Everyday Banking", d: "Manage daily expenses, receive money, and keep track of your transactions in one place." },
  { icon: PiggyBank, t: "Smart Savings", d: "Set savings goals, monitor your progress, and build better financial habits at your own pace." },
  { icon: CreditCard, t: "Cards That Work for You", d: "Manage your card, review transactions, and access available card controls directly from your banking experience." },
  { icon: PieChart, t: "Spending Insights", d: "Understand your spending patterns with intuitive summaries, helpful categories, and clear visual reports." },
];
const pillars = [
  { icon: Lock, t: "Security by Design", d: "Details of our account security measures, sign-in and authentication methods will be published here as they are confirmed.", link: "Security information" },
  { icon: Eye, t: "Privacy With Purpose", d: "We explain in plain language what information we collect, why we use it, and how it is protected.", link: "Privacy policy" },
  { icon: ShieldCheck, t: "Transparency at Every Step", d: "Important account terms, applicable charges and product conditions are easy to find and review.", link: "Account terms" },
];
const faqs = [
  ["What makes VARENTA BANK different?", "We put clarity first: fees, balances and account conditions are shown plainly, so you always know where you stand."],
  ["Are there monthly account fees?", "Our fee schedule is being finalised. Every applicable charge will be listed in the Fee Schedule before you open an account."],
  ["How do I open an account?", "Start your application online, complete the identity checks, and begin banking once your application is approved."],
  ["How can I manage my card?", "Card management tools will be available in the VARENTA BANK app. The exact list of card controls is to be confirmed."],
  ["How does VARENTA BANK protect my information?", "Our Privacy Policy explains how information is collected, used and protected. Specific security measures will be detailed on our Security page."],
  ["What happens if I need help with my account?", "Our Help Center will be your first stop. Support channels and hours are to be confirmed."],
  ["Which countries or regions can open an account?", "Eligible countries and regions are still being confirmed and will be published before launch."],
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
        <section className="bg-hero">
          <div className="container-x grid items-center gap-14 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
            <div className="reveal">
              <p className="eyebrow">Banking, made clear.</p>
              <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[1.02] text-navy">
                Your Money. Your Clarity. <span className="text-primary">Your Future.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Meet a better way to bank. See where your money goes, understand what you pay, and manage your finances with confidence. No unnecessary complexity. Just banking designed around you.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/open-account">Open Your Account <ArrowRight /></Link>
                </Button>
                <Button variant="quiet" size="xl" asChild>
                  <a href="#features">Explore Our Banking</a>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">Simple to understand. Secure by design. Built around you.</p>
            </div>
            <div className="reveal [animation-delay:150ms]">
              <HeroDashboard />
            </div>
          </div>
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
                  <a href="#preview" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
                    Explore feature <ArrowRight className="size-4" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Preview */}
        <section id="preview" className="section-y">
          <div className="container-x">
            <SectionHead eyebrow="Try it" title="See Your Money More Clearly." body="Switch periods and tap a category to see how VARENTA makes your spending easy to understand." />
            <div className="mx-auto mt-12 max-w-5xl"><BankingPreview /></div>
          </div>
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
                  <a href="#" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">{p.link} <ArrowRight className="size-4" /></a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Human */}
        <section className="section-y">
          <div className="container-x grid items-center gap-12 lg:grid-cols-2">
            <img src={lifestyle} alt="A couple reviewing their finances together at the kitchen table" loading="lazy" width={1280} height={960} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift" />
            <div>
              <p className="eyebrow">Made for real life</p>
              <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.08] text-navy">Money Is Personal. Banking Should Be Too.</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Your goals are your own. Whether you're building your savings, managing everyday expenses, or planning what's next, VARENTA BANK helps you move forward with greater confidence.</p>
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
            <div className="relative overflow-hidden rounded-[2rem] bg-mint px-6 py-16 text-center sm:px-12 md:py-20">
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 220 Q 200 140 400 200 T 800 160" fill="none" className="stroke-primary/25" strokeWidth="1.5" />
                <path d="M0 250 Q 220 180 420 230 T 800 200" fill="none" className="stroke-primary/15" strokeWidth="1.5" />
              </svg>
              <div className="relative">
                <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight text-navy">Feel Good About Your Money.</h2>
                <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">Clearer information. More confident decisions. Banking built around you.</p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button variant="hero" size="xl" asChild><Link to="/open-account">Open Your Account</Link></Button>
                  <Button variant="quiet" size="xl" asChild><a href="#about">Discover VARENTA</a></Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
