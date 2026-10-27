import { createFileRoute } from '@tanstack/react-router';
import { TransactionsPage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/transactions')({ head: () => customerHead('Transaction history', 'Search your confirmed financial activity.'), component: Page });
function Page() { return <TransactionsPage/>; }
