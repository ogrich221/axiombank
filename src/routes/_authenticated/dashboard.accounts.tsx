import { createFileRoute } from '@tanstack/react-router';
import { AccountsPage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/accounts')({ head: () => customerHead('Accounts', 'View your VARENTA account availability.'), component: Page });
function Page() { return <AccountsPage/>; }
