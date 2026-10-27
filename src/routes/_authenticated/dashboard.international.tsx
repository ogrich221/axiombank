import { createFileRoute } from '@tanstack/react-router';
import { TransferPage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/international')({ head: () => customerHead('International transfers', 'Review international service and destination availability.'), component: Page });
function Page() { return <TransferPage international/>; }
