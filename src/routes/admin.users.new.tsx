import { createFileRoute } from '@tanstack/react-router';
import { UserForm } from '@/components/admin/AdminUsers';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/users/new')({head:()=>adminHead('Add User'),component:Page});
function Page(){return <UserForm/>;}