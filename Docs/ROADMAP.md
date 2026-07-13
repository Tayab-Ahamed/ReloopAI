# ReLoop AI — Roadmap

## Now (shipped in this drop)
- ReLoop AI branding, dark AI-startup landing page, 7 categories, 5 roles.
- Vision + OCR + LLM + Matching services with a `mock` provider that always works.
- Three n8n workflows for lifecycle, expiry escalation, and impact reporting.
- Impact dashboard (waste, meals, CO₂, active pickups, NGOs, volunteers, monthly, AI recs).
- Email (SendGrid) + WhatsApp (Twilio) fan-out. PDF certificate stub.

## Next
- **Real Vision / OCR** — wire OpenAI + Google Cloud Vision, switch via `AI_PROVIDER` / `OCR_PROVIDER`.
- **Real PDF certificate** — replace `services/impactPdf.js` stub with `pdfkit` or a Puppeteer render, upload to R2/S3.
- **Volunteer routing** — replace the Google Maps proxy with a Distance Matrix + Directions call inside WF-01.
- **Analytics warehouse** — push impact rollups to a dedicated table (`impacts_daily`) for fast dashboard reads.

## Migration to FastAPI + Supabase
The reference architecture uses FastAPI + Supabase. This repository ships the same service contracts on top of Node + MongoDB so nothing has to be rewritten today. To migrate:

1. **DB — Supabase Postgres**
   - Port the two Mongoose models (`Donation`, `User`) to SQL tables. Multi-select fields (`acceptedCategories`, `matches`) become JSONB.
   - Move file uploads to Supabase Storage buckets and drop the R2 client.
2. **API — FastAPI**
   - Recreate the five routers (`auth`, `donations`, `ai`, `webhooks`, `users`).
   - Ports go 1:1 — each `ai/*.js` module maps to a FastAPI dependency.
3. **Frontend** — no changes required. `VITE_Backend_URL` just points at the FastAPI base.
4. **n8n** — no changes required. Webhook URLs stay the same shape.

## Later
- Native mobile (Expo) for volunteers.
- Multi-language impact reports.
- Public impact ledger (blockchain-anchored certificates).
