import { createFileRoute } from '@tanstack/react-router';
import { UserForm } from '@/components/admin/AdminUsers';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/users/$userId/edit')({head:()=>adminHead('Edit User'),component:Page});
function Page(){const {userId}=Route.useParams();return <UserForm userId={userId}/>;}