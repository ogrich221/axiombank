import { createFileRoute } from '@tanstack/react-router';
import { SecurityPage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/security')({ head: () => customerHead('Security & privacy', 'Manage your password and account security.'), component: Page });
function Page() { return <SecurityPage/>; }
