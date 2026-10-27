import { createFileRoute } from '@tanstack/react-router';
import { Overview } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/')({ head: () => customerHead('Overview', 'Your personal VARENTA customer overview.'), component: Page });
function Page() { return <Overview/>; }
