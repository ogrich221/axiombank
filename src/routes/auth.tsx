import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/customer/AuthPage';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/auth')({ head: () => customerHead('Sign in', 'Secure access to your AXIOM account.'), component: Page });
function Page() {return <AuthPage/>;}
