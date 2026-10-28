import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { emptyFilters, type AdminUser, type AdminEvent, type UserFilters, type UserTransaction } from '@/lib/admin-demo';
import type { AdminApplication } from '@/lib/customer-account-state';
import { getAdminData, saveAdminUser, deleteAdminUser, lockAdmin, adjustUserBalance } from '@/lib/admin.functions';

interface Workspace {
  applications: AdminApplication[];
  refresh: () => Promise<void>;
  users: AdminUser[];
  events: AdminEvent[];
  transactions: UserTransaction[];
  loaded: boolean;
  filters: UserFilters;
  setFilters: (value: UserFilters) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  saveUser: (user: AdminUser, isNew: boolean) => Promise<{ok:true;user:AdminUser}|{ok:false;error:string}>;
  deleteUser: (user: AdminUser) => Promise<boolean>;
  transactUser: (params: { userId: string; type: 'credit' | 'debit'; amount: number; narration: string; date?: string }) => Promise<{ ok: boolean; error?: string; message?: string }>;
  notice: string;
  setNotice: (value: string) => void;
  logout: () => Promise<void>;
  read: boolean;
  setRead: (value: boolean) => void;
}

const AdminContext = createContext<Workspace | null>(null);

export function AdminProvider({children, onLocked}: {children: ReactNode; onLocked: () => void}) {
  const [applications,setApplications] = useState<AdminApplication[]>([]);
  const [users,setUsers] = useState<AdminUser[]>([]);
  const [events,setEvents] = useState<AdminEvent[]>([]);
  const [transactions,setTransactions] = useState<UserTransaction[]>([]);
  const [loaded,setLoaded] = useState(false);
  const [filters,setFilters] = useState(emptyFilters);
  const [page,setPage] = useState(1);
  const [pageSize,setPageSize] = useState(10);
  const [notice,setNotice] = useState('');
  const [read,setRead] = useState(false);

  const load = useServerFn(getAdminData);
  const save = useServerFn(saveAdminUser);
  const remove = useServerFn(deleteAdminUser);
  const lock = useServerFn(lockAdmin);
  const transact = useServerFn(adjustUserBalance);

  const refresh = useCallback(async () => {
    try {
      const d = await load();
      setUsers(d.users);
      setApplications(d.applications);
      setEvents(d.events);
      setTransactions(d.transactions || []);
      setLoaded(true);
    } catch {
      onLocked();
    }
  }, [load, onLocked]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function saveUser(user: AdminUser, isNew: boolean) {
    const r = await save({ data: { user, isNew } });
    if (r.ok) {
      setNotice(isNew ? 'User created.' : 'Changes saved.');
      await refresh();
    }
    return r;
  }

  async function deleteUser(user: AdminUser) {
    const r = await remove({ data: { id: user.id } });
    if (r.ok) {
      setNotice(`${user.firstName} ${user.lastName} was deleted.`);
      await refresh();
    }
    return r.ok;
  }

  async function transactUser(params: { userId: string; type: 'credit' | 'debit'; amount: number; narration: string; date?: string }) {
    const r = await transact({ data: params });
    if (r.ok) {
      setNotice(r.message || `Account successfully ${params.type}ed.`);
      await refresh();
    }
    return r;
  }

  async function logout() {
    await lock();
    onLocked();
  }

  return (
    <AdminContext.Provider value={{
      applications, refresh, users, events, transactions, loaded, filters, setFilters,
      page, setPage, pageSize, setPageSize, saveUser, deleteUser, transactUser,
      notice, setNotice, logout, read, setRead
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error('Admin workspace provider is missing');
  return value;
}
