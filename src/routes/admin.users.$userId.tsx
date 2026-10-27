import { createFileRoute, Outlet } from '@tanstack/react-router';
export const Route = createFileRoute('/admin/users/$userId')({component:Outlet});