import { createFileRoute } from '@tanstack/react-router';
import { BankPage } from '@/components/site/BankPage';
import { bankPageHead } from '@/lib/bank-pages';

export const Route = createFileRoute('/fees')({
  head: () => bankPageHead('fees'),
  component: Page,
});
function Page() { return <BankPage pageKey="fees" />; }
