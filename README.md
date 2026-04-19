# BG Remover AI — Production SaaS

Custom-trained MobileNetV3 neural network for background removal.
No pretrained weights. No external APIs. **$7/month** total cost.

---

## Architecture

```
Browser                                Render.com ($7/mo)
┌─────────┐     ┌─────────────┐     ┌──────────────────────────────────┐
│ Next.js  │────→│ /api/       │────→│ FastAPI Backend                  │
│ Frontend │     │ remove-bg   │     │                                  │
│ (Vercel) │     │ (HMAC sign) │     │  ┌── Gatekeeper ──────────────┐ │
│          │     │             │     │  │ 1. Request size < 20MB      │ │
│          │     │ RENDER_API_ │     │  │ 2. HMAC-SHA256 signature    │ │
│          │     │ URL + SECRET│     │  │ 3. JWT / Admin key auth     │ │
│          │     │ never reach │     │  │ 4. Rate limit (Redis)       │ │
│          │     │ browser     │     │  │ 5. Credit deduction (PG)    │ │
│          │     └─────────────┘     │  │ 6. Magic bytes validation   │ │
│          │                         │  │ 7. Audit logging            │ │
└─────────┘                         │  └─────────────────────────────┘ │
                                     │              │                   │
                                     │     ONNX INT8 Inference          │
                                     │     ~200ms CPU, ~4MB model       │
                                     └───────┬──────────┬───────────────┘
                                             │          │
                                      ┌──────┴──┐  ┌───┴──────┐
                                      │Supabase │  │ Upstash  │
                                      │ (Free)  │  │ Redis    │
                                      │         │  │ (Free)   │
                                      │ Users   │  │          │
                                      │ Credits │  │ Rate     │
                                      │ Audit   │  │ Limits   │
                                      └─────────┘  └──────────┘
```

## Business Rules

| Rule | Value |
|------|-------|
| Admin email | `koushiknagabhatla@gmail.com` |
| Admin access | Unlimited, never deducted |
| Signup credits | 50 free |
| Cost per removal | 5 credits |
| At 0 credits | 402 error + upgrade message |

## Project Structure

```
bg_removal_saas/
├── notebooks/
│   └── train_kaggle.ipynb        ← Self-contained Kaggle notebook
├── database/
│   └── schema.sql                ← Supabase: tables + RLS + triggers
├── backend/
│   ├── main.py                   ← FastAPI + all classes (single file)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml
├── frontend/
│   ├── app/
│   │   ├── layout.tsx            ← Root layout + Inter font
│   │   ├── page.tsx              ← Landing + app (auth-gated)
│   │   ├── globals.css
│   │   ├── auth/callback/page.tsx
│   │   └── api/
│   │       ├── remove-bg/route.ts  ← THE SECURE PROXY
│   │       └── credits/route.ts
│   ├── components/
│   │   ├── AuthPanel.tsx         ← Google OAuth + magic link
│   │   ├── CreditDisplay.tsx     ← Animated counter + admin badge
│   │   ├── DropZone.tsx          ← Drag-drop + validation
│   │   ├── ComparisonSlider.tsx  ← Before/after slider
│   │   └── DownloadButton.tsx    ← PNG/white/black downloads
│   ├── hooks/useCredits.ts
│   ├── lib/supabase.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   └── next.config.js
├── docs/deployment.md            ← Step-by-step guide
├── .env.example                  ← All variables listed
├── .gitignore
└── README.md
```

## Quick Start

### Phase 1: Train (Kaggle)

1. Go to [kaggle.com/code](https://kaggle.com/code) → New Notebook
2. Add dataset: `tapakah68/human-segmentation`
3. Enable GPU P100
4. Upload/paste `notebooks/train_kaggle.ipynb`
5. Run all cells (~10-15 hours)
6. Download `exports/model_int8.onnx` from Output tab

### Phase 2: Deploy Backend

```bash
# 1. Set up Supabase
#    Run database/schema.sql in SQL Editor

# 2. Deploy to Render ($7/mo)
#    Connect repo → Docker → Starter plan
#    Upload model_int8.onnx to persistent disk
#    Set all env vars (see .env.example)

# 3. Verify
curl https://your-api.onrender.com/health
```

### Phase 3: Deploy Frontend

```bash
cd frontend
npm install
npm run dev  # Local testing

# Deploy to Vercel
# Set env vars (see .env.example)
# Update Supabase redirect URLs
```

## Security Layers

| # | Layer | What | Stops |
|---|-------|------|-------|
| 1 | Size check | Reject > 20MB | Resource exhaustion |
| 2 | HMAC-SHA256 | Signed requests | Direct API bypass |
| 3 | Auth | JWT or Admin key | Unauthorized access |
| 4 | Rate limit | 10 req/min (Redis) | Abuse / scraping |
| 5 | Credits | Atomic deduction (FOR UPDATE) | Race conditions |
| 6 | Magic bytes | PNG/JPEG/WebP header check | Malicious uploads |
| 7 | Audit log | Every request recorded | Abuse detection |

## Infrastructure Cost

| Service | Plan | Cost |
|---------|------|------|
| Render.com | Starter | $7/mo |
| Vercel | Free | $0 |
| Supabase | Free | $0 |
| Upstash Redis | Free | $0 |
| Cloudflare | Free | $0 |
| **Total** | | **$7/mo** |
