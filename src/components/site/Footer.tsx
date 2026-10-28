import { Logo } from "./Logo";
import { Link } from "@tanstack/react-router";
import { SUPPORT_EMAIL, SUPPORT_MAILTO, SUPPORT_PHONE, SUPPORT_PHONE_TEL, OFFICE_ADDRESS } from "@/lib/contact";

const cols = [
  { title: "Personal Banking", links: [["Accounts", "/personal-banking"], ["Savings", "/savings"], ["Cards", "/cards"], ["Spending Insights", "/spending-insights"]] },
  { title: "Company", links: [["About AXIOM", "/about"], ["Our Approach", "/our-approach"], ["Careers", "/careers"], ["Contact", "/contact"]] },
  { title: "Support", links: [["Help Center", "/help-center"], ["Frequently Asked Questions", "/faq"], ["Security", "/security"], ["Accessibility", "/accessibility"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms and Conditions", "/terms"], ["Fee Schedule", "/fees"], ["Cookie Preferences", "/cookie-preferences"], ["Regulatory Disclosures", "/disclosures"]] },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">Transparent by Design.</p>
          <p className="mt-2 text-sm text-muted-foreground">Open 24/7 · Serving 54 countries</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold text-navy">{c.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {c.links.map(([l, to]) => (
                <li key={l}>
                  <Link to={to} className="hover:text-navy">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x border-t border-border py-6 text-xs leading-relaxed text-muted-foreground">
        <p>© {new Date().getFullYear()} AXIOM BANK · {OFFICE_ADDRESS}</p>
        <p className="mt-2">Support: <a href={SUPPORT_PHONE_TEL} className="hover:text-navy">{SUPPORT_PHONE}</a> · <a href={SUPPORT_MAILTO} className="break-all hover:text-navy">{SUPPORT_EMAIL}</a></p>
      </div>
    </footer>
  );
}
