import { createFileRoute } from '@tanstack/react-router';
import { BankPage } from '@/components/site/BankPage';
import { bankPageHead } from '@/lib/bank-pages';

export const Route = createFileRoute('/cookie-preferences')({
  head: () => bankPageHead('cookie-preferences'),
  component: Page,
});
function Page() { return <BankPage pageKey="cookie-preferences" />; }
