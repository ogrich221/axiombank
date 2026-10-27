import { createFileRoute } from '@tanstack/react-router';
import { NotificationsPage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/notifications')({ head: () => customerHead('Notifications', 'View your application and verification status.'), component: Page });
function Page() { return <NotificationsPage/>; }
