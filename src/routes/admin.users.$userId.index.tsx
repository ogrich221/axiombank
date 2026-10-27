import { createFileRoute } from '@tanstack/react-router';
import { UserProfile } from '@/components/admin/AdminUsers';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/users/$userId/')({head:()=>adminHead('User Profile'),component:Page});
function Page(){const {userId}=Route.useParams();return <UserProfile userId={userId}/>;}