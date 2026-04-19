/**
 * Next.js API Route: /api/remove-bg
 * ===================================
 * 
 * THIS IS THE SECURITY CORNERSTONE.
 * 
 * Flow:
 *   Browser → /api/remove-bg (this file, on Vercel) → Render backend
 * 
 * Why this matters:
 *   - Browser NEVER sees the Render API URL
 *   - WEBHOOK_SECRET stays server-side (never in browser)
 *   - HMAC signature proves request came from YOUR frontend
 *   - Even if someone inspects network tab, they can't bypass this
 * 
 * What this route does:
 *   1. Receives image upload from browser
 *   2. Generates HMAC-SHA256 signature (server-side)
 *   3. Forwards to Render backend with signature + JWT
 *   4. Streams the result PNG back to browser
 * 
 * Vercel serverless function limits:
 *   - 4.5MB request body (free), 50MB (pro)
 *   - 10s execution (free), 60s (pro)
 *   - For larger files, consider direct upload with signed URLs
 */

import { generateSignature } from '../../lib/hmac';

// Disable Next.js body parsing — we handle raw bytes
export const config = {
  api: {
    bodyParser: false,
  },
};

const RENDER_API_URL = process.env.RENDER_API_URL;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!RENDER_API_URL) {
    console.error('RENDER_API_URL not configured');
    return res.status(500).json({ error: 'Backend not configured' });
  }

  try {
    // ── Step 1: Read raw request body ──
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    if (body.length === 0) {
      return res.status(400).json({ error: 'Empty request body' });
    }

    // Check size limit (20MB)
    if (body.length > 20 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large (max 20MB)' });
    }

    // ── Step 2: Generate HMAC signature ──
    // This proves to the backend that this request came from
    // our Next.js server, not a direct API call
    const { timestamp, signature } = generateSignature(body);

    // ── Step 3: Forward to Render backend ──
    // Pass through the user's Authorization header (JWT)
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/octet-stream',
      'X-Timestamp': timestamp,
      'X-Signature': signature,
    };

    // Forward JWT from user's request
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const backendResponse = await fetch(`${RENDER_API_URL}/remove-bg`, {
      method: 'POST',
      headers,
      body,
      // 30 second timeout for inference
      signal: AbortSignal.timeout(30000),
    });

    // ── Step 4: Handle backend response ──
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { detail: errorText };
      }

      return res.status(backendResponse.status).json({
        error: errorJson.detail || 'Backend processing failed',
        status: backendResponse.status,
      });
    }

    // ── Step 5: Stream PNG result back to browser ──
    const contentType = backendResponse.headers.get('content-type');
    const inferenceTime = backendResponse.headers.get('x-inference-time');
    const creditsRemaining = backendResponse.headers.get('x-credits-remaining');
    const rateLimitRemaining = backendResponse.headers.get('x-rate-limit-remaining');

    res.setHeader('Content-Type', contentType || 'image/png');
    res.setHeader('Content-Disposition', 
      backendResponse.headers.get('content-disposition') || 'inline; filename="result.png"'
    );

    // Forward metadata headers to browser
    if (inferenceTime) res.setHeader('X-Inference-Time', inferenceTime);
    if (creditsRemaining) res.setHeader('X-Credits-Remaining', creditsRemaining);
    if (rateLimitRemaining) res.setHeader('X-Rate-Limit-Remaining', rateLimitRemaining);

    // Stream the response body
    const arrayBuffer = await backendResponse.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));

  } catch (error) {
    console.error('API proxy error:', error);

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Backend timeout — try a smaller image' });
    }

    return res.status(500).json({ error: 'Internal proxy error' });
  }
}
