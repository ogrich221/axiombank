import { createFileRoute } from '@tanstack/react-router';
import { BankPage } from '@/components/site/BankPage';
import { bankPageHead } from '@/lib/bank-pages';

export const Route = createFileRoute('/spending-insights')({
  head: () => bankPageHead('spending-insights'),
  component: Page,
});
function Page() { return <BankPage pageKey="spending-insights" />; }
