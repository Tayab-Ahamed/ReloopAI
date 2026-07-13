# ReLoop AI — Architecture

## High-level

```
┌────────────────┐        ┌─────────────────────┐        ┌─────────────────────┐
│ React Frontend  │ ─────▶ │ Node/Express API   │ ─────▶ │ MongoDB (Atlas)  │
│ Vite + TS + TW  │        │ ("FastAPI-ready")  │        └─────────────────────┘
└────────────────┘        │                    │
                            ├─▶ Vision AI (OpenAI / HF / mock)
                            ├─▶ OCR       (OpenAI / Google Vision / mock)
                            ├─▶ LLM       (OpenAI / mock)
                            ├─▶ Matching  (in-process)
                            └─▶ n8n webhook  ────────────────────┐
                                                                     ▼
                                                       ┌─────────────────────┐
                                                       │ Email (SendGrid)     │
                                                       │ WhatsApp (Twilio)    │
                                                       │ Google Maps routing  │
                                                       │ PDF certificate      │
                                                       │ Analytics rollup     │
                                                       └─────────────────────┘
```

Every integration is guarded behind an env-configurable provider. When keys are missing, the service falls back to a deterministic mock so the app still boots and demos.

## AI service contracts

### `POST /api/ai/analyze`

**Request** `{ imageUrl: string, hints?: { category?: string } }`

**Response**
```json
{
  "vision":  { "itemDetected": "", "category": "food", "condition": "fresh", "quantityEstimate": 4.2, "quantityUnit": "kg", "confidence": 0.86 },
  "ocr":     { "text": "", "productName": null, "expiry": "2025-01-01T00:00Z", "batch": null },
  "listing": { "title": "", "description": "", "category": "food", "donationInstructions": "" }
}
```

### `POST /api/ai/match`

**Request** `{ listingId }`
**Response** `{ matches: RankedRecipient[] }` where each match has `score`, `distanceKm`, `urgencyScore`, `storageScore`, `categoryMatch`, `availabilityScore`, and a human-readable `reason`.

### Matching algorithm

Weighted linear combination:

```
score = 0.30 · distance    + 0.25 · urgency
      + 0.20 · categoryFit + 0.15 · storageFit
      + 0.10 · availability
```

Each term is normalised to 0..100. `urgency` is only meaningful for food (hours to expiry). `categoryFit` collapses to 5 (soft-block) when the recipient does not accept the category.

### `POST /api/ai/impact`

Produces `{ mealsSaved, co2SavedKg, wasteDivertedKg, summary }`. When the LLM is disabled, the service falls back to a deterministic calculator using per-category factors.

## n8n workflows

See `Automation/n8n/` for importable JSON.

- **WF-01 Donation lifecycle** — triggered by `/api/webhooks/listing-created`.
- **WF-02 Expiry escalation** — cron every 10 min; escalates to HIGH priority and notifies volunteers if silence continues.
- **WF-03 Impact & receipt** — triggered by `/api/webhooks/pickup-completed`; renders PDF, emails + WhatsApps donor, updates analytics.

Webhooks are secured with a shared `x-reloop-secret` header.

## Data model (excerpt)

`Donation` (aka Listing)
- `category`, `title`, `description`, `priority`, `status`
- `ai.*` — vision + OCR outputs and confidence
- `matches[]` — ranked recipients with sub-scores
- `automation.*` — workflow state (`workflowId`, `lastStep`, timestamps)
- `impact.*` — meals, CO₂, waste, PDF URL

`User`
- `role ∈ { Donor, NGO, Volunteer, Recycler, Admin }`
- Recipient fields: `acceptedCategories`, `storageCapacity`, `pickupAvailability`, `serviceRadiusKm`
- Volunteer fields: `volunteerProfile.{ vehicle, maxLoadKg, activeToday }`
- Channels: `channels.{ email, whatsapp, sms }`, `whatsappNumber`
