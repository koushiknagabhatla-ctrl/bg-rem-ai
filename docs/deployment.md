# Deployment Guide

Step-by-step deployment from training to production.
Total cost: **$7/month** (Render Starter). Everything else is free tier.

---

## Step 1 — Supabase Setup

1. Create a project at **[supabase.com](https://supabase.com)** → New Project
2. Go to **SQL Editor** → New Query → paste contents of `database/schema.sql` → **Run**
3. Go to **Authentication → Providers** → enable:
   - **Google**: Get OAuth credentials from [console.cloud.google.com](https://console.cloud.google.com)
     - Create OAuth 2.0 Client ID (Web Application)
     - Authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
   - **Email** (Magic Link): enabled by default
4. Go to **Authentication → Email Templates** → customize the welcome email
5. Copy these values (Settings → API):
   - **Project URL**: `https://<your-project>.supabase.co`
   - **anon key**: starts with `eyJhbG...` (public, safe for frontend)
   - **service_role key**: starts with `eyJhbG...` (**SECRET**, backend only!)

### Verify

- Check Tables tab: `users`, `user_credits`, `usage_log` exist
- Check Database → Functions: `handle_new_user`, `deduct_credits`, `refund_credits` exist

---

## Step 2 — Upstash Redis Setup

1. Create account at **[upstash.com](https://upstash.com)** → Create Database
2. Choose region matching your Render deployment (e.g., Frankfurt `eu-west-1`)
3. Copy:
   - **REST URL**: `https://<your-instance>.upstash.io`
   - **REST Token**: the long token string

Free tier: 10,000 commands/day (enough for ~500 image removals/day).

---

## Step 3 — Generate Your Secrets

Run in terminal:

```bash
# Generate two unique 32-byte hex secrets
echo "ADMIN_API_KEY=$(openssl rand -hex 32)"
echo "WEBHOOK_SECRET=$(openssl rand -hex 32)"
```

**Save these somewhere safe** (password manager, 1Password, etc).
These two values must match between frontend (Vercel env) and backend (Render env).

---

## Step 4 — Train the Model (Kaggle)

1. Go to [kaggle.com/code](https://kaggle.com/code) → New Notebook
2. Add dataset: search for `tapakah68/human-segmentation` → Add
3. Enable GPU: Settings → Accelerator → GPU P100
4. Paste or upload `notebooks/train_kaggle.ipynb`
5. Run all cells → wait for training to complete (~10-15 hours)
6. Download from Output tab:
   - `exports/model_int8.onnx` (the production model)
   - `exports/model_config.json` (metadata)

**Important**: NEVER upload `.onnx` to a public repository.

---

## Step 5 — Deploy Backend to Render

1. Push `backend/` folder to a **private** GitHub repository
2. Go to **[render.com](https://render.com)** → New → Web Service → Connect repo
3. Settings:
   - **Name**: `bg-removal-api`
   - **Root Directory**: `backend` (or wherever Dockerfile is)
   - **Runtime**: Docker
   - **Plan**: Starter ($7/mo) — always on, never sleeps
   - **Health Check Path**: `/health`
4. Add persistent disk:
   - Name: `model-storage`
   - Mount Path: `/app/model`
   - Size: 1 GB
5. Upload `model_int8.onnx` to the disk at `/app/model/model_int8.onnx`
6. Set **Environment Variables** in Render dashboard:

```
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...<service_role_key>
UPSTASH_REDIS_URL=https://<instance>.upstash.io
UPSTASH_REDIS_TOKEN=<your-token>
ADMIN_API_KEY=<from step 3>
ADMIN_EMAIL=koushiknagabhatla@gmail.com
WEBHOOK_SECRET=<from step 3>
MODEL_PATH=/app/model/model_int8.onnx
ALLOWED_ORIGINS=https://<your-frontend>.vercel.app
ENV=production
PORT=10000
```

### Verify Backend

```bash
# Health check
curl https://bg-removal-api.onrender.com/health
# → {"status":"ok","model_ready":true}

# Admin test (direct)
curl -X POST \
  -H "Authorization: Bearer <YOUR_ADMIN_API_KEY>" \
  -F "image=@test.jpg" \
  https://bg-removal-api.onrender.com/remove-bg \
  --output result.png
```

---

## Step 6 — Deploy Frontend to Vercel

1. Push `frontend/` folder to GitHub
2. Go to **[vercel.com](https://vercel.com)** → Import Git Repository
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
4. Set **Environment Variables** in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...<anon_key>
SUPABASE_SERVICE_KEY=eyJhbG...<service_role_key>
RENDER_API_URL=https://bg-removal-api.onrender.com
ADMIN_API_KEY=<same as Render>
WEBHOOK_SECRET=<same as Render>
ADMIN_EMAIL=koushiknagabhatla@gmail.com
```

5. Deploy → wait for "Ready"
6. Update Supabase redirect URLs:
   - Supabase Dashboard → Authentication → URL Configuration
   - **Site URL**: `https://<your-frontend>.vercel.app`
   - **Redirect URLs**: `https://<your-frontend>.vercel.app/auth/callback`
7. Update Render CORS:
   - Set `ALLOWED_ORIGINS=https://<your-frontend>.vercel.app`

---

## Step 7 — Cloudflare Setup (Optional but Recommended)

1. Add your domain to **[cloudflare.com](https://cloudflare.com)** (free plan)
2. Update nameservers at your domain registrar
3. DNS Records:

```
Type   Name   Content                        Proxy
CNAME  @      cname.vercel-dns.com           ON (orange)
CNAME  api    bg-removal-api.onrender.com    ON (orange)
```

4. Security rules:
   - **Rate Limiting**: Path matches `/api/*` → 20 req/min → Block
   - **WAF**: Block requests to API where Referer doesn't contain your domain
5. Page Rules:
   - `*.yourdomain.com/*` → Always Use HTTPS

---

## Step 8 — Verify Admin Access

1. Go to your deployed site
2. Sign in with `koushiknagabhatla@gmail.com` (Google or magic link)
3. CreditDisplay should show **"∞ Unlimited"** in gold
4. Upload a test image → should process without credit deduction
5. Check Supabase → `usage_log` table → verify `user_id` matches admin

---

## Common Errors and Exact Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `model_int8.onnx not found` | Render disk not mounted | Check render.yaml, verify disk at `/app/model` |
| `401 Invalid signature` | WEBHOOK_SECRET mismatch | Verify same value in both Vercel and Render env vars |
| `402 Insufficient credits` for admin | DB trigger didn't fire | Check `users` table has `is_admin=true` for your email |
| CORS errors in browser | Missing origin | Add Vercel URL to `ALLOWED_ORIGINS` in Render env |
| Google OAuth redirect mismatch | Wrong callback URL | Add exact Vercel URL to Google Console + Supabase auth settings |
| `503 Model not loaded` | ONNX file missing | Upload model_int8.onnx to Render persistent disk |
| Slow first request | Cold start | Normal on first request; subsequent requests are fast |

---

## Monthly Cost Summary

| Service | Tier | Cost | What You Get |
|---------|------|------|--------------|
| Render.com | Starter | $7 | FastAPI, always-on, 512MB RAM |
| Vercel | Free | $0 | Next.js, 100GB bandwidth |
| Cloudflare | Free | $0 | DDoS, WAF, CDN |
| Supabase | Free | $0 | 500MB DB, 50K auth users |
| Upstash Redis | Free | $0 | 10K commands/day |
| **Total** | | **$7/month** | **Production-grade SaaS** |
