import { createFileRoute } from '@tanstack/react-router';
import { TransferPage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/transfer')({ head: () => customerHead('Transfer money', 'Review a domestic transfer preview without sending money.'), component: Page });
function Page() { return <TransferPage/>; }
