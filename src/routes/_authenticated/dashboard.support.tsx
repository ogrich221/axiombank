import { createFileRoute } from '@tanstack/react-router';
import { SupportPage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/support')({ head: () => customerHead('Help & support', 'Get help with your AXIOM customer account.'), component: Page });
function Page() { return <SupportPage/>; }
