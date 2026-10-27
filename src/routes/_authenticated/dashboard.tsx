import { createFileRoute } from '@tanstack/react-router';
import { CustomerLayout } from '@/components/customer/CustomerLayout';
export const Route = createFileRoute('/_authenticated/dashboard')({ component: CustomerLayout });
