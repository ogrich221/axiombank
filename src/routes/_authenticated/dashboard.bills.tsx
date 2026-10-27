import { createFileRoute } from '@tanstack/react-router';
import { BillsPage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/bills')({ head: () => customerHead('Pay bills', 'Check bill payment service availability.'), component: Page });
function Page() { return <BillsPage/>; }
