import { createFileRoute } from '@tanstack/react-router';
import { UsersPage } from '@/components/admin/AdminUsers';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/users/')({head:()=>adminHead('User Management'),component:UsersPage});