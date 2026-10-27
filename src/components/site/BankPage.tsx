import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ChevronDown, Mail, Phone, MapPin, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from './Header';
import { Footer } from './Footer';
import { bankPages, type BankPageKey, type BankPage as PageData } from '@/lib/bank-pages';
import building from '@/assets/axiom-hero-building.jpg.asset.json';
import desk from '@/assets/axiom-branch-operations.jpg.asset.json';
import { RotatingCard } from './RotatingCard';

export function BankPage({ pageKey }: { pageKey: BankPageKey }) {
  const page: PageData = bankPages[pageKey];
  const [search, setSearch] = useState('');
  const sections = page.sections.filter(section => page.kind !== 'help' || `${section.title} ${section.body}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="min-h-screen"><Header /><main>
    <section className={`relative isolate overflow-hidden ${page.image ? 'bg-navy text-navy-foreground' : 'bg-secondary text-navy'}`}>
      {page.image && <><img src={page.image === 'building' ? building.url : desk.url} alt={page.image === 'building' ? 'AXIOM BANK headquarters' : 'AXIOM BANK branch service desk'} className="absolute inset-0 -z-20 h-full w-full object-cover" /><div className="bg-hero-overlay absolute inset-0 -z-10" /></>}
      <div className="container-x py-12 md:py-20">
        <Link to="/" className={`text-sm ${page.image ? 'text-navy-foreground/80' : 'text-muted-foreground'} hover:underline`}>Home / {page.title}</Link>
        <p className="eyebrow mt-9">{page.category}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">{page.title}</h1>
        <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${page.image ? 'text-navy-foreground/85' : 'text-muted-foreground'}`}>{page.description}</p>
      </div><div className="flag-stripes h-1.5" aria-hidden="true" />
    </section>
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 md:py-16">
      <aside><p className="text-xs font-bold uppercase text-muted-foreground">On this page</p><nav aria-label="Page contents" className="mt-4 flex flex-col gap-3 text-sm">{page.sections.map((section, i) => <a key={section.title} href={`#section-${i}`} className="text-navy hover:text-primary">{section.title}</a>)}</nav><div className="mt-8 border-t border-border pt-6"><Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Talk to our team <ArrowRight className="size-4" /></Link></div></aside>
      <div className="min-w-0 max-w-3xl">
        {pageKey === 'cards' && <div className="mb-8"><RotatingCard /></div>}
        {page.kind === 'help' && <div className="relative mb-8"><Search className="absolute left-4 top-4 size-5 text-muted-foreground" /><input aria-label="Search help topics" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions or topics" className="h-14 w-full rounded-lg border border-input bg-background pl-12 pr-4 text-foreground" /></div>}
        {page.kind === 'contact' && <div className="mb-10 divide-y divide-border border-y border-border">{[{ icon: Mail, title: 'Email', value: 'support@axiombank.com', href: 'mailto:support@axiombank.com' }, { icon: Phone, title: 'Phone · proposed 24/7 support', value: '+1 (800) 555-0199', href: 'tel:+18005550199' }, { icon: MapPin, title: 'Proposed office address', value: '1200 Liberty Avenue, Suite 400, New York, NY 10001, USA' }].map(item => <div key={item.title} className="flex gap-4 py-5"><item.icon className="mt-1 size-5 shrink-0 text-primary" /><div className="min-w-0"><h2 className="text-sm font-semibold text-navy">{item.title}</h2>{item.href ? <a href={item.href} className="mt-1 block break-words text-muted-foreground hover:text-primary">{item.value}</a> : <p className="mt-1 text-muted-foreground">{item.value}</p>}</div></div>)}</div>}
        {page.kind === 'fees' && <div className="mb-10 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-4 text-left font-semibold text-navy">Indicative fees · USD · subject to verification</caption><thead className="bg-navy text-navy-foreground"><tr><th scope="col" className="p-4">Service</th><th scope="col" className="p-4">Indicative fee</th></tr></thead><tbody className="divide-y divide-border">{[['Monthly account maintenance', '$0'], ['Minimum balance', 'None'], ['Overdraft fee', '$0'], ['International transfer', '0.5% · minimum $3 · maximum $25'], ['Foreign card transaction', '0%'], ['Out-of-network ATM withdrawal', '$2.50 + any operator charge']].map(([name, price]) => <tr key={name}><th scope="row" className="p-4 font-medium text-navy">{name}</th><td className="p-4 text-muted-foreground">{price}</td></tr>)}</tbody></table></div>}
        {page.kind === 'cookies' && <div className="mb-10 divide-y divide-border border-y border-border">{[['Essential', 'Always active'], ['Analytics', 'Off · not configured'], ['Advertising', 'Off · not configured']].map(([name, state]) => <div key={name} className="flex flex-wrap justify-between gap-3 py-5"><span className="font-semibold text-navy">{name}</span><span className="text-sm text-muted-foreground">{state}</span></div>)}</div>}
        {page.kind === 'login' && <div className="mb-8 flex items-start gap-4 border-l-4 border-primary bg-secondary p-5"><ShieldCheck className="size-6 shrink-0 text-primary" /><p className="text-sm leading-relaxed text-navy">Customer sign-in is not yet available. No credentials are collected on this page.</p></div>}
        {sections.length === 0 && <p role="status" className="py-8 text-muted-foreground">No topics match your search.</p>}
        {sections.map(section => { const i = page.sections.indexOf(section); return page.kind === 'help' ? <details key={section.title} id={`section-${i}`} className="group scroll-mt-24 border-b border-border"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-navy">{section.title}<ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" /></summary><p className="pb-6 leading-relaxed text-muted-foreground">{section.body}</p></details> : <section key={section.title} id={`section-${i}`} className="scroll-mt-24 border-b border-border py-7 first:pt-0"><h2 className="text-2xl font-bold text-navy">{section.title}</h2><p className="mt-4 leading-relaxed text-muted-foreground">{section.body}</p>{section.items && <ul className="mt-5 space-y-3">{section.items.map(item => <li key={item} className="flex items-start gap-3 text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul>}</section>; })}
        {page.draft && <p className="mt-6 text-xs leading-relaxed text-muted-foreground">Important information: product terms, pricing, contact details and regulatory status have not been verified. This website does not provide live banking services. <Link to="/disclosures" className="underline hover:text-primary">Read the regulatory disclosures.</Link></p>}
      </div>
    </div>
    <section className="bg-secondary"><div className="container-x flex flex-col justify-between gap-6 py-10 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-bold text-navy">Your next step, made clear.</h2><p className="mt-2 text-muted-foreground">Explore the essentials or talk to our team.</p></div><div className="flex flex-wrap gap-3"><Button variant="hero" asChild><Link to="/open-account">Open an Account <ArrowRight /></Link></Button><Button variant="outline" asChild><Link to="/help-center">Help Center</Link></Button></div></div></section>
  </main><Footer /></div>;
}
