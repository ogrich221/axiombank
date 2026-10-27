import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/site/Logo';
import { Button } from '@/components/ui/button';
import { Field, PasswordField, WebsiteBack } from './CustomerControls';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export function AuthPage({ recovery=false }: { recovery?: boolean }) {
  const [mode,setMode] = useState<'login'|'forgot'>(recovery?'forgot':'login'); const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [confirm,setConfirm] = useState(''); const [message,setMessage] = useState(''); const [error,setError] = useState(''); const [busy,setBusy] = useState(false); const navigate=useNavigate();
  async function submit(event: FormEvent) { event.preventDefault(); setError('');setMessage('');setBusy(true);
    try {
      if(recovery) {
        if(!new URLSearchParams(window.location.hash.slice(1)).get('type')?.includes('recovery')) throw new Error('Open the password reset link from your email to continue.');
        z.string().min(12,'Use at least 12 characters.').max(128).parse(password); if(password!==confirm) throw new Error('Passwords do not match.');
        const { error: updateError } = await supabase.auth.updateUser({password}); if(updateError) throw updateError;
        await supabase.auth.signOut(); setMessage('Password updated. You can now sign in.');setPassword('');setConfirm('');
      } else if(mode==='forgot') {
        z.string().email().max(255).parse(email); const {error:resetError}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`}); if(resetError) throw resetError;
        setMessage('If an account can receive a reset email, a link will be sent. Please check your inbox.');
      } else {
        z.string().email().max(255).parse(email); z.string().min(1).max(128).parse(password);
        const {error:signInError}=await supabase.auth.signInWithPassword({email,password}); if(signInError) throw new Error('Unable to sign in. Check your details and confirm your email.');
        const {data}=await supabase.auth.getUser(); if(!data.user) throw new Error('Your session could not be confirmed.');
        await navigate({to:'/dashboard'});
      }
    } catch(err) {setError(err instanceof z.ZodError?err.issues[0]?.message??'Check your details.':err instanceof Error?err.message:'Please try again.');} finally {setBusy(false);}
  }
  return <div className="customer-theme min-h-screen bg-background"><header className="mx-auto flex max-w-6xl items-center justify-between border-b border-border p-5"><Logo /><Button asChild variant="ghost"><Link to="/open-account">Open an account<ArrowRight/></Link></Button></header><main className="mx-auto max-w-6xl px-5 py-8"><WebsiteBack/><div className="mx-auto max-w-md py-12"><ShieldCheck className="mb-6 size-9 text-primary"/><p className="text-xs font-semibold uppercase text-primary">Transparent by Design.</p><h1 className="mt-3 text-3xl font-bold">{recovery?'Set a new password':mode==='forgot'?'Forgot your password?':'Welcome back.'}</h1><p className="mt-3 text-sm text-muted-foreground">{recovery?'Choose a memorable, secure passphrase.':mode==='forgot'?'We’ll help you safely recover access.':'Sign in to your VARENTA customer workspace.'}</p><form onSubmit={submit} className="mt-8 space-y-5">{!recovery&&<Field label="Email address" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={255}/>} {(mode==='login'||recovery)&&<PasswordField label={recovery?'New password':'Password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={recovery?'new-password':'current-password'} required maxLength={128}/>} {recovery&&<PasswordField label="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} required maxLength={128}/>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{message&&<p role="status" className="rounded-md bg-secondary p-4 text-sm leading-6">{message}</p>}<Button type="submit" disabled={busy} className="h-12 w-full">{busy?'Please wait…':recovery?'Update password':mode==='forgot'?'Send reset link':'Sign in'}<ArrowRight/></Button></form>{!recovery&&<Button variant="link" className="mt-3 px-0" onClick={()=>{setMode(mode==='login'?'forgot':'login');setError('');setMessage('');}}>{mode==='login'?'Forgot password?':'Back to sign in'}</Button>}{recovery&&<Button asChild variant="link" className="mt-3"><Link to="/login">Back to sign in</Link></Button>}</div></main></div>;
}