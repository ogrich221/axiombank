import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/profile')({ head: () => customerHead('My profile', 'Manage your VARENTA customer information and photo.'), component: Page });
function Page() { return <ProfilePage/>; }
