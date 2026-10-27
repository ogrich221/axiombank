import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, ArrowLeft, LoaderCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/site/Logo';

export function Field({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return <label className="block text-sm font-medium"><span>{label}</span><input {...props} className="customer-field mt-2" aria-invalid={Boolean(error)} />{error && <span className="mt-1 block text-xs text-destructive">{error}</span>}</label>;
}
export function PasswordField({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const [visible, setVisible] = useState(false);
  return <label className="block text-sm font-medium"><span>{label}</span><span className="relative mt-2 block"><input {...props} type={visible ? 'text' : 'password'} className="customer-field pr-12" /><Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1 h-10 w-10" aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} title={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button></span></label>;
}
export function CustomerLoading() { return <div className="customer-theme flex min-h-[60vh] flex-col items-center justify-center gap-5 bg-background"><Logo /><p className="text-sm text-muted-foreground">Transparent by Design.</p><LoaderCircle className="size-7 animate-spin text-primary motion-reduce:animate-none" /><p className="text-sm">Preparing your banking workspace…</p></div>; }
export function WebsiteBack() { return <Button asChild variant="ghost" className="px-0"><Link to="/"><ArrowLeft />Back to website</Link></Button>; }