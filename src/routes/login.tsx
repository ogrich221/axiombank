import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/customer/AuthPage';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/login')({head: () => customerHead('Customer login', 'Sign in to your VARENTA customer workspace.'), component: AuthPage});
