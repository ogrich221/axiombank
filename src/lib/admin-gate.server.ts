import { useSession, setResponseHeader } from '@tanstack/react-start/server';

/** Same passcode session as admin.functions.ts (cookie axiom-admin). */
export async function requireAdminUnlocked() {
  setResponseHeader('Cache-Control', 'no-store');
  const password = process.env['SESSION_SECRET'];
  if (!password) throw new Error('SESSION_SECRET is not set');
  const session = await useSession<{ unlocked?: boolean }>({ password, name: 'axiom-admin', maxAge: 60 * 60 * 8, cookie: { httpOnly: true, secure: true, sameSite: 'lax', path: '/' } });
  if (!session.data.unlocked) throw new Error('Admin passcode required');
}
