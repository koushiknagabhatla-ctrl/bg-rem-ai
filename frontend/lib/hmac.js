/**
 * HMAC Signature Generation (Server-Side Only)
 * 
 * This module runs ONLY in Next.js API routes (server-side).
 * The WEBHOOK_SECRET is NEVER sent to the browser.
 * 
 * Signature algorithm:
 *   message = "{timestamp}:{body_hash}"
 *   signature = HMAC-SHA256(WEBHOOK_SECRET, message)
 * 
 * The backend verifies this signature to prove the request
 * came from our Next.js frontend, not a direct API call.
 */

import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

/**
 * Generate HMAC-SHA256 signature for a request.
 * 
 * @param {Buffer|string} body - Request body
 * @returns {{ timestamp: string, signature: string, bodyHash: string }}
 */
export function generateSignature(body) {
  if (!WEBHOOK_SECRET) {
    throw new Error('WEBHOOK_SECRET not configured');
  }

  const timestamp = Date.now().toString();
  
  // SHA-256 hash of body
  const bodyHash = crypto
    .createHash('sha256')
    .update(body)
    .digest('hex');

  // HMAC-SHA256 signature
  const message = `${timestamp}:${bodyHash}`;
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(message)
    .digest('hex');

  return { timestamp, signature, bodyHash };
}

/**
 * Verify an HMAC-SHA256 signature.
 * Used for testing / webhook validation.
 */
export function verifySignature(timestamp, bodyHash, providedSignature) {
  if (!WEBHOOK_SECRET) return false;

  const message = `${timestamp}:${bodyHash}`;
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(message)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(providedSignature)
  );
}
