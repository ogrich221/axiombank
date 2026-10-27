import { createFileRoute } from '@tanstack/react-router';
import { RolesPage } from '@/components/admin/AdminPages';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/roles')({head:()=>adminHead('Roles & Permissions'),component:RolesPage});