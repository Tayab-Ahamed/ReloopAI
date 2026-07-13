// ReLoop AI brand constants — single source of truth

export const BRAND = {
  name: "ReLoop AI",
  short: "ReLoop",
  tagline: "Intelligent redistribution of surplus resources through AI automation.",
  descriptor: "AI-Powered Circular Resource Exchange Platform",
  domain: "reloop.ai",
} as const;

export type ResourceCategory =
  | "food"
  | "electronics"
  | "furniture"
  | "books"
  | "clothes"
  | "medical"
  | "recyclables";

export const CATEGORIES: {
  id: ResourceCategory;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  { id: "food",        label: "Food",             emoji: "\uD83C\uDF71", blurb: "Perishable meals routed to nearby NGOs before expiry." },
  { id: "electronics", label: "Electronics",      emoji: "\uD83D\uDCBB", blurb: "Working laptops, phones, and peripherals get a second life." },
  { id: "furniture",   label: "Furniture",        emoji: "\uD83E\uDE91", blurb: "Chairs, desks, and beds diverted from landfill into homes." },
  { id: "books",       label: "Books",            emoji: "\uD83D\uDCDA", blurb: "Textbooks and reading material for libraries and schools." },
  { id: "clothes",     label: "Clothes",          emoji: "\uD83D\uDC55", blurb: "Sorted apparel matched to shelters and disaster relief." },
  { id: "medical",     label: "Medical supplies", emoji: "\uD83E\uDDF4", blurb: "Unused, in-date supplies to verified clinics and NGOs." },
  { id: "recyclables", label: "Recyclables",      emoji: "\u267B\uFE0F",  blurb: "E-waste, glass, and plastics routed to certified recyclers." },
];

export const ROLES = [
  { id: "Donor",     label: "Donor",     desc: "List surplus resources with one photo" },
  { id: "NGO",       label: "NGO",       desc: "Receive AI-ranked pickup requests" },
  { id: "Volunteer", label: "Volunteer", desc: "Get routed pickups and reminders" },
  { id: "Recycler",  label: "Recycler",  desc: "Handle e-waste and non-reusable streams" },
  { id: "Admin",     label: "Admin",     desc: "Verify orgs, monitor impact, tune AI" },
] as const;
