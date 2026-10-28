import { useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useBlocker } from '@tanstack/react-router';
import { Users, UserCheck, Clock3, UserX, Search, SlidersHorizontal, Plus, Download, ArrowLeft, ArrowRight, Pencil, MoreHorizontal, Eye, ShieldCheck, Trash2, ArrowDownLeft, ArrowUpRight, Wallet, Receipt, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAdmin } from './AdminProvider';
import { AdminApplications } from './AdminApplications';
import { filterUsers, emptyFilters, formatDate, validateUser, formatCurrency, type AdminUser, type UserStatus, type UserRole, type UserTransaction } from '@/lib/admin-demo';

export function PageHeading({title,description,actions}: {title:string;description?:string;actions?:ReactNode}) {
  return <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold md:text-3xl">{title}</h1>{description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}</div><div className="flex flex-wrap gap-2">{actions}</div></div>;
}

export function StatusBadge({status}: {status:UserStatus}) {
  return <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium ${status==='Active'?'bg-secondary text-primary':status==='Pending'?'bg-warning-surface text-warning':'bg-destructive/10 text-destructive'}`}><span className="size-1.5 rounded-full bg-current"/>{status}</span>;
}

export function Initials({user}: {user:AdminUser}) {
  return <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{user.firstName[0]}{user.lastName[0]}</span>;
}

export function UserStats() {
  const {users,setFilters,filters,setPage} = useAdmin();
  const navigate = useNavigate();
  return <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
    {[{label:'Total Users',status:'All',icon:Users},{label:'Active Users',status:'Active',icon:UserCheck},{label:'Pending Verification',status:'Pending',icon:Clock3},{label:'Suspended Users',status:'Suspended',icon:UserX}].map(s=>(
      <Button key={s.status} variant="outline" className="h-auto min-h-32 flex-col items-start gap-3 whitespace-normal p-4 text-left shadow-none" onClick={()=>{setFilters({...filters,status:s.status});setPage(1);navigate({to:'/admin/users'});}}>
        <span className="flex w-full items-center justify-between gap-2 text-xs text-muted-foreground">{s.label}<s.icon className={s.status==='Suspended'?'text-destructive':'text-primary'}/></span>
        <span className="text-3xl font-bold">{users.filter(u=>s.status==='All'||u.status===s.status).length}</span>
        <span className="text-xs font-normal text-muted-foreground">{s.status==='Active'?'Account status is Active':'Registered accounts'}</span>
      </Button>
    ))}
  </div>;
}

export function UsersPage() {
  const {users,filters,setFilters,page,setPage,pageSize,setPageSize} = useAdmin();
  const [showFilters,setShowFilters] = useState(false);
  const filtered = filterUsers(users,filters);
  const pages = Math.max(1,Math.ceil(filtered.length/pageSize));
  const current = Math.min(page,pages);
  const displayed = filtered.slice((current-1)*pageSize,current*pageSize);
  const update = (key: keyof typeof filters,value:string)=>{setFilters({...filters,[key]:value});setPage(1);};

  function exportUsers() {
    const rows = [['User ID','First Name','Last Name','Email','Role','Status','Balance','Joined'],...filtered.map(u=>[u.id,u.firstName,u.lastName,u.email,u.role,u.status,u.balance||'0.00',u.joined])];
    const csv = rows.map(row=>row.map(cell=>`"${(/^[=+@-]/.test(cell)?"'":'')+cell.replaceAll('"','""')}"`).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    const a=document.createElement('a');a.href=url;a.download='axiom-users.csv';a.click();URL.revokeObjectURL(url);
  }

  return <>
    <PageHeading title="User Management" description="View, search, and manage registered users and balances from one place." actions={<><Button variant="outline" onClick={exportUsers}><Download/>Export Users</Button><Button asChild><Link to="/admin/users/new"><Plus/>Add User</Link></Button></>}/>
    <UserStats/>
    <AdminApplications/>
    <section className="rounded-lg border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <h2 className="font-semibold">All users <span className="ml-2 text-sm font-normal text-muted-foreground">{filtered.length}</span></h2>
      </div>
      <div className="p-4">
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground"/>
            <input className="admin-field pl-10" aria-label="Search users" placeholder="Search name, email or user ID…" value={filters.query} onChange={e=>update('query',e.target.value)}/>
          </label>
          <Button variant="outline" className="h-11" aria-expanded={showFilters} onClick={()=>setShowFilters(!showFilters)}><SlidersHorizontal/>Filters</Button>
        </div>
        <div className={`${showFilters?'grid':'hidden md:grid'} mt-3 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5`}>
          <label className="text-xs text-muted-foreground">Status<select className="admin-field mt-1" aria-label="Filter status" value={filters.status} onChange={e=>update('status',e.target.value)}>{['All','Active','Pending','Suspended'].map(s=><option key={s}>{s}</option>)}</select></label>
          <label className="text-xs text-muted-foreground">Role<select className="admin-field mt-1" aria-label="Filter role" value={filters.role} onChange={e=>update('role',e.target.value)}>{['All','Customer','Support','Admin','Auditor'].map(s=><option key={s}>{s}</option>)}</select></label>
          <label className="text-xs text-muted-foreground">Joined from<input type="date" className="admin-field mt-1" value={filters.from} onChange={e=>update('from',e.target.value)}/></label>
          <label className="text-xs text-muted-foreground">Joined until<input type="date" min={filters.from} className="admin-field mt-1" value={filters.to} onChange={e=>update('to',e.target.value)}/></label>
          <label className="text-xs text-muted-foreground">Sort by<select className="admin-field mt-1" aria-label="Sort users" value={filters.sort} onChange={e=>update('sort',e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Alphabetical</option></select></label>
        </div>
        {JSON.stringify(filters)!==JSON.stringify(emptyFilters) && <Button variant="link" className="mt-2 px-0" onClick={()=>{setFilters(emptyFilters);setPage(1);}}>Clear Filters</Button>}
      </div>

      {displayed.length ? (
        <>
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full text-left text-sm">
              <thead className="border-y bg-muted text-xs text-muted-foreground">
                <tr>{['User','Email','Role','Status','Balance','Date Joined','Last Activity','Actions'].map(h=><th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>{displayed.map(u=><UserRow key={u.id} user={u}/>)}</tbody>
            </table>
          </div>
          <div className="divide-y xl:hidden">
            {displayed.map(u=>(
              <div key={u.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link to="/admin/users/$userId" params={{userId:u.id}} className="flex min-w-0 items-center gap-3">
                    <Initials user={u}/>
                    <div className="min-w-0">
                      <p className="font-semibold">{u.firstName} {u.lastName}</p>
                      <p className="break-all text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </Link>
                  <UserActions user={u}/>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <StatusBadge status={u.status}/>
                  <span className="font-mono font-semibold text-primary">{formatCurrency(u.balance || 0)}</span>
                  <span>{u.role}</span>
                  <span className="text-muted-foreground">Joined {formatDate(u.joined)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-16 text-center">
          <Users className="mx-auto mb-3 size-8 text-muted-foreground"/>
          <h3 className="font-semibold">No users found.</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try changing your search or clearing your filters.</p>
          <Button variant="outline" className="mt-4" onClick={()=>{setFilters(emptyFilters);setPage(1);}}>Clear Filters</Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-xs text-muted-foreground">
        <span>{filtered.length ? (current-1)*pageSize+1 : 0}–{Math.min(current*pageSize,filtered.length)} of {filtered.length} users</span>
        <div className="flex items-center gap-2">
          <select aria-label="Users per page" className="admin-field w-20" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}}>{[10,25,50].map(s=><option key={s} value={s}>{s}</option>)}</select>
          <Button variant="outline" size="icon" title="Previous page" disabled={current<=1} onClick={()=>setPage(current-1)}><ArrowLeft/></Button>
          <span>{current} / {pages}</span>
          <Button variant="outline" size="icon" title="Next page" disabled={current>=pages} onClick={()=>setPage(current+1)}><ArrowRight/></Button>
        </div>
      </div>
    </section>
  </>;
}

function UserRow({user:u}: {user:AdminUser}) {
  const navigate=useNavigate();
  const {filters,setFilters,setPage}=useAdmin();
  return <tr className="cursor-pointer border-b hover:bg-muted/60" onClick={()=>navigate({to:'/admin/users/$userId',params:{userId:u.id}})}>
    <td className="px-4 py-4">
      <Link to="/admin/users/$userId" params={{userId:u.id}} className="flex items-center gap-3">
        <Initials user={u}/>
        <div>
          <p className="whitespace-nowrap font-medium">{u.firstName} {u.lastName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{u.id}</p>
        </div>
      </Link>
    </td>
    <td className="px-4 text-xs">{u.email}</td>
    <td className="px-4">{u.role}</td>
    <td className="px-4">
      <Button variant="ghost" className="h-auto p-0" onClick={e=>{e.stopPropagation();setFilters({...filters,status:u.status});setPage(1);}}>
        <StatusBadge status={u.status}/>
      </Button>
    </td>
    <td className="px-4 font-mono text-xs font-semibold text-primary">{formatCurrency(u.balance || 0)}</td>
    <td className="px-4 text-xs">{formatDate(u.joined)}</td>
    <td className="px-4 text-xs">{formatDate(u.activity)}</td>
    <td className="px-4" onClick={e=>e.stopPropagation()}><UserActions user={u}/></td>
  </tr>;
}

function UserActions({user}: {user:AdminUser}) {
  const [open,setOpen]=useState(false);
  const [transactType, setTransactType] = useState<'credit' | 'debit' | null>(null);

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${user.firstName}`}><MoreHorizontal/></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="admin-theme">
        <DropdownMenuItem asChild><Link to="/admin/users/$userId" params={{userId:user.id}}><Eye/>View profile</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/admin/users/$userId/edit" params={{userId:user.id}}><Pencil/>Edit user</Link></DropdownMenuItem>
        <DropdownMenuItem onSelect={()=>setTransactType('credit')} className="text-primary font-medium">
          <ArrowDownLeft/>Credit account
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={()=>setTransactType('debit')} className="text-destructive font-medium">
          <ArrowUpRight/>Debit account
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onSelect={()=>setOpen(true)}><Trash2/>Delete user</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <DeleteDialog user={user} open={open} onOpenChange={setOpen}/>
    <TransactDialog user={user} type={transactType} open={!!transactType} onOpenChange={open => { if(!open) setTransactType(null); }} />
  </>;
}

