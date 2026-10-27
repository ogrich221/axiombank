import { createFileRoute } from '@tanstack/react-router';
import { CardsPage } from '@/components/customer/CustomerPages';
import { customerHead } from '@/lib/customer-schemas';
export const Route = createFileRoute('/_authenticated/dashboard/cards')({ head: () => customerHead('My cards', 'Review card availability and a masked card preview.'), component: Page });
function Page() { return <CardsPage/>; }
