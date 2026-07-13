# ReLoop AI — n8n Workflows

Import these JSON files into your n8n instance (self-hosted or cloud).

1. **wf-01-donation-lifecycle.json** — fires when a donor uploads a listing. Runs the full lifecycle: AI Analysis → Save → Match → Notify NGO → Wait for approval → Assign volunteer → Google Maps route → Reminder → Pickup complete.
2. **wf-02-expiry-escalation.json** — cron job. Every 10 minutes, finds food listings with < 6h until expiry, escalates priority to HIGH, fans out to nearby NGOs, and falls back to volunteers if silent.
3. **wf-03-impact-receipt.json** — fires when a pickup is marked complete. Generates the AI impact report, renders a PDF certificate, emails / WhatsApps the donor, and rolls up CO₂ analytics.

## Required environment (inside n8n)

- `RELOOP_API` — base URL of the ReLoop backend (e.g. `https://api.reloop.ai`).
- Any per-node credentials for Twilio, SendGrid, or Google Maps if you wire the fanout / routing to real providers.

## Required environment (on the backend)

- `N8N_WEBHOOK_BASE` — base URL of n8n webhooks (e.g. `https://n8n.example.com/webhook`).
- `N8N_SECRET` — shared secret sent as `x-reloop-secret`.

See `Docs/DEPLOYMENT.md` for the end-to-end deployment guide.
