import { createFileRoute } from '@tanstack/react-router';
import { Registration } from '@/components/customer/Registration';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/open-account')({head: () => customerHead('Open your account', 'Start your AXIOM customer application in five clear steps.'), component: Registration});
