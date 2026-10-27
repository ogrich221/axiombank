import { createFileRoute } from '@tanstack/react-router';
import { BankPage } from '@/components/site/BankPage';
import { bankPageHead } from '@/lib/bank-pages';

export const Route = createFileRoute('/contact')({
  head: () => bankPageHead('contact'),
  component: Page,
});
function Page() { return <BankPage pageKey="contact" />; }
