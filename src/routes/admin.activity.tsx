import { createFileRoute } from '@tanstack/react-router';
import { ActivityPage } from '@/components/admin/AdminPages';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/activity')({head:()=>adminHead('Activity Logs'),component:ActivityPage});