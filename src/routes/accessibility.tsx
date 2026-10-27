import { createFileRoute } from '@tanstack/react-router';
import { BankPage } from '@/components/site/BankPage';
import { bankPageHead } from '@/lib/bank-pages';

export const Route = createFileRoute('/accessibility')({
  head: () => bankPageHead('accessibility'),
  component: Page,
});
function Page() { return <BankPage pageKey="accessibility" />; }
