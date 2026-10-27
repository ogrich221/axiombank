import { createFileRoute } from '@tanstack/react-router';
import { HelpPage } from '@/components/admin/AdminPages';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/help')({head:()=>adminHead('Help & Support'),component:HelpPage});