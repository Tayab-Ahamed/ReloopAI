# ReLoop AI — Deployment

## 1. Push to your own repo

```bash
cd ReLoopAI
git init
git add .
git commit -m "ReLoop AI — initial import"
git branch -M main
git remote add origin https://github.com/<you>/reloop-ai.git
git push -u origin main
```

## 2. MongoDB Atlas

1. Create a free cluster at atlas.mongodb.com.
2. Add a database user, allow your IPs (or `0.0.0.0/0` for testing).
3. Copy the connection string — that's `MONGO_URI` for the backend.

## 3. Backend — Render or Railway

**Render**
- New Web Service → point at the repo, root directory `Backend`.
- Build command: `npm install`
- Start command: `npm run start`
- Environment variables: copy every key from `Backend/.env.example`.

**Railway**
- New project → deploy from GitHub → pick `Backend/`.
- Set the same env vars.
- Expose port `5000` (or use `PORT` from Railway).

## 4. Frontend — Vercel

- Import the repo, set **Root Directory** to `Frontend`.
- Framework preset: **Vite**.
- Build command: `npm run build`
- Output directory: `dist`
- Env var: `VITE_Backend_URL = https://<your-backend-domain>`

## 5. n8n Cloud (or self-hosted)

1. Log into n8n.
2. Import the three JSON files from `Automation/n8n/`.
3. Set the following env inside n8n:
   - `RELOOP_API` = your backend base URL
   - Credentials for SendGrid, Twilio, and Google Maps if you wire those steps to real providers.
4. Copy the base webhook URL back into the backend as `N8N_WEBHOOK_BASE`.
5. Set `N8N_SECRET` to a shared secret and use the `x-reloop-secret` header check in your workflow's IF node.

## 6. Environment variables (backend)

See `Backend/.env.example`. The essentials:

| Key                     | Purpose                                      |
|-------------------------|----------------------------------------------|
| `MONGO_URI`             | Atlas connection string                      |
| `JWT_SECRET`            | Auth token secret                            |
| `CORS_ORIGINS`          | Comma-separated allowed origins              |
| `GOOGLE_MAPS_API_KEY`   | Server-side proxy for nearby places          |
| `AI_PROVIDER`           | `mock` \| `openai` \| `huggingface`          |
| `OPENAI_API_KEY`        | For real Vision + LLM inference              |
| `OCR_PROVIDER`          | `mock` \| `openai` \| `google`               |
| `SENDGRID_API_KEY`      | Email                                        |
| `EMAIL_FROM`            | Verified sender address                      |
| `TWILIO_*`              | WhatsApp notifications                       |
| `N8N_WEBHOOK_BASE`      | Base URL for n8n webhooks                    |
| `N8N_SECRET`            | Shared secret                                |
| `PUBLIC_ASSET_BASE`     | Public base for hosted PDF certificates      |
| `PUBLIC_APP_URL`        | Used in email templates                      |

## 7. Security checklist before going live

- ✅ No API keys committed — `.env` files are in `.gitignore` (verify).
- ✅ CORS origins locked to your production domains.
- ✅ `N8N_SECRET` set and validated in every webhook.
- ✅ `SENDGRID_EMAIL` / `EMAIL_FROM` verified in SendGrid.
- ✅ Twilio WhatsApp templates approved.
- ✅ MongoDB Atlas IP allowlist restricted to your backend host.
