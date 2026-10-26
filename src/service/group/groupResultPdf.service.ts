/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";
import { serverFetch } from '@/lib/server-fetch';

type GenerateGroupResultPdfResult =
  | { success: true; pdfBase64: string; filename: string }
  | { success: false; message: string };

/**
 * Pulls the filename out of a Content-Disposition header, handling both
 * the plain quoted form (filename="x.pdf") and the RFC 5987 encoded form
 * (filename*=UTF-8''x.pdf) that some proxies/CDNs rewrite it to.
 */
function extractFilename(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;

  const encodedMatch = disposition.match(/filename\*=(?:UTF-8''|utf-8'')?([^;]+)/i);
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1].trim().replace(/^"|"$/g, ''));
    } catch {
      // fall through to plain match below
    }
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1]?.trim() ?? fallback;
}

export async function generateGroupResultPdf(
  groupId: string | number
): Promise<GenerateGroupResultPdfResult> {
  try {
    const response = await serverFetch.get(`/group-result-pdf/${groupId}`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return {
        success: false,
        message: errorBody?.message ?? `Failed to generate report (${response.status})`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();

    if (!arrayBuffer.byteLength) {
      return { success: false, message: 'Received an empty PDF from the server.' };
    }

    const pdfBase64 = Buffer.from(arrayBuffer).toString('base64');

    const filename = extractFilename(
      response.headers.get('Content-Disposition'),
      `group-${groupId}-result.pdf`,
    );

    return { success: true, pdfBase64, filename };
  } catch (error: any) {
    return { success: false, message: error?.message ?? 'Failed to generate report.' };
  }
}