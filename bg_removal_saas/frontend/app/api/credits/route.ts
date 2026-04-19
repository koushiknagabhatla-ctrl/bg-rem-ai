import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'No auth' }, { status: 401 });

        let finalAuth = authHeader;
        try {
            const token = authHeader.split(' ')[1];
            const payloadStr = Buffer.from(token.split('.')[1], 'base64').toString();
            const payload = JSON.parse(payloadStr);
            if (payload.email === process.env.ADMIN_EMAIL) {
                finalAuth = `Bearer ${process.env.ADMIN_API_KEY}`;
            }
        } catch (e) {}

        const res = await fetch(`${process.env.RENDER_API_URL}/me/credits`, {
            headers: { 'Authorization': finalAuth }
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
