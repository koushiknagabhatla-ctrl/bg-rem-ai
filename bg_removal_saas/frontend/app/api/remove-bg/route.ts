import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Vercel Serverless Function settings
export const maxDuration = 60; // 60 seconds

export async function POST(req: Request) {
    try {
        // A) Validate Environment Variables instantly before doing any work
        if (!process.env.RENDER_API_URL) return NextResponse.json({ error: 'RENDER_API_URL not configured' }, { status: 500 });
        if (!process.env.WEBHOOK_SECRET) return NextResponse.json({ error: 'WEBHOOK_SECRET not configured' }, { status: 500 });
        if (!process.env.ADMIN_EMAIL) return NextResponse.json({ error: 'ADMIN_EMAIL not configured' }, { status: 500 });
        // ADMIN_API_KEY is technically optional but strongly suggested
        
        // Remove trailing slash if present
        const renderUrl = process.env.RENDER_API_URL.endsWith('/') 
            ? process.env.RENDER_API_URL.slice(0, -1) 
            : process.env.RENDER_API_URL;

        // B) Read formData directly
        const formData = await req.formData();
        const imageFile = formData.get('image') as File;
        if (!imageFile) {
            return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
        }

        // C) Authentication header extraction
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'No authorization header provided' }, { status: 401 });
        }

        // Determine if Admin bypass
        let finalAuth = authHeader;
        try {
            const token = authHeader.split(' ')[1];
            if (token) {
                const payloadStr = Buffer.from(token.split('.')[1], 'base64').toString();
                const payload = JSON.parse(payloadStr);
                if (payload.email === process.env.ADMIN_EMAIL && process.env.ADMIN_API_KEY) {
                    finalAuth = `Bearer ${process.env.ADMIN_API_KEY}`;
                }
            }
        } catch (e) {
            // Ignore token parse errors here; backend will reject invalid tokens natively
        }

        // D) Generate HMAC Signature
        const timestamp = Date.now().toString();
        let signature = "";
        try {
            const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
            const bodyHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
            signature = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET)
                .update(`${timestamp}:${bodyHash}`)
                .digest('hex');
        } catch (sigErr: any) {
            return NextResponse.json({ error: `HMAC Signature failed: ${sigErr.message}` }, { status: 500 });
        }

        // E) Forward to Render Backend with 60s Timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const forwardForm = new FormData();
        forwardForm.append('image', imageFile);

        let response;
        try {
            response = await fetch(`${renderUrl}/remove-bg`, {
                method: 'POST',
                headers: {
                    'Authorization': finalAuth,
                    'X-Timestamp': timestamp,
                    'X-Signature': signature,
                },
                body: forwardForm,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            if (fetchErr.name === 'AbortError') {
                return NextResponse.json({ error: 'Backend timeout - Render may be waking up, try again' }, { status: 504 });
            }
            return NextResponse.json({ error: `Fetch to backend failed: ${fetchErr.message}` }, { status: 500 });
        }

        // F) Handle backend response gracefully
        if (!response.ok) {
            const text = await response.text();
            let errObj;
            try { errObj = JSON.parse(text); } catch (e) { errObj = { detail: text.substring(0, 200) }; }
            return NextResponse.json(
                { error: errObj.detail || errObj.error || `Backend returned ${response.status}` },
                { status: response.status }
            );
        }

        // G) Success return
        let responseData;
        try {
            responseData = await response.json();
        } catch (jsonErr: any) {
            return NextResponse.json({ error: 'Backend returned invalid JSON' }, { status: 500 });
        }
        
        return NextResponse.json(responseData, { status: 200 });

    } catch (error: any) {
        // Last line defense against total crashes
        console.error("API Route Fatal Error:", error);
        return NextResponse.json({ error: `Internal API Error: ${error.message}` }, { status: 500 });
    }
}
