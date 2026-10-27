import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { CustomerLoading } from '@/components/customer/CustomerControls';
export const Route = createFileRoute('/_authenticated')({ ssr: false, beforeLoad: async () => { const { data, error } = await supabase.auth.getUser(); if(error || !data.user) throw redirect({to:'/auth'}); }, component: Outlet, pendingComponent: CustomerLoading });
