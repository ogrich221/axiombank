import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, ArrowRight, Eye, EyeOff, CreditCard, ShieldCheck, Globe2, Wallet, Upload, Check, Bell, Search, Download, Lock, ArrowLeft, Receipt, RotateCw, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, PasswordField } from './CustomerControls';
import { useWorkspace, DashboardBack, CustomerAvatar, EmptyFinancial } from './CustomerLayout';
import { updateCustomerProfile, saveCustomerAvatar, submitCustomerApplication } from '@/lib/customer.functions';
import { profileSchema, transferPreviewSchema, residenceCountries, type CustomerProfileInput } from '@/lib/customer-schemas';
import { editableProfile } from '@/lib/customer-profile';
import { applicationReviewLabel } from '@/lib/customer-account-state';
import { supabase } from '@/integrations/supabase/client';

export function PaymentCard() {
  const [rotation, setRotation] = useState(0);
  const rotate360 = () => {
    setRotation(r => r + 360);
  };
  const flip = () => {
    setRotation(r => r + 180);
  };
  const isBack = Math.round(rotation / 180) % 2 !== 0;

  return (
    <div className="max-w-md">
      <div 
        style={{ perspective: '1200px' }} 
        className="cursor-pointer select-none"
        onClick={rotate360}
        title="Click to rotate card 360°"
      >
        <div 
          className="relative aspect-[1.586] w-full transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: `rotateY(${rotation}deg)` }}
        >
          <div className="customer-payment-card absolute inset-0 rounded-2xl text-navy-foreground shadow-lift bg-gradient-to-br from-navy via-navy to-navy/95 border border-white/10 overflow-hidden [transform-style:preserve-3d]">
            {/* Front Face */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 [backface-visibility:hidden]">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl font-bold tracking-wide">AXIOM BANK</span>
                  <p className="mt-1 text-xs opacity-70 tracking-widest uppercase">Transparent by Design</p>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="size-6 text-primary" />
                </div>
              </div>
              
              <div className="my-auto flex items-center gap-4">
                <div className="h-9 w-12 rounded-md bg-amber-400/90 border border-amber-300 shadow-inner" />
                <svg className="size-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 1 0-19" />
                </svg>
              </div>

              <div>
                <div className="text-xl tracking-[0.2em] font-mono font-medium drop-shadow-sm">
                  •••• &nbsp;•••• &nbsp;•••• &nbsp;4821
                </div>
                <div className="mt-3 flex items-center justify-between text-xs tracking-wider">
                  <span className="uppercase font-medium text-white/90">VALUED CARDHOLDER</span>
                  <span className="font-semibold text-primary uppercase">DEBIT</span>
                </div>
              </div>
            </div>

            {/* Back Face */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 bg-navy [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <div className="h-10 w-full bg-black/80" />
              <div className="px-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 flex-1 bg-white/90 rounded-sm flex items-center justify-end px-3">
                    <span className="font-mono text-xs font-bold text-navy">CVV 832</span>
                  </div>
                </div>
                <p className="mt-4 text-[10px] leading-relaxed text-white/60">
                  This card is property of AXIOM BANK. Authorized signature required. 24/7 Support: +1 (800) 555-0199.
                </p>
              </div>
              <div className="px-6 flex items-center justify-between text-xs text-white/70">
                <span>AXIOM · DEBIT</span>
                <span className="font-mono">VALID THRU 09/29</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Active contactless debit card</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={rotate360} title="Rotate 360 degrees">
            <RotateCw className="mr-1.5 size-3.5" />
            Rotate 360°
          </Button>
          <Button variant="ghost" size="sm" onClick={flip}>
            {isBack ? 'View front' : 'Flip card'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BalanceSummary() {
  const {balances}=useWorkspace();
  const [hidden,setHidden]=useState(false);
  return <div className="grid gap-6 sm:grid-cols-3">
    {['Available balance','Total account balance','Account status'].map((title,index)=><div key={title} className="min-w-0 border-b border-border pb-6"><div className="flex h-8 items-center justify-between"><p className="text-xs text-muted-foreground">{title}</p>{index===0&&<Button variant="ghost" size="icon" onClick={()=>setHidden(!hidden)} aria-label={hidden?'Show balance':'Hide balance'} title={hidden?'Show balance':'Hide balance'}>{hidden?<EyeOff/>:<Eye/>}</Button>}</div><p className="mt-3 text-2xl font-semibold">{index===2?'Active':hidden?'••••••':index===0?`$${balances.available}`:`$${balances.total}`}</p><p className="mt-2 text-xs text-muted-foreground">{index===2?'Verified customer account':'Checking account (•••• 1042)'}</p></div>)}
  </div>;
}

export function Overview() {
  const workspace=useWorkspace();
  const {profile,application,emailVerified}=workspace;
  const recentTx = ((workspace as any).transactions || []).slice(0, 5);
  return <>
    <div className="mb-9 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-primary">Your personal overview</p>
        <h1 className="mt-3 text-3xl font-bold">Welcome back, {profile?.first_name||'there'}.</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your money, your goals, your clarity.</p>
      </div>
      <CustomerAvatar/>
    </div>
    <BalanceSummary/>
    <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
      <section>
        <h2 className="mb-5 text-lg font-semibold">Quick actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {[{to:'/dashboard/transfer',title:'Send money',icon:ArrowUpRight},{to:'/dashboard/international',title:'Worldwide',icon:Globe2},{to:'/dashboard/bills',title:'Pay bills',icon:Wallet}].map(({to,title,icon:Icon})=><Button key={to} asChild variant="outline" className="h-24 flex-col whitespace-normal text-center"><Link to={to}><Icon className="mb-1 size-5"/>{title}</Link></Button>)}
        </div>
        <div className="mt-8 border-l-2 border-primary bg-secondary p-5">
          <p className="text-sm font-semibold">{application?applicationReviewLabel(application.admin_review_status):'Account in good standing'}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{emailVerified?'Email confirmed. ':'Email confirmation required. '}Your account is verified and ready for everyday banking.</p>
          <Button asChild variant="link" className="mt-2 px-0"><Link to="/dashboard/profile">Review your profile<ArrowRight/></Link></Button>
        </div>
      </section>
      <section>
        <h2 className="mb-5 text-lg font-semibold">Your card</h2>
        <PaymentCard/>
      </section>
    </div>
    {recentTx.length > 0 ? (
      <section className="mt-8 border-t border-border pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent transactions</h2>
            <p className="text-xs text-muted-foreground">Latest activity on your checking account</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/transactions">View all<ArrowRight className="ml-1 size-3.5"/></Link>
          </Button>
        </div>
        <div className="divide-y divide-border rounded-lg border border-border bg-background">
          {recentTx.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-3">
                <span className={`flex size-9 items-center justify-center rounded-full ${tx.type === 'credit' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="size-4"/> : <ArrowUpRight className="size-4"/>}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{tx.narration || (tx.type === 'credit' ? 'Funds Credited' : 'Funds Debited')}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})} · Ref: {tx.reference}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-mono text-sm font-semibold ${tx.type === 'credit' ? 'text-primary' : 'text-foreground'}`}>
                  {tx.type === 'credit' ? `+$${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : `-$${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                </p>
                <span className="font-mono text-[11px] text-muted-foreground">Bal: ${Number(tx.balanceAfter).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : (
      <EmptyFinancial title="Recent transactions">No transactions yet. Card purchases and transfers will appear here in real time.<div className="mt-4"><Button asChild variant="outline"><Link to="/dashboard/transactions">View transaction history<ArrowRight/></Link></Button></div></EmptyFinancial>
    )}
  </>;
}

export function ProfilePage() {
  const workspace=useWorkspace();const {profile,application,email,emailVerified}=workspace;const [editing,setEditing]=useState(!profile?.first_name);const [busy,setBusy]=useState(false);const [message,setMessage]=useState(''); const queryClient=useQueryClient();const save=useServerFn(updateCustomerProfile);const avatarSave=useServerFn(saveCustomerAvatar);const apply=useServerFn(submitCustomerApplication);
  const [values,setValues]=useState<CustomerProfileInput>(()=>editableProfile(profile));const [fieldErrors,setFieldErrors]=useState<Partial<Record<keyof CustomerProfileInput,string>>>({});
  const [image,setImage]=useState<HTMLImageElement|null>(null);const [zoom,setZoom]=useState(1);const [x,setX]=useState(50);const [y,setY]=useState(50);const canvas=useRef<HTMLCanvasElement>(null);const fileInput=useRef<HTMLInputElement>(null);const [consent,setConsent]=useState(false);
  useEffect(()=>{if(!editing&&!image)return;function warn(event:BeforeUnloadEvent){event.preventDefault();event.returnValue='';}window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[editing,image]);
  useEffect(()=>{const node=canvas.current;const context=node?.getContext('2d');if(!node||!context||!image)return;const side=Math.min(image.width,image.height)/zoom;const sx=(image.width-side)*x/100;const sy=(image.height-side)*y/100;context.clearRect(0,0,384,384);context.drawImage(image,sx,sy,side,side,0,0,384,384);},[image,zoom,x,y]);
  async function choosePhoto(file?:File){if(busy||!file)return;setMessage('');if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){setMessage('Choose a JPG, PNG or WebP smaller than 2 MB.');return;}const url=URL.createObjectURL(file);const photo=new Image();photo.onload=()=>{setImage(photo);setZoom(1);setX(50);setY(50);URL.revokeObjectURL(url);};photo.onerror=()=>{setMessage('This image could not be read.');URL.revokeObjectURL(url);};photo.src=url;}
  async function savePhoto(remove=false){setBusy(true);setMessage('');try{const encoded=remove?null:canvas.current?.toDataURL('image/png');if(encoded===undefined)throw new Error('Choose a photo before saving.');await avatarSave({data:{image:encoded}});setImage(null);await queryClient.invalidateQueries({queryKey:['customer-workspace']});setMessage(remove?'Photo removed.':'Photo saved.');}catch(error){setMessage(error instanceof Error?error.message:'Photo could not be saved.');}finally{setBusy(false);}}
  async function submit(event:FormEvent){event.preventDefault();if(busy)return;setMessage('');const parsed=profileSchema.safeParse(values);if(!parsed.success){const errors:Partial<Record<keyof CustomerProfileInput,string>>={};for(const issue of parsed.error.issues){const key=issue.path[0] as keyof CustomerProfileInput;errors[key]=issue.message;}setFieldErrors(errors);setMessage('Please check the highlighted fields.');return;}setFieldErrors({});setBusy(true);try{await save({data:parsed.data});setValues(parsed.data);await queryClient.invalidateQueries({queryKey:['customer-workspace']});setEditing(false);setMessage('Profile saved.');}catch(error){setMessage(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}}
  const fieldLabels:Record<string,string>={first_name:'First name',last_name:'Last name',middle_name:'Middle name',display_name:'Preferred name',date_of_birth:'Date of birth',nationality:'Nationality',country:'Country of residence',address:'Street address',city:'City',region:'State / region',postal_code:'Postal code',phone:'Phone number'};
  const profileGroups=[{title:'Personal details',keys:['first_name','middle_name','last_name','display_name','date_of_birth','nationality']},{title:'Contact details',keys:['phone']},{title:'Residential address',keys:['country','address','city','region','postal_code']}];
  function cancelEditing(){setValues(editableProfile(profile));setFieldErrors({});setEditing(false);setMessage('');}
  function startEditing(){setValues(editableProfile(profile));setFieldErrors({});setMessage('');setEditing(true);}
  useEffect(()=>{if(!editing)setValues(editableProfile(profile));},[profile,editing]);
  const required=['first_name','last_name','date_of_birth','nationality','country','address','city','postal_code','phone'] as const;
  const completeness=Math.round((required.filter(k=>String(profile?.[k]??'').trim()).length+(workspace.avatarUrl?1:0))/(required.length+1)*100);
  return <><DashboardBack/><section className="mb-8 flex flex-col items-start gap-6 border-b border-border bg-secondary p-6 sm:flex-row sm:flex-wrap sm:items-center"><CustomerAvatar size="large"/><div className="min-w-0 w-full sm:w-auto sm:flex-1"><p className="text-xs font-medium text-primary">Your personal profile</p><h1 className="mt-2 break-words text-3xl font-bold">{profile?.display_name||`${profile?.first_name??''} ${profile?.last_name??''}`.trim()||'Complete your profile'}</h1><p className="mt-2 text-sm text-muted-foreground">Signed in securely</p><div className="mt-4 max-w-sm"><div className="flex justify-between text-xs"><span>Profile completeness</span><span className="font-semibold text-primary">{completeness}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-background" role="progressbar" aria-label="Profile completeness" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-primary transition-all" style={{width:`${completeness}%`}}/></div></div></div><Button disabled={busy} onClick={()=>editing?cancelEditing():startEditing()} variant="outline">{editing?'Cancel editing':'Edit profile'}</Button></section>
    <div className="mb-8 flex flex-wrap gap-3"><input type="file" accept="image/jpeg,image/png,image/webp" ref={fileInput} aria-label="Profile photo" className="hidden" onChange={event=>{const file=event.target.files?.[0];event.target.value='';void choosePhoto(file);}}/><Button variant="outline" disabled={busy} onClick={()=>fileInput.current?.click()}><Upload/>{workspace.avatarUrl?'Change photo':'Upload photo'}</Button>{workspace.avatarUrl&&<Button variant="ghost" onClick={()=>savePhoto(true)} disabled={busy}>Remove photo</Button>}</div>
    {image&&<section className="mb-8 max-w-md border border-border p-5"><h2 className="mb-4 font-semibold">Adjust your photo</h2><canvas ref={canvas} width={384} height={384} className="mx-auto aspect-square w-full max-w-64 rounded-full"/>{[['Zoom',zoom,1,3,.05,(value:number)=>setZoom(value)],['Horizontal position',x,0,100,1,(value:number)=>setX(value)],['Vertical position',y,0,100,1,(value:number)=>setY(value)]].map(([label,value,min,max,step,handler])=><label key={String(label)} className="mt-4 block text-sm">{String(label)}<input type="range" min={Number(min)} max={Number(max)} step={Number(step)} value={Number(value)} className="mt-2 w-full" onChange={event=>{if(typeof handler==='function')handler(Number(event.target.value));}}/></label>)}<div className="mt-5 flex gap-3"><Button onClick={()=>savePhoto()} disabled={busy}>Save photo</Button><Button variant="ghost" disabled={busy} onClick={()=>setImage(null)}>Cancel</Button></div></section>}
    {message&&<p className="mb-6 rounded-md bg-secondary p-4 text-sm" role="status">{message}</p>}
    <section className="mb-9">{editing?<form onSubmit={submit} noValidate className="space-y-8">{profileGroups.map(group=><fieldset key={group.title} className="border-t border-border pt-6"><legend className="pr-4 text-lg font-semibold">{group.title}</legend><div className="mt-4 grid gap-5 sm:grid-cols-2">{group.keys.map(key=>key==='country'?<label key={key} className="block text-sm font-medium">Country of residence<select className="customer-field mt-2" disabled={busy} aria-invalid={Boolean(fieldErrors.country)} value={values.country} onChange={event=>setValues(old=>({...old,country:event.target.value}))}><option value="">Choose country</option>{residenceCountries.map(country=><option key={country} value={country}>{country}</option>)}</select>{fieldErrors.country&&<span className="mt-1 block text-xs text-destructive">{fieldErrors.country}</span>}</label>:<Field key={key} disabled={busy} error={fieldErrors[key as keyof CustomerProfileInput]} label={fieldLabels[key]??key} value={values[key as keyof CustomerProfileInput]} type={key==='date_of_birth'?'date':key==='phone'?'tel':'text'} autoComplete={key==='phone'?'tel':key==='address'?'street-address':undefined} maxLength={key==='address'?250:key==='phone'?30:key==='postal_code'?20:80} onChange={event=>setValues(old=>({...old,[key]:event.target.value}))}/>)}</div>{group.title==='Contact details'&&<p className="mt-5 break-words text-sm text-muted-foreground">Email: {email} · {emailVerified?'Confirmed':'Unverified'}</p>}</fieldset>)}<div className="flex gap-3 border-t border-border pt-6"><Button disabled={busy} type="submit"><Check/>{busy?'Saving…':'Save changes'}</Button><Button disabled={busy} variant="ghost" type="button" onClick={cancelEditing}>Cancel</Button></div></form>:<div className="grid gap-8 lg:grid-cols-2"><section><h2 className="mb-5 border-b border-border pb-4 text-lg font-semibold">Personal details</h2><dl className="grid gap-6 sm:grid-cols-2">{[['Full name',[profile?.first_name,profile?.middle_name,profile?.last_name].filter(Boolean).join(' ')||'Not set'],['Preferred name',profile?.display_name||'Not set'],['Date of birth',profile?.date_of_birth||'Not set'],['Nationality',profile?.nationality||'Not set']].map(([label,value])=><div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-2 break-words text-sm font-medium">{value}</dd></div>)}</dl></section><section><h2 className="mb-5 border-b border-border pb-4 text-lg font-semibold">Contact & residence</h2><dl className="space-y-6">{[['Email',email],['Phone',profile?.phone||'Not set'],['Residential address',[profile?.address,profile?.city,profile?.region,profile?.postal_code,profile?.country].filter(Boolean).join(', ')||'Not set']].map(([label,value])=><div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-2 break-words text-sm font-medium">{value}</dd>{label==='Email'&&<p className="mt-1 text-xs text-primary">{emailVerified?'Email confirmed':'Email unverified'}</p>}</div>)}</dl></section></div>}</section>
    {!application&&<section className="mb-8 border-t border-border pt-6"><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I acknowledge the <Link to="/terms" className="text-primary underline">terms</Link> and <Link to="/privacy" className="text-primary underline">privacy policy</Link>.</span></label><Button className="mt-4" disabled={!consent||busy} onClick={async()=>{setBusy(true);try{await apply({data:{terms:true}});await queryClient.invalidateQueries({queryKey:['customer-workspace']});setMessage('Application submitted. Awaiting admin confirmation.');}catch{setMessage('Complete and save your profile before submitting.');}finally{setBusy(false);}}}>Submit application</Button></section>}
    <section className="mb-8 border-t border-border pt-6"><h2 className="mb-5 text-lg font-semibold">Account information</h2><dl className="grid gap-6 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Customer ID</dt><dd className="mt-2 break-all text-sm">{profile?.id}</dd></div><div><dt className="text-xs text-muted-foreground">Application</dt><dd className="mt-2 text-sm">{applicationReviewLabel(application?.admin_review_status)}</dd></div><div><dt className="text-xs text-muted-foreground">Bank account</dt><dd className="mt-2 text-sm">Everyday Checking · •••• 1042</dd></div></dl></section><div className="flex flex-wrap gap-3 border-t border-border pt-6"><Button asChild variant="outline"><Link to="/dashboard/security"><ShieldCheck/>Security & privacy</Link></Button><Button asChild variant="ghost"><Link to="/dashboard/support">Help & support<ArrowRight/></Link></Button></div></>;
}

export function AccountsPage(){
  return <>
    <DashboardBack/>
    <h1 className="mb-8 text-3xl font-bold">Your accounts</h1>
    <BalanceSummary/>
    <section className="mt-8 rounded-lg border border-border bg-background p-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase text-primary">Everyday Banking</span>
          <h2 className="mt-1 text-xl font-bold">Primary Checking Account</h2>
          <p className="mt-1 text-xs text-muted-foreground">Account: •••• 1042 · Routing: 021000021</p>
        </div>
        <span className="rounded bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">Active</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link to="/dashboard/transfer">Transfer money</Link></Button>
        <Button asChild variant="outline"><Link to="/dashboard/transactions">View statements</Link></Button>
      </div>
    </section>
  </>;
}

export function CardsPage(){
  const [frozen, setFrozen] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <>
      <DashboardBack/>
      <h1 className="mb-8 text-3xl font-bold">Your cards</h1>
      <div className="grid gap-10 md:grid-cols-2">
        <PaymentCard/>
        <section>
          <h2 className="text-xl font-semibold">AXIOM Debit Card</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Manage your card status, security controls, and transaction limits. Your contactless debit card is active and linked to your primary checking account.
          </p>
          <div className="mt-6 grid gap-3">
            <Button variant={frozen ? "destructive" : "outline"} onClick={() => {
              setFrozen(!frozen);
              setMessage(frozen ? 'Card has been unlocked and is ready for use.' : 'Card has been temporarily frozen. All new transactions will be declined.');
            }}>
              <Lock/>{frozen ? 'Unfreeze card' : 'Freeze card'}
            </Button>
            <Button variant="outline" onClick={() => setMessage('Card reported. A replacement card has been ordered to your mailing address and will arrive in 3-5 business days.')}>
              <ShieldCheck/>Report lost or stolen
            </Button>
            <Button variant="outline" onClick={() => setMessage('Card limits updated: $2,500 daily ATM withdrawal and $10,000 daily point-of-sale spending enabled.')}>
              <CreditCard/>Manage card limits
            </Button>
            <Button asChild variant="ghost">
              <Link to="/dashboard/transactions">View card transactions<ArrowRight/></Link>
            </Button>
          </div>
          {message && <p role="status" className="mt-5 rounded-md bg-secondary p-4 text-sm text-foreground">{message}</p>}
        </section>
      </div>
    </>
  );
}

export function TransferPage({international=false}:{international?:boolean}) {
  const [stage,setStage]=useState<'details'|'review'|'success'>('details');
  const [selectedCountry,setSelectedCountry]=useState('United States');
  const [values,setValues]=useState({recipient:'',bank:'',account:'',amount:'',reference:''});
  const [error,setError]=useState('');
  function submit(event:FormEvent){
    event.preventDefault();
    const parsed=transferPreviewSchema.safeParse(values);
    if(!parsed.success){
      setError(parsed.error.issues.map(issue=>`${issue.path.join('')}: ${issue.message}`).join(' '));
      return;
    }
    setError('');
    setStage('review');
  }
  return <>
    <DashboardBack/>
    <p className="text-xs font-semibold text-primary">{international?'Worldwide transfer':'Fast domestic transfer'}</p>
    <h1 className="mt-3 text-3xl font-bold">{international?'Send Money Worldwide':'Transfer money'}</h1>
    <p className="mb-8 mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{international?'Choose your destination country, review real-time exchange rates, and send money securely.':'Transfer funds instantly to any verified bank account with zero fees.'}</p>
    {stage==='success' ? (
      <div className="max-w-xl rounded-lg border border-border bg-secondary p-8 text-center">
        <ShieldCheck className="mx-auto size-12 text-primary" />
        <h2 className="mt-4 text-2xl font-bold">Transfer Initiated</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your transfer of ${Number(values.amount).toFixed(2)} USD to {values.recipient} has been scheduled successfully.</p>
        <p className="mt-4 font-mono text-xs text-muted-foreground">Reference: TR-{crypto.randomUUID().slice(0,8).toUpperCase()}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={()=>{setStage('details');setValues({recipient:'',bank:'',account:'',amount:'',reference:''});}}>Make another transfer</Button>
          <Button asChild variant="outline"><Link to="/dashboard/transactions">View transactions</Link></Button>
        </div>
      </div>
    ) : stage==='details' ? (
      <form onSubmit={submit} className="max-w-2xl space-y-5">
        {international && (
          <label className="block text-sm font-medium">Destination country
            <select className="customer-field mt-2" value={selectedCountry} onChange={e=>setSelectedCountry(e.target.value)}>
              {residenceCountries.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}
        <label className="block text-sm font-medium">Source account
          <select className="customer-field mt-2">
            <option>AXIOM Everyday Checking (•••• 1042) — $0.00</option>
          </select>
        </label>
        {([['recipient','Recipient full name'],['bank','Destination bank'],['account','Recipient account or IBAN number'],['amount','Amount (USD)'],['reference','Payment reference (optional)']] as const).map(([key,label])=><Field key={key} label={label} value={values[key as keyof typeof values]} type={key==='amount'?'number':'text'} min={key==='amount'?'0.01':undefined} step={key==='amount'?'0.01':undefined} maxLength={key==='account'?34:140} required={key!=='reference'} onChange={event=>setValues(old=>({...old,[key]:event.target.value}))}/>)}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="h-11">Review transfer<ArrowRight/></Button>
      </form>
    ) : (
      <section className="max-w-2xl">
        <Button variant="ghost" className="mb-6 px-0" onClick={()=>setStage('details')}><ArrowLeft/>Back to transfer details</Button>
        <h2 className="text-xl font-semibold">Review transfer details</h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          {[['Recipient',values.recipient],['Bank',values.bank],['Account',`•••• ${values.account.slice(-4)}`],['Amount',`$${Number(values.amount).toFixed(2)} USD`],['Transfer fee','$0.00 (Zero fee)'],['Estimated arrival','Within 1 business day'],['Reference',values.reference||'None'],['Destination',international?selectedCountry:'Domestic']].map(([label,value])=><div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-2 break-words text-sm font-medium">{value}</dd></div>)}
        </dl>
        <div className="mt-8 flex gap-3">
          <Button className="h-11" onClick={()=>setStage('success')}>Confirm and send transfer<ArrowRight/></Button>
          <Button variant="outline" onClick={()=>setStage('details')}>Cancel</Button>
        </div>
      </section>
    )}
  </>;
}

export function BillsPage(){
  const [billerQuery, setBillerQuery] = useState('');
  return <>
    <DashboardBack/>
    <p className="text-xs font-semibold text-primary">Bill payment</p>
    <h1 className="mt-3 text-3xl font-bold">Pay bills</h1>
    <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Pay utilities, telecoms, insurance and municipal services directly from your AXIOM account with automatic electronic receipts.</p>
    <div className="my-8 max-w-md">
      <label className="text-sm font-medium">Search billers or service providers
        <div className="relative mt-2">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground"/>
          <input className="customer-field pl-9" placeholder="Search electric, water, internet..." value={billerQuery} onChange={e=>setBillerQuery(e.target.value)}/>
        </div>
      </label>
    </div>
    <div className="rounded-lg border border-border p-8 text-center">
      <Receipt className="mx-auto mb-4 size-8 text-primary"/>
      <h2 className="font-semibold">{billerQuery ? 'No billers matching search' : 'No scheduled bills'}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Select an account and add a biller to schedule automated recurring or one-time payments.</p>
      <Button className="mt-5" variant="outline" asChild><Link to="/dashboard/support">Bill Pay Assistance<ArrowRight/></Link></Button>
    </div>
  </>;
}

export function TransactionsPage(){
  const workspace = useWorkspace();
  const allTx: any[] = (workspace as any).transactions || [];
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState<'All' | 'Credit' | 'Debit'>('All');
  const [sortOrder, setSortOrder] = useState<'Newest first' | 'Oldest first'>('Newest first');

  const filtered = allTx.filter((tx: any) => {
    if (direction === 'Credit' && tx.type !== 'credit') return false;
    if (direction === 'Debit' && tx.type !== 'debit') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNarration = (tx.narration || '').toLowerCase().includes(q);
      const matchRef = (tx.reference || '').toLowerCase().includes(q);
      if (!matchNarration && !matchRef) return false;
    }
    return true;
  }).sort((a: any, b: any) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === 'Newest first' ? timeB - timeA : timeA - timeB;
  });

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ['Date', 'Reference', 'Type', 'Narration', 'Amount (USD)', 'Balance After (USD)', 'Status'];
    const rows = filtered.map((tx: any) => [
      `"${new Date(tx.createdAt).toISOString()}"`,
      `"${tx.reference || ''}"`,
      `"${tx.type.toUpperCase()}"`,
      `"${(tx.narration || '').replace(/"/g, '""')}"`,
      `"${Number(tx.amount).toFixed(2)}"`,
      `"${Number(tx.balanceAfter).toFixed(2)}"`,
      `"${tx.status || 'completed'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: string[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return <>
    <DashboardBack/>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Transaction history</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review your account ledger, debit/credit transactions, and download statements.</p>
      </div>
      <Button variant="outline" onClick={exportCSV} disabled={!filtered.length} title="Export statement CSV">
        <Download className="mr-1.5 size-4"/>Export CSV
      </Button>
    </div>

    <div className="my-8 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Search description or reference" value={search} onChange={event=>setSearch(event.target.value)} maxLength={140}/>
      <label className="text-sm font-medium">Direction
        <select className="customer-field mt-2" value={direction} onChange={e=>setDirection(e.target.value as any)}>
          <option value="All">All directions</option>
          <option value="Credit">Credit (incoming)</option>
          <option value="Debit">Debit (outgoing)</option>
        </select>
      </label>
      <label className="text-sm font-medium">Sort
        <select className="customer-field mt-2" value={sortOrder} onChange={e=>setSortOrder(e.target.value as any)}>
          <option value="Newest first">Newest first</option>
          <option value="Oldest first">Oldest first</option>
        </select>
      </label>
    </div>

    {filtered.length > 0 ? (
      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Narration</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((tx: any) => (
              <tr key={tx.id} className="transition-colors hover:bg-muted/40">
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${tx.type === 'credit' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                    <span className="size-1.5 rounded-full bg-current"/>
                    {tx.type === 'credit' ? 'CREDIT' : 'DEBIT'}
                  </span>
                </td>
                <td className="max-w-xs break-words px-4 py-3.5 text-xs font-medium text-foreground">
                  {tx.narration || (tx.type === 'credit' ? 'Account Credit' : 'Account Debit')}
                </td>
                <td className={`whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold ${tx.type === 'credit' ? 'text-primary' : 'text-destructive'}`}>
                  {tx.type === 'credit' ? `+$${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : `-$${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-muted-foreground">
                  ${Number(tx.balanceAfter).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                  {tx.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="border-y border-border py-14 text-center">
        <Search className="mx-auto mb-4 size-8 text-muted-foreground"/>
        <h2 className="font-semibold">{search || direction !== 'All' ? 'No matching transactions' : 'No transactions recorded yet'}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {search || direction !== 'All' ? 'Try adjusting or clearing your search or filter.' : 'When your account is credited, debited, or you make card purchases, they will appear here in real time.'}
        </p>
      </div>
    )}
  </>;
}

export function SecurityPage(){
  const [current,setCurrent]=useState('');const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const {email,emailVerified}=useWorkspace();
  async function change(event:FormEvent){
    event.preventDefault();
    if(password.length<12||password.length>128){setMessage('Use a passphrase between 12 and 128 characters.');return;}
    setBusy(true);
    try{
      const {error}=await supabase.auth.updateUser({password,current_password:current});
      if(error)throw error;
      setMessage('Password updated.');
      setCurrent('');setPassword('');
    }catch{
      setMessage('Password could not be changed. Check your current password and try again.');
    }finally{setBusy(false);}
  }
  return <>
    <DashboardBack/>
    <h1 className="text-3xl font-bold">Security & privacy</h1>
    <div className="mt-8 grid gap-10 md:grid-cols-2">
      <section>
        <h2 className="mb-5 text-lg font-semibold">Change password</h2>
        <form onSubmit={change} className="space-y-5">
          <PasswordField label="Current password" value={current} onChange={e=>setCurrent(e.target.value)} required autoComplete="current-password" maxLength={128}/>
          <PasswordField label="New password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={12} maxLength={128} autoComplete="new-password"/>
          <Button type="submit" disabled={busy}>{busy?'Updating…':'Update password'}</Button>
          {message&&<p role="status" className="text-sm">{message}</p>}
        </form>
      </section>
      <section>
        <ShieldCheck className="size-8 text-primary"/>
        <h2 className="mt-4 text-lg font-semibold">Your verification</h2>
        <p className="mt-3 break-words text-sm">{email}</p>
        <p className="mt-2 text-sm text-primary">Email {emailVerified?'confirmed':'unverified'}</p>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">Your account is safeguarded with end-to-end TLS encryption, two-factor authentication, and proactive fraud alerts.</p>
        <Button asChild variant="link" className="mt-3 px-0"><Link to="/privacy">Privacy policy<ArrowRight/></Link></Button>
      </section>
    </div>
    <EmptyFinancial title="Multi-factor authentication">Two-factor authentication is active on your account via email and mobile security codes.</EmptyFinancial>
  </>;
}

export function NotificationsPage(){
  const {application,emailVerified}=useWorkspace();
  const [read,setRead]=useState(false);
  return <>
    <DashboardBack/>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <Button variant="outline" disabled={read} onClick={()=>setRead(true)}><Check/>Mark all as read</Button>
    </div>
    <p className="mt-4 text-sm text-muted-foreground">Read status applies to this visit.</p>
    <div className="mt-8 space-y-4">
      {application && (
        <div className="flex items-start gap-4 border-b border-border py-5">
          <Bell className="size-5 text-primary"/>
          <div>
            <h2 className="text-sm font-semibold">Application received</h2>
            <p className="mt-2 text-sm text-muted-foreground">Submitted {new Date(application.submitted_at).toLocaleDateString()}. {applicationReviewLabel(application.admin_review_status)}.</p>
            <span className="mt-2 block text-xs text-primary">{read?'Read':'Unread'}</span>
          </div>
        </div>
      )}
      {emailVerified && (
        <div className="flex gap-4 border-b border-border py-5">
          <ShieldCheck className="size-5 text-primary"/>
          <div>
            <h2 className="text-sm font-semibold">Email confirmed</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your account’s email confirmation is complete.</p>
          </div>
        </div>
      )}
    </div>
  </>;
}

export function SupportPage(){
  return <>
    <DashboardBack/>
    <h1 className="text-3xl font-bold">Here for your clarity.</h1>
    <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Find answers about your customer account, cards, and transfers. Never share your password, PIN or verification codes with anyone.</p>
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <section>
        <h2 className="text-lg font-semibold">Account assistance</h2>
        <div className="mt-5 space-y-5">
          <details className="border-b border-border pb-4">
            <summary className="cursor-pointer text-sm font-semibold">When can I start making transfers?</summary>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">As soon as your account is confirmed, you can transfer money domestically and internationally through the Transfer section.</p>
          </details>
          <details className="border-b border-border pb-4">
            <summary className="cursor-pointer text-sm font-semibold">How do I freeze or manage my card?</summary>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Navigate to the Cards page where you can view your card, rotate it 360°, freeze it instantly, or request a replacement.</p>
          </details>
          <details className="border-b border-border pb-4">
            <summary className="cursor-pointer text-sm font-semibold">How do I reset my password?</summary>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Use Forgot password on the sign-in page and follow the email link. You can also change your password under Security & privacy.</p>
          </details>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">More help</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/help-center">Help center<ArrowRight/></Link></Button>
          <Button asChild variant="outline"><Link to="/contact">Contact information<ArrowRight/></Link></Button>
          <Button asChild variant="ghost"><Link to="/dashboard/security">Security & privacy</Link></Button>
        </div>
      </section>
    </div>
  </>;
}
