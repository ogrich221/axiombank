import { createServerFn } from '@tanstack/react-start';
import { requireUnlocked } from './admin.functions';
import { transferReviewInputSchema } from './transfer-review';

export const reviewPendingTransfer = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => transferReviewInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireUnlocked();
    const { reviewTransferDetails, TransferReviewError } = await import('./transfer-review.server');
    try {
      return { review: await reviewTransferDetails(data.details), error: null as string | null };
    } catch (error) {
      return { review: null, error: error instanceof TransferReviewError ? error.message : 'The AI review could not be completed.' };
    }
  });
