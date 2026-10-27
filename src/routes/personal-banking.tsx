import { createFileRoute } from '@tanstack/react-router';
import { BankPage } from '@/components/site/BankPage';
import { bankPageHead } from '@/lib/bank-pages';

export const Route = createFileRoute('/personal-banking')({
  head: () => bankPageHead('personal-banking'),
  component: Page,
});
function Page() { return <BankPage pageKey="personal-banking" />; }
