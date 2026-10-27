import { createFileRoute } from '@tanstack/react-router';
import { BankPage } from '@/components/site/BankPage';
import { bankPageHead } from '@/lib/bank-pages';

export const Route = createFileRoute('/help-center')({
  head: () => bankPageHead('help-center'),
  component: Page,
});
function Page() { return <BankPage pageKey="help-center" />; }
