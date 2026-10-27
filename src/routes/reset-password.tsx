import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/customer/AuthPage';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/reset-password')({ head: () => customerHead('Reset password', 'Secure access to your VARENTA account.'), component: Page });
function Page() {return <AuthPage recovery/>;}
