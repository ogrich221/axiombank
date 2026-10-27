import { Logo } from "./Logo";

const cols = [
  { title: "Personal Banking", links: ["Accounts", "Savings", "Cards", "Spending Insights"] },
  { title: "Company", links: ["About VARENTA", "Our Approach", "Careers", "Contact"] },
  { title: "Support", links: ["Help Center", "Frequently Asked Questions", "Security", "Accessibility"] },
  { title: "Legal", links: ["Privacy Policy", "Terms and Conditions", "Fee Schedule", "Cookie Preferences", "Regulatory Disclosures"] },
];

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
              {c.links.map((l) => (
                <li key={l}>
                  <a href={l === "Fee Schedule" ? "/#faq" : l === "Security" ? "/#security" : l === "Savings" || l === "Spending Insights" ? "/#preview" : l.startsWith("About") || l === "Our Approach" ? "/#about" : "/#faq"} className="hover:text-navy">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x border-t border-border py-6 text-xs leading-relaxed text-muted-foreground">
        <p>© {new Date().getFullYear()} VARENTA BANK, N.A. · 1200 Liberty Avenue, Suite 400, New York, NY 10001, USA · NMLS ID #2489105</p>
        <p className="mt-2">Member FDIC. Equal Housing Lender. Deposits are FDIC-insured up to $250,000 per depositor, for each account ownership category. Support: +1 (800) 555-0199 · support@varentabank.com</p>
      </div>
    </footer>
  );
}
