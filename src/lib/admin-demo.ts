export type UserStatus = 'Active' | 'Pending' | 'Suspended';
export type UserRole = 'Customer' | 'Support' | 'Admin' | 'Auditor';
export interface AdminUser { id: string; firstName: string; lastName: string; email: string; phone: string; role: UserRole; status: UserStatus; joined: string; activity: string | null; verified: boolean; }
export interface AdminEvent { id: string; actor: string; action: string; target: string; time: string; outcome: string; }
const names = [['Olivia','Bennett'],['James','Wilson'],['Emma','Thompson'],['Noah','Anderson'],['Sophia','Martinez'],['Liam','Chen'],['Isabella','Taylor'],['Oliver','Davis'],['Mia','Robinson'],['Ethan','Clark'],['Amelia','Lewis'],['Lucas','Walker'],['Charlotte','Young'],['Henry','Allen'],['Harper','King'],['Daniel','Wright'],['Evelyn','Scott'],['Alexander','Green'],['Abigail','Baker'],['Benjamin','Adams'],['Ella','Nelson'],['Jack','Carter'],['Grace','Mitchell'],['Leo','Turner']];
export const sampleUsers: AdminUser[] = names.map(([firstName,lastName], i) => ({ id: `VR-${String(1042+i).padStart(6,'0')}`, firstName, lastName, email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`, phone: '', role: i === 6 ? 'Support' : i === 12 ? 'Auditor' : 'Customer', status: i % 7 === 4 ? 'Suspended' : i % 5 === 2 ? 'Pending' : 'Active', joined: `2026-10-${String(26-i).padStart(2,'0')}T09:00:00Z`, activity: i % 5 === 2 ? null : `2026-10-27T${String(18-i%8).padStart(2,'0')}:24:00Z`, verified: i % 5 !== 2 }));
export const sampleEvents: AdminEvent[] = sampleUsers.slice(0,6).map((u,i) => ({id:`event-${i}`, actor:'Sample administrator', action: i%2 ? 'Profile updated' : 'User created', target:`${u.firstName} ${u.lastName}`, time:`2026-10-27T${18-i}:12:00Z`,outcome:'Success'}));
export interface UserFilters { query: string; status: string; role: string; from: string; to: string; sort: string; }
export const emptyFilters: UserFilters = { query:'', status:'All', role:'All', from:'', to:'', sort:'newest' };
export function filterUsers(users: AdminUser[], filters: UserFilters) {
  const q = filters.query.trim().toLowerCase();
  return users.filter(u => `${u.firstName} ${u.lastName} ${u.email} ${u.id}`.toLowerCase().includes(q) && (filters.status === 'All' || u.status === filters.status) && (filters.role === 'All' || u.role === filters.role) && (!filters.from || u.joined.slice(0,10) >= filters.from) && (!filters.to || u.joined.slice(0,10) <= filters.to)).sort((a,b) => filters.sort === 'name' ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) : filters.sort === 'oldest' ? a.joined.localeCompare(b.joined) : b.joined.localeCompare(a.joined));
}
export function validateUser(user: Pick<AdminUser,'firstName'|'lastName'|'email'>, users: AdminUser[], id?: string) {
  if (!user.firstName.trim() || !user.lastName.trim()) return 'First and last name are required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())) return 'Enter a valid email address.';
  if (users.some(u => u.id !== id && u.email.toLowerCase() === user.email.trim().toLowerCase())) return 'A sample user with this email already exists.';
  return '';
}
export function formatDate(value: string | null, withTime = false) { return value ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric', ...(withTime ? {hour:'2-digit',minute:'2-digit',timeZoneName:'short'} : {}),timeZone:'UTC'}).format(new Date(value)) : 'Not recorded'; }
export function adminHead(title: string) { const full = `${title} | VARENTA Admin`; const description = `VARENTA BANK administrative workspace — ${title.toLowerCase()}. Sample-data workspace, not a live banking service.`; return {meta:[{title:full},{name:'description',content:description},{property:'og:title',content:full},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex, nofollow'}]}; }