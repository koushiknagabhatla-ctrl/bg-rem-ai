# Deployment Guide

Follow this strictly to deploy your background removal SaaS to production.

## STEP 1 — Generate Secrets
Generate two secrets via Node.js in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run this twice to get your `ADMIN_API_KEY` and `WEBHOOK_SECRET`.

## STEP 2 — Supabase Setup
1. Go to supabase.com -> Create/Open Project.
2. Go to **SQL Editor**, paste the contents of `database/schema.sql` and run it.
3. Go to **Authentication -> Providers**, enable Google and Email (Magic Link).
4. Save your **Project URL**, **anon key**, and **service_role key**.

## STEP 3 — Cloudinary Setup
1. Go to cloudinary.com.
2. Save your **Cloud Name**, **API Key**, and **API Secret**.
3. Create a folder named `bg-removal-results` in your media library.

## STEP 4 — Deploy Backend to Render
1. Push the `/backend` folder to a private GitHub repo.
2. Go to render.com -> New Web Service, connect your repo.
3. Environment: `Docker`. Plan: `Starter ($7/month)`.
4. Add Disk: Name=`model`, Mount Path=`/app/model`, Size=`1GB`.
5. Add all Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `ADMIN_API_KEY`
   - `ADMIN_EMAIL` = `koushiknagabhatla@gmail.com`
   - `WEBHOOK_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `MODEL_PATH` = `/app/model/model_fp32.onnx`
6. Deploy. Keep the window open.
7. Important: Once live, go to Disks in your Render dashboard and manually upload `model_fp32.onnx` into `/app/model/`.

## STEP 5 — Test Backend
Run `curl https://your-app.onrender.com/health`.
Should return `{"status":"ok","model_loaded":true}`.

## STEP 6 — Deploy Frontend to Vercel
1. Push the `/frontend` folder to a private GitHub repo.
2. Go to vercel.com -> Add New Project, import the repo.
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RENDER_API_URL` = `https://your-app.onrender.com`
   - `WEBHOOK_SECRET` (Must match Render identically)
   - `ADMIN_API_KEY` (Must match Render identically)
   - `ADMIN_EMAIL` = `koushiknagabhatla@gmail.com`
4. Deploy and copy your Vercel URL.

## STEP 7 — Connect Supabase & Google
1. In Supabase, go to Auth -> URL Configuration.
2. Set Site URL to `https://your-app.vercel.app`.
3. Add Redirect URL `https://your-app.vercel.app/auth/callback`.
4. In Google Cloud Console, add `https://your-supabase-id.supabase.co/auth/v1/callback` to authorized redirect URIs.

## Test Everything
1. Go to your vercel URL.
2. Sign in with `koushiknagabhatla@gmail.com`. You will see the "∞ Unlimited" badge!
3. All credit logic perfectly triggers on other email addresses.

## Common Error Fixes
- **401 Invalid signature**: Handshakes misaligned. `WEBHOOK_SECRET` must be exactly identical on Render & Vercel.
- **404 model not found**: Did you actually upload the ONNX model to the Render Disk? Ensure it is `/app/model/model_fp32.onnx`.
- **CORS blocked**: Add Vercel URL to Fastapi CORS setup in `main.py` if not using the exact domain specified.
- **402 on Admin**: Your `ADMIN_EMAIL` in Render environment variables must match login perfectly.

Enjoy your production-ready AI SaaS!
