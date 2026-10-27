import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/components/admin/AdminPages';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/')({head:()=>adminHead('Dashboard'),component:DashboardPage});