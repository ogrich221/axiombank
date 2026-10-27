import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { LayoutDashboard, Users, ShieldCheck, History, Bell, Settings, CircleHelp, PanelLeftClose, PanelLeftOpen, Menu, X, LogOut, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/site/Logo';
import { AdminProvider, useAdmin } from './AdminProvider';
import { getAdminStatus, unlockAdmin } from '@/lib/admin.functions';
const nav = [{title:'Dashboard',to:'/admin',icon:LayoutDashboard},{title:'User Management',to:'/admin/users',icon:Users},{title:'Activity Logs',to:'/admin/activity',icon:History},{title:'Notifications',to:'/admin/notifications',icon:Bell},{title:'Settings',to:'/admin/settings',icon:Settings},{title:'Help & Support',to:'/admin/help',icon:CircleHelp}] as const;
export function AdminLoader() { return <div className="admin-theme fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background"><Logo/><p className="text-sm text-muted-foreground">Transparent by Design.</p><div className="h-1 w-36 overflow-hidden rounded bg-secondary"><div className="admin-loader h-full w-full bg-primary"/></div></div>; }
export function AdminLayout() {
  const status = useServerFn(getAdminStatus); const [state,setState] = useState<'checking'|'locked'|'open'>('checking');
  useEffect(()=>{status().then(r=>setState(r.unlocked?'open':'locked')).catch(()=>setState('locked'));},[status]);
  const onLocked = useCallback(()=>setState('locked'),[]);
  if (state==='checking') return <AdminLoader/>;
  if (state==='locked') return <PasscodeGate onUnlock={()=>setState('open')}/>;
  return <AdminProvider onLocked={onLocked}><Workspace/></AdminProvider>;
}
function PasscodeGate({onUnlock}:{onUnlock:()=>void}) {
  const unlock = useServerFn(unlockAdmin); const [error,setError] = useState(''); const [busy,setBusy] = useState(false); const [visible,setVisible] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const passcode = String(new FormData(e.currentTarget).get('passcode') ?? ''); setBusy(true); setError(''); try { const r = await unlock({data:{passcode}}); if (r.ok) onUnlock(); else setError('Incorrect passcode.'); } catch { setError('Could not verify the passcode. Try again.'); } setBusy(false); }
  return <div className="admin-theme flex min-h-screen items-center justify-center bg-muted px-5"><form onSubmit={submit} className="w-full max-w-sm rounded-lg border bg-background p-8"><Logo/><h1 className="mt-6 flex items-center gap-2 text-xl font-bold"><Lock className="size-5 text-primary"/>Admin access</h1><p className="mt-2 text-sm text-muted-foreground">Enter the administrator passcode to continue.</p><label className="mt-6 block text-sm font-medium">Passcode<span className="relative mt-2 block"><input name="passcode" type={visible?'text':'password'} required autoFocus autoComplete="current-password" className="admin-field pr-12"/><Button type="button" size="icon" variant="ghost" className="absolute right-1 top-0 h-10 w-10" aria-label={visible?'Hide passcode':'Show passcode'} title={visible?'Hide passcode':'Show passcode'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff/>:<Eye/>}</Button></span></label>{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}<Button type="submit" className="mt-6 w-full" disabled={busy}>{busy?'Checking…':'Unlock dashboard'}</Button><Button variant="link" asChild className="mt-2 w-full"><Link to="/">Back to VARENTA BANK</Link></Button></form></div>;
}
function Workspace() {
  const [collapsed,setCollapsed] = useState(false); const [mobile,setMobile] = useState(false); const {notice,setNotice,logout,read,loaded} = useAdmin();
  const path = useRouterState({select:s=>s.location.pathname}); const pending = useRouterState({select:s=>s.status==='pending'}); const current = nav.find(n=>n.to==='/admin' ? path==='/admin' || path==='/admin/' : path.startsWith(n.to));
  useEffect(()=>{setMobile(false);},[path]);
  if (!loaded) return <AdminLoader/>;
  return <div className="admin-theme flex min-h-screen bg-muted text-foreground">
    {pending && <AdminLoader/>}
    {mobile && <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={()=>setMobile(false)}/>}
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background transition-[width,transform] ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-64 ${mobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex h-20 items-center justify-between px-5">{collapsed ? <img src="/favicon.png" alt="VARENTA BANK" className="hidden size-9 lg:block"/> : <Logo/>}<Button size="icon" variant="ghost" className="lg:hidden" aria-label="Close navigation" onClick={()=>setMobile(false)}><X/></Button></div>
      {!collapsed && <p className="px-6 pb-6 text-[11px] font-semibold uppercase text-muted-foreground">Administration</p>}
      <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3">{nav.map(n=><Button key={n.to} variant="ghost" asChild className={`h-12 w-full justify-start ${current?.to===n.to ? 'bg-secondary text-primary' : 'text-muted-foreground'} ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}><Link to={n.to} title={n.title}><n.icon/>{!collapsed && <span>{n.title}</span>}</Link></Button>)}</nav>
      <div className="border-t p-4"><div className="flex items-center gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">AD</div>{!collapsed && <div className="min-w-0"><p className="text-sm font-semibold">Administrator</p><p className="text-xs text-muted-foreground">VARENTA BANK</p></div>}</div><Button variant="ghost" className={`mt-3 w-full ${collapsed ? 'px-0' : 'justify-start'}`} onClick={()=>void logout()} title="Log out"><LogOut/>{!collapsed && 'Log out'}</Button></div>
    </aside>
    <div className={`min-w-0 flex-1 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-3 border-b bg-background px-4 md:px-8"><div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" className="hidden lg:inline-flex" title={collapsed?'Expand sidebar':'Collapse sidebar'} onClick={()=>setCollapsed(!collapsed)}>{collapsed?<PanelLeftOpen/>:<PanelLeftClose/>}</Button><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={()=>setMobile(true)}><Menu/></Button><span className="truncate text-sm text-muted-foreground">{current?.title || 'User Management'}</span></div><div className="flex items-center gap-2"><Button variant="ghost" size="icon" asChild title="Notifications"><Link to="/admin/notifications" className="relative"><Bell/>{!read && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary"/>}</Link></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="px-1.5" aria-label="Administrator menu"><span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">AD</span><ChevronDown/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="admin-theme"><DropdownMenuItem asChild><Link to="/admin/settings">Profile & settings</Link></DropdownMenuItem><DropdownMenuItem onSelect={()=>void logout()}>Log out</DropdownMenuItem><DropdownMenuItem asChild><Link to="/">Bank website</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>
      {notice && <div role="status" className="mx-4 mt-4 flex items-center gap-3 rounded-md border bg-secondary p-3 text-sm md:mx-8"><CheckCircle2 className="size-5 shrink-0 text-primary"/><span className="flex-1">{notice}</span><Button size="icon" variant="ghost" aria-label="Dismiss notification" onClick={()=>setNotice('')}><X/></Button></div>}
      <main className="mx-auto max-w-[1500px] p-4 md:p-8"><Outlet/></main>
      <footer className="flex flex-wrap justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:px-8"><span>© 2026 VARENTA BANK</span><span>Transparent by Design.</span></footer>
    </div>
  </div>;
}
