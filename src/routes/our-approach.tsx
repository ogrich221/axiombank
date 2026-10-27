import { createFileRoute } from '@tanstack/react-router';
import { BankPage } from '@/components/site/BankPage';
import { bankPageHead } from '@/lib/bank-pages';

export const Route = createFileRoute('/our-approach')({
  head: () => bankPageHead('our-approach'),
  component: Page,
});
function Page() { return <BankPage pageKey="our-approach" />; }