export function TransactDialog({
  user,
  type,
  open,
  onOpenChange,
  onCompleted,
}: {
  user: AdminUser;
  type: 'credit' | 'debit' | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
}) {
  const { transactUser } = useAdmin();
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const currentBalance = parseFloat(user.balance || '0');
  const numAmount = parseFloat(amount || '0');
  const isCredit = type === 'credit';
  const newBalance = isCredit ? currentBalance + (isNaN(numAmount) ? 0 : numAmount) : currentBalance - (isNaN(numAmount) ? 0 : numAmount);

  const presets = isCredit
    ? ['Account opening deposit', 'Wire transfer credit', 'Payroll direct deposit', 'Fee refund / reversal', 'Interest dividend payout']
    : ['Wire transfer withdrawal', 'Monthly maintenance fee', 'Card settlement debit', 'Administrative balance adjustment', 'Service charge'];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;
    setError('');
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Enter a valid amount greater than $0.00.');
      return;
    }
    if (!narration.trim()) {
      setError('Please provide a narration for this transaction.');
      return;
    }
    setBusy(true);
    const res = await transactUser({
      userId: user.id,
      type,
      amount: val,
      narration: narration.trim(),
    });
    setBusy(false);
    if (res.ok) {
      setAmount('');
      setNarration('');
      onOpenChange(false);
      onCompleted?.();
    } else {
      setError(res.error || 'Could not complete this transaction.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-theme max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg">
        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
          {isCredit ? (
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowDownLeft className="size-5" />
            </span>
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ArrowUpRight className="size-5" />
            </span>
          )}
          {isCredit ? 'Credit User Account' : 'Debit User Account'}
        </DialogTitle>
        <DialogDescription>
          {isCredit ? 'Deposit funds into' : 'Debit funds from'} {user.firstName} {user.lastName}'s account ({user.id}). This transaction will be logged with narration in the customer's ledger.
        </DialogDescription>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Current balance</span>
              <span className="font-mono font-medium text-foreground">{formatCurrency(currentBalance)}</span>
            </div>
            {amount && !isNaN(numAmount) && numAmount > 0 && (
              <>
                <div className="mt-2 flex justify-between text-xs">
                  <span>Adjustment</span>
                  <span className={`font-mono font-medium ${isCredit ? 'text-primary' : 'text-destructive'}`}>
                    {isCredit ? `+${formatCurrency(numAmount)}` : `-${formatCurrency(numAmount)}`}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-semibold">
                  <span>Projected new balance</span>
                  <span className="font-mono text-primary font-bold">{formatCurrency(newBalance)}</span>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Transaction Amount (USD) *
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-3 text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="admin-field pl-8 font-mono text-base"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium">
              Narration / Memo *
              <input
                type="text"
                required
                maxLength={255}
                placeholder="e.g. Account opening deposit, wire credit, adjustment..."
                className="admin-field mt-1.5"
                value={narration}
                onChange={e => setNarration(e.target.value)}
              />
            </label>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-muted-foreground self-center mr-1">Quick presets:</span>
              {presets.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setNarration(p)}
                  className="rounded border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className={isCredit ? 'bg-primary hover:bg-primary/90 text-primary-foreground font-semibold' : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold'}
            >
              {busy ? 'Processing…' : isCredit ? 'Confirm Credit' : 'Confirm Debit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({user,open,onOpenChange,onDeleted}:{user:AdminUser;open:boolean;onOpenChange:(v:boolean)=>void;onDeleted?:()=>void}) {
  const {deleteUser}=useAdmin();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="admin-theme w-[calc(100%-2rem)] rounded-lg">
      <DialogTitle>Delete {user.firstName} {user.lastName}?</DialogTitle>
      <DialogDescription>This permanently removes the user from the directory. This cannot be undone.</DialogDescription>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
        <Button variant="destructive" disabled={busy} onClick={async()=>{setBusy(true);const ok=await deleteUser(user);setBusy(false);if(ok){onOpenChange(false);onDeleted?.();}else setError('Could not delete this user.');}}>{busy?'Deleting…':'Delete user'}</Button>
      </div>
    </DialogContent>
  </Dialog>;
}

export function UserProfile({userId}: {userId:string}) {
  const {users,events,transactions,saveUser}=useAdmin();
  const navigate=useNavigate();
  const [confirm,setConfirm]=useState<UserStatus|null>(null);
  const [del,setDel]=useState(false);
  const [transactModal, setTransactModal] = useState<'credit' | 'debit' | null>(null);

  const u=users.find(u=>u.id===userId);
  if(!u) return <MissingUser/>;

  const userTransactions = (transactions || []).filter(t => t.userId === u.id);

  return (
    <>
      <BackUsers/>
      <PageHeading 
        title={`${u.firstName} ${u.lastName}`} 
        description={u.id} 
        actions={
          <>
            <StatusBadge status={u.status}/>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={()=>setTransactModal('credit')}>
              <ArrowDownLeft className="mr-1.5 size-4"/>Credit
            </Button>
            <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={()=>setTransactModal('debit')}>
              <ArrowUpRight className="mr-1.5 size-4"/>Debit
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/users/$userId/edit" params={{userId:u.id}}><Pencil/>Edit User</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-7 xl:grid-cols-[1.3fr_1fr]">
        <section className="border-t pt-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Initials user={u}/>
              <div>
                <h2 className="font-semibold">Personal & account information</h2>
                <p className="text-xs text-muted-foreground">{u.role} · Registered {formatDate(u.joined)}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-secondary/50 px-4 py-2 text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Account Balance</p>
              <p className="text-2xl font-bold font-mono text-primary">{formatCurrency(u.balance || 0)}</p>
            </div>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            {[
              ['Full name',`${u.firstName} ${u.lastName}`],
              ['Email address',u.email],
              ['Phone number',u.phone||'Not provided'],
              ['Account balance', formatCurrency(u.balance || 0)],
              ['Date joined',formatDate(u.joined)],
              ['User ID',u.id],
              ['Assigned role',u.role],
              ['Verification',u.verified?'Verified':'Pending verification'],
              ['Last activity',formatDate(u.activity,true)]
            ].map(([a,b])=>(
              <div key={a}>
                <dt className="text-xs text-muted-foreground">{a}</dt>
                <dd className="mt-1 break-words text-sm font-medium">{b}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-t pt-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Wallet className="size-5 text-primary"/>Balance & Transaction Actions
          </h2>
          <p className="my-3 text-sm text-muted-foreground">
            Credit deposits or debit adjustments with custom narration notes directly to this user's account.
          </p>
          <div className="rounded-lg border bg-muted/40 p-4 mb-5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Available balance:</span>
              <span className="text-lg font-bold font-mono text-primary">{formatCurrency(u.balance || 0)}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" onClick={()=>setTransactModal('credit')}>
                <ArrowDownLeft className="mr-1 size-3.5"/>Credit Account
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 font-medium" onClick={()=>setTransactModal('debit')}>
                <ArrowUpRight className="mr-1 size-3.5"/>Debit Account
              </Button>
            </div>
          </div>

          <h3 className="font-semibold text-sm mt-6 mb-2 flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary"/>Security & Account Management
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">Change account verification status or remove user from directory.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={u.status==='Suspended'?'default':'destructive'} onClick={()=>setConfirm(u.status==='Suspended'?'Active':'Suspended')}>
              {u.status==='Suspended'?'Restore Account':'Suspend Account'}
            </Button>
            {u.status==='Pending'&& (
              <Button size="sm" variant="outline" onClick={()=>setConfirm('Active')}>Activate Account</Button>
            )}
            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={()=>setDel(true)}>
              <Trash2 className="size-3.5 mr-1"/>Delete User
            </Button>
          </div>
        </section>
      </div>

      <section className="mt-9 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Receipt className="size-5 text-primary" />Transaction History & Ledger
          </h2>
          <span className="text-xs text-muted-foreground">{userTransactions.length} records</span>
        </div>
        {userTransactions.length ? (
          <div className="overflow-x-auto rounded-lg border bg-background">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date (UTC)</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Narration</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {userTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(tx.date, true)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${tx.type === 'credit' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        <span className="size-1.5 rounded-full bg-current"/>
                        {tx.type === 'credit' ? 'CREDIT' : 'DEBIT'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium max-w-xs break-words">{tx.narration}</td>
                    <td className={`px-4 py-3 font-mono font-semibold text-xs whitespace-nowrap ${tx.type === 'credit' ? 'text-primary' : 'text-destructive'}`}>
                      {tx.type === 'credit' ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{tx.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">No transactions recorded for this account yet. Use the Credit or Debit buttons above to adjust the balance with custom narration.</p>
        )}
      </section>

      <section className="mt-9 border-t pt-6">
        <h2 className="mb-4 font-semibold">Activity history</h2>
        {events.filter(e=>e.target.includes(u.id) || e.target.includes(`${u.firstName} ${u.lastName}`)).map(e=>(
          <div key={e.id} className="flex flex-wrap justify-between gap-3 border-b py-4 text-sm">
            <span>{e.action}</span>
            <span className="text-xs text-muted-foreground">{formatDate(e.time,true)}</span>
          </div>
        ))}
      </section>

      <Dialog open={!!confirm} onOpenChange={open=>{if(!open)setConfirm(null);}}>
        <DialogContent className="admin-theme max-h-[85vh] w-[calc(100%-2rem)] overflow-auto rounded-lg">
          <DialogTitle>{confirm==='Suspended'?'Suspend this account?':'Activate this account?'}</DialogTitle>
          <DialogDescription>{confirm==='Suspended'?'The account will be marked as suspended.':'The account will be marked as active.'}</DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setConfirm(null)}>Cancel</Button>
            <Button variant={confirm==='Suspended'?'destructive':'default'} onClick={async()=>{if(confirm)await saveUser({...u,status:confirm},false);setConfirm(null);}}>Confirm {confirm==='Suspended'?'Suspension':'Activation'}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteDialog user={u} open={del} onOpenChange={setDel} onDeleted={()=>navigate({to:'/admin/users'})}/>
      <TransactDialog user={u} type={transactModal} open={!!transactModal} onOpenChange={open => { if(!open) setTransactModal(null); }} />
    </>
  );
}

function BackUsers() { return <Button variant="ghost" className="mb-4 px-0" asChild><Link to="/admin/users"><ArrowLeft/>Back to Users</Link></Button>; }

function MissingUser(){return <><BackUsers/><PageHeading title="User unavailable" description="This user no longer exists in the directory."/></>;}

export function UserForm({userId}: {userId?:string}) {
  const {users,saveUser}=useAdmin();
  const navigate=useNavigate();
  const existing=users.find(u=>u.id===userId);
  const [form,setForm]=useState({firstName:existing?.firstName||'',lastName:existing?.lastName||'',email:existing?.email||'',phone:existing?.phone||'',role:existing?.role||'Customer' as UserRole,status:existing?.status||'Pending' as UserStatus});
  const initial={firstName:existing?.firstName||'',lastName:existing?.lastName||'',email:existing?.email||'',phone:existing?.phone||'',role:existing?.role||'Customer',status:existing?.status||'Pending'};
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);
  const saved = useRef(false);
  const dirty=JSON.stringify(form)!==JSON.stringify(initial);
  const blocker=useBlocker({shouldBlockFn:()=>dirty&&!saved.current,enableBeforeUnload:dirty&&!saved.current,withResolver:true});
  if(userId&&!existing)return <MissingUser/>;
  const back=existing ? <Link to="/admin/users/$userId" params={{userId:existing.id}}><ArrowLeft/>Back to User Details</Link> : <Link to="/admin/users"><ArrowLeft/>Back to Users</Link>;

  return <>
    <Button variant="ghost" className="mb-4 px-0" asChild>{back}</Button>
    <PageHeading title={existing?'Edit User':'Add New User'} description="Enter the user's details below."/>
    <form className="max-w-3xl border-t pt-6" onSubmit={async e=>{
      e.preventDefault();
      if(saving)return;
      const message=validateUser(form,users,existing?.id);
      setError(message);
      if(message)return;
      setSaving(true);
      const u:AdminUser={...form,firstName:form.firstName.trim(),lastName:form.lastName.trim(),email:form.email.trim(),id:existing?.id||`VR-${crypto.randomUUID().slice(0,8)}`,joined:existing?.joined||new Date().toISOString(),activity:existing?.activity||null,verified:existing?.verified||false};
      const r=await saveUser(u,!existing);
      setSaving(false);
      if(!r.ok){setError(r.error);return;}
      saved.current=true;
      setTimeout(()=>navigate({to:'/admin/users/$userId',params:{userId:r.user.id}}),0);
    }}>
      <h2 className="mb-5 font-semibold">Personal information</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {(['firstName','lastName','email','phone'] as const).map(key=>(
          <label key={key} className="text-sm font-medium">
            {{firstName:'First Name *',lastName:'Last Name *',email:'Email Address *',phone:'Phone Number'}[key]}
            <input className="admin-field mt-2" required={key!=='phone'} type={key==='email'?'email':key==='phone'?'tel':'text'} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>
          </label>
        ))}
      </div>
      <h2 className="mb-5 mt-8 font-semibold">Account information</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">User Role
          <select className="admin-field mt-2" value={form.role} onChange={e=>setForm({...form,role:e.target.value as UserRole})}>
            {['Customer','Support','Admin','Auditor'].map(r=><option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Account Status
          <select className="admin-field mt-2" value={form.status} onChange={e=>setForm({...form,status:e.target.value as UserStatus})}>
            {['Pending','Active','Suspended'].map(r=><option key={r}>{r}</option>)}
          </select>
        </label>
      </div>
      {error&&<p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-7 flex gap-3">
        <Button type="submit" disabled={saving}>{saving?'Saving…':existing?'Save Changes':'Create User'}</Button>
        <Button variant="outline" type="button" asChild>
          {existing?<Link to="/admin/users/$userId" params={{userId:existing.id}}>Cancel</Link>:<Link to="/admin/users">Cancel</Link>}
        </Button>
      </div>
    </form>
    <Dialog open={blocker.status==='blocked'}>
      <DialogContent className="admin-theme w-[calc(100%-2rem)] rounded-lg">
        <DialogTitle>Discard unsaved changes?</DialogTitle>
        <DialogDescription>Your changes to this user have not been saved.</DialogDescription>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={()=>blocker.reset?.()}>Keep editing</Button>
          <Button variant="destructive" onClick={()=>blocker.proceed?.()}>Discard changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
