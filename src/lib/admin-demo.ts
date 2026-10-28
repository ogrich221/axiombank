export type UserStatus = 'Active' | 'Pending' | 'Suspended';
export type UserRole = 'Customer' | 'Support' | 'Admin' | 'Auditor';
export interface AdminUser { id: string; firstName: string; lastName: string; email: string; phone: string; role: UserRole; status: UserStatus; joined: string; activity: string | null; verified: boolean; balance?: string; }
export interface AdminEvent { id: string; actor: string; action: string; target: string; time: string; outcome: string; }
export interface UserTransaction { id: string; userId: string; type: 'credit' | 'debit'; amount: number; narration: string; date: string; reference: string; status: 'Completed' | 'Pending' | 'Failed'; balanceAfter?: number; }
export interface UserFilters { query: string; status: string; role: string; from: string; to: string; sort: string; }
export const emptyFilters: UserFilters = { query:'', status:'All', role:'All', from:'', to:'', sort:'newest' };
export function formatCurrency(amount: number | string) { const num = typeof amount === 'number' ? amount : parseFloat(amount || '0'); return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(num) ? 0 : num); }
export function filterUsers(users: AdminUser[], filters: UserFilters) {
  const q = filters.query.trim().toLowerCase();
  return users.filter(u => `${u.firstName} ${u.lastName} ${u.email} ${u.id}`.toLowerCase().includes(q) && (filters.status === 'All' || u.status === filters.status) && (filters.role === 'All' || u.role === filters.role) && (!filters.from || u.joined.slice(0,10) >= filters.from) && (!filters.to || u.joined.slice(0,10) <= filters.to)).sort((a,b) => filters.sort === 'name' ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) : filters.sort === 'oldest' ? a.joined.localeCompare(b.joined) : b.joined.localeCompare(a.joined));
}
export function validateUser(user: Pick<AdminUser,'firstName'|'lastName'|'email'>, users: AdminUser[], id?: string) {
  if (!user.firstName.trim() || !user.lastName.trim()) return 'First and last name are required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())) return 'Enter a valid email address.';
  if (users.some(u => u.id !== id && u.email.toLowerCase() === user.email.trim().toLowerCase())) return 'A user with this email already exists.';
  return '';
}
export function formatDate(value: string | null, withTime = false) { return value ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric', ...(withTime ? {hour:'2-digit',minute:'2-digit',timeZoneName:'short'} : {}),timeZone:'UTC'}).format(new Date(value)) : 'Not recorded'; }
export function adminHead(title: string) { const full = `${title} | AXIOM Admin`; const description = `AXIOM BANK administrative workspace — ${title.toLowerCase()}.`; return {meta:[{title:full},{name:'description',content:description},{property:'og:title',content:full},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex, nofollow'}]}; }