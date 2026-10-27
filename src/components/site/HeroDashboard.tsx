import { ShoppingBag, Coffee, Train, ArrowDownLeft } from "lucide-react";

const tx = [
  { icon: ShoppingBag, name: "Greenleaf Market", cat: "Groceries", amt: "−$64.20" },
  { icon: Coffee, name: "Corner Café", cat: "Dining", amt: "−$5.80" },
  { icon: ArrowDownLeft, name: "Salary", cat: "Income", amt: "+$3,250.00", pos: true },
  { icon: Train, name: "Metro Transit", cat: "Transport", amt: "−$2.75" },
];
const week = [40, 65, 30, 80, 55, 90, 45];

export function HeroDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-mint" aria-hidden="true" />
      <div className="rounded-3xl border border-border bg-card p-5 shadow-lift sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Everyday Account</p>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">Sample data</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Available balance</p>
        <p className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">$8,412.36</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Spent this week</p>
            <p className="mt-1 text-lg font-bold text-navy">$412.90</p>
            <div className="mt-3 flex h-10 items-end gap-1" aria-hidden="true">
              {week.map((h, i) => (
                <span key={i} className={`flex-1 rounded-sm ${i === 5 ? "bg-primary" : "bg-primary/25"}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Holiday fund</p>
            <p className="mt-1 text-lg font-bold text-navy">68%</p>
            <div className="mt-4 h-2 rounded-full bg-background">
              <div className="h-2 w-[68%] rounded-full bg-primary" />
            </div>
            <p className="mt-2 text-[0.7rem] text-muted-foreground">$1,360 of $2,000</p>
          </div>
        </div>

        <ul className="mt-5 divide-y divide-border">
          {tx.map((t) => (
            <li key={t.name} className="flex items-center gap-3 py-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <t.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-navy">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.cat}</span>
              </span>
              <span className={`text-sm font-semibold ${t.pos ? "text-primary" : "text-navy"}`}>{t.amt}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-dashed border-primary/40 bg-accent px-4 py-3">
          <span className="text-xs font-medium text-accent-foreground">Fees charged this month</span>
          <span className="text-sm font-bold text-accent-foreground">$0.00</span>
        </div>
      </div>
    </div>
  );
}
