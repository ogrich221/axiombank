import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/components/admin/AdminPages';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/settings')({head:()=>adminHead('Settings'),component:SettingsPage});