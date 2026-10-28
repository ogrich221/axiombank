import { createFileRoute } from '@tanstack/react-router';
import { TransferReviewPage } from '@/components/admin/AdminTransferReview';
import { adminHead } from '@/lib/admin-demo';
export const Route = createFileRoute('/admin/transfer-review')({head:()=>adminHead('Transfer Review'),component:TransferReviewPage});
