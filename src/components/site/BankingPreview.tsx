import { useMemo, useState } from "react";

type Period = "week" | "month" | "year";
const data: Record<Period, { total: number; cats: { name: string; value: number }[] }> = {
  week: { total: 412.9, cats: [{ name: "Groceries", value: 148.4 }, { name: "Dining", value: 86.2 }, { name: "Transport", value: 38.5 }, { name: "Bills", value: 139.8 }] },
  month: { total: 2184.6, cats: [{ name: "Groceries", value: 612.3 }, { name: "Dining", value: 318.9 }, { name: "Transport", value: 164.4 }, { name: "Bills", value: 1089 }] },
  year: { total: 25890.1, cats: [{ name: "Groceries", value: 7210 }, { name: "Dining", value: 3740.5 }, { name: "Transport", value: 1980.6 }, { name: "Bills", value: 12959 }] },
};
const txs = [
  { name: "Greenleaf Market", cat: "Groceries", amt: 64.2, date: "Today" },
  { name: "Corner Café", cat: "Dining", amt: 5.8, date: "Today" },
  { name: "City Power Co.", cat: "Bills", amt: 89.0, date: "Yesterday" },
  { name: "Metro Transit", cat: "Transport", amt: 2.75, date: "Yesterday" },
  { name: "Noodle House", cat: "Dining", amt: 22.4, date: "Mon" },
  { name: "Fresh Fields", cat: "Groceries", amt: 41.15, date: "Sun" },
];
const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function BankingPreview() {
  const [period, setPeriod] = useState<Period>("week");
  const [cat, setCat] = useState<string | null>(null);
  const d = data[period];
  const max = Math.max(...d.cats.map((c) => c.value));
  const list = useMemo(() => (cat ? txs.filter((t) => t.cat === cat) : txs), [cat]);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">Demonstration only · fictional data</span>
        <div role="tablist" aria-label="Time period" className="inline-flex rounded-full bg-secondary p-1">
          {(["week", "month", "year"] as Period[]).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={`h-10 rounded-full px-4 text-sm font-semibold capitalize transition-all ${period === p ? "bg-background text-navy shadow-soft" : "text-muted-foreground hover:text-navy"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Total spent this {period}</p>
          <p key={period} className="reveal text-4xl font-extrabold tracking-tight text-navy">{fmt(d.total)}</p>
          <p className="mt-6 text-sm font-semibold text-navy">By category <span className="font-normal text-muted-foreground">— tap to filter</span></p>
          <ul className="mt-3 space-y-2">
            {d.cats.map((c) => {
              const active = cat === c.name;
              return (
                <li key={c.name}>
                  <button
                    onClick={() => setCat(active ? null : c.name)}
                    aria-pressed={active}
                    className={`w-full rounded-xl p-3 text-left transition-colors ${active ? "bg-accent" : "hover:bg-secondary"}`}
                  >
                    <span className="flex justify-between text-sm">
                      <span className="font-medium text-navy">{c.name}</span>
                      <span className="text-muted-foreground">{fmt(c.value)}</span>
                    </span>
                    <span className="mt-2 block h-2 rounded-full bg-secondary">
                      <span className="block h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${(c.value / max) * 100}%` }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy">Latest transactions{cat ? ` · ${cat}` : ""}</p>
            {cat && <button onClick={() => setCat(null)} className="text-sm font-semibold text-primary">Clear filter</button>}
          </div>
          <ul className="mt-3 divide-y divide-border">
            {list.map((t) => (
              <li key={t.name} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-navy">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.cat} · {t.date}</span>
                </span>
                <span className="text-sm font-semibold text-navy">−{fmt(t.amt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
