import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/open-account")({
  head: () => ({
    meta: [
      { title: "Open an Account — VARENTA BANK" },
      { name: "description", content: "Start your VARENTA BANK application in a few clear steps." },
      { property: "og:title", content: "Open an Account — VARENTA BANK" },
      { property: "og:description", content: "Start your application with a straightforward, transparent process." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OpenAccount,
});

type Errors = Partial<Record<"name" | "email" | "country", string>>;

function OpenAccount() {
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const country = String(f.get("country") || "").trim();
    const next: Errors = {};
    if (name.length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    if (!country) next.country = "Please tell us where you live.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  const field = "mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-navy outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-hero section-y">
        <div className="container-x max-w-xl">
          <p className="eyebrow">Account opening</p>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-tight text-navy">Let's get you started.</h1>
          <p className="mt-3 text-muted-foreground">Available to residents of 54 eligible countries, subject to verification and approval.</p>
          <p className="mt-5 border-l-4 border-primary bg-secondary p-4 text-sm leading-relaxed text-muted-foreground">Online applications are not connected yet. This form does not submit your details or send an email. Do not enter sensitive identity or banking information.</p>

          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            {done ? (
              <div className="text-center" role="status">
                <CheckCircle2 className="mx-auto size-12 text-primary" />
                <h2 className="mt-4 text-xl font-bold text-navy">Details checked.</h2>
                <p className="mt-2 text-muted-foreground">Your details have not been submitted. No account has been opened and no email has been sent. Contact the team for information about account availability.</p>
                <Button variant="hero" className="mt-6" asChild><Link to="/contact">Contact the Team</Link></Button>
                <Button variant="quiet" size="xl" className="mt-6" asChild><Link to="/">Back to home</Link></Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-5">
                {([["name", "Full name", "text", "name"], ["email", "Email address", "email", "email"], ["country", "Country of residence", "text", "country-name"]] as const).map(([id, label, type, ac]) => (
                  <div key={id}>
                    <label htmlFor={id} className="text-sm font-semibold text-navy">{label}</label>
                    <input id={id} name={id} type={type} autoComplete={ac} aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-err` : undefined} className={field} />
                    {errors[id] && <p id={`${id}-err`} className="mt-1.5 text-sm text-destructive">{errors[id]}</p>}
                  </div>
                ))}
                <Button type="submit" variant="hero" size="xl" className="w-full">Check Details</Button>
                <p className="text-center text-xs text-muted-foreground">Eligibility, verification, and approval requirements apply.</p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
