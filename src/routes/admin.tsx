import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout, AdminLoader } from '@/components/admin/AdminLayout';
export const Route = createFileRoute('/admin')({component:AdminLayout,pendingComponent:AdminLoader});