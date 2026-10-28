import { createOpenAI } from '@ai-sdk/openai';
import { NoObjectGeneratedError, Output, streamText } from 'ai';
import { requiredReviewItems, transferReviewResultSchema, normalizeReview, type TransferReviewResult } from './transfer-review';

const GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1';
const MODEL = 'openai/gpt-6-astra';
const RUN_ID_HEADER = 'X-Lovable-AIG-Run-ID';

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
    const response = await fetch(input, { ...init, headers });
    runId ??= response.headers.get(RUN_ID_HEADER)?.trim() || undefined;
    return response;
  };
}

const instructions = `You help AXIOM BANK administrators review pending transfer requests before they decide on them.
Summarize the request in 2-3 plain sentences. Extract sender, recipient, amount (with currency) and destination bank/country when present, otherwise null.
Flag every missing or unclear item from this checklist: ${requiredReviewItems.join('; ')}. For each, say briefly why the reviewer needs it.
List concerns worth a human look (mismatched names, unusual amounts, vague purpose, inconsistent details) — at most 6, no speculation beyond the text.
readiness: "ready" only when nothing on the checklist is missing; "escalate" for serious concerns; otherwise "needs_information".
You never approve or reject transfers; the administrator decides.`;

export class TransferReviewError extends Error {}

export async function reviewTransferDetails(details: string): Promise<TransferReviewResult> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new TransferReviewError('AI review is not configured.');
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' },
    fetch: runIdFetch(),
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    messages: [{ role: 'user', content: `Pending transfer details provided by the administrator:\n\n${details}` }],
    output: Output.object({ schema: transferReviewResultSchema }),
    maxRetries: 0,
    onError: ({ error }) => { failure = error; },
    providerOptions: {
      openai: { forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] },
    },
  });
  try {
    return normalizeReview(await result.output);
  } catch (error) {
    const cause = failure ?? error;
    console.error('Transfer review failed', cause);
    const status = (cause as { statusCode?: number })?.statusCode;
    if (status === 402) throw new TransferReviewError('AI credits have run out. Add credits in Settings → Plans & credits, then try again.');
    if (status === 429) throw new TransferReviewError('The AI service is busy. Please wait a moment and try again.');
    if (status === 403) throw new TransferReviewError('AI review is not available for this workspace right now.');
    if (NoObjectGeneratedError.isInstance(error)) throw new TransferReviewError('The AI could not produce a structured review. Try adding clearer details.');
    throw new TransferReviewError('The AI review could not be completed. Please try again.');
  }
}
