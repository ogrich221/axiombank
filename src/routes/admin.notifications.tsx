import { createFileRoute } from '@tanstack/react-router';
import { NotificationsPage } from '@/components/admin/AdminPages';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/notifications')({head:()=>adminHead('Notifications'),component:NotificationsPage});