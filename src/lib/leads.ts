import { z } from "zod";

export const LEAD_TYPES = ["TENDER", "QUOTE", "SITE_VISIT", "CALLBACK", "CONTACT", "CAREER"] as const;
export const CLIENT_TYPES = ["GOVERNMENT", "PRIVATE", "BUILDER", "AMC", "OTHER"] as const;
export const LEAD_STATUSES = ["NEW", "IN_REVIEW", "QUOTED", "WON", "LOST", "CLOSED"] as const;
export const LEAD_SOURCES = ["WEBSITE", "WHATSAPP", "PHONE", "EMAIL", "SOCIAL", "LISTING", "REFERRAL", "OTHER"] as const;

export type LeadTypeValue = (typeof LEAD_TYPES)[number];

export const LEAD_TYPE_LABELS: Record<LeadTypeValue, string> = {
  TENDER: "Tender / RFQ",
  QUOTE: "Quick quote",
  SITE_VISIT: "Site visit",
  CALLBACK: "Callback",
  CONTACT: "Contact",
  CAREER: "Career",
};

export const CLIENT_TYPE_LABELS: Record<(typeof CLIENT_TYPES)[number], string> = {
  GOVERNMENT: "Government / PSU",
  PRIVATE: "Private industrial / commercial",
  BUILDER: "Builder / residential",
  AMC: "AMC / maintenance",
  OTHER: "Other",
};

export const LEAD_STATUS_LABELS: Record<(typeof LEAD_STATUSES)[number], string> = {
  NEW: "New",
  IN_REVIEW: "Under review",
  QUOTED: "Quoted",
  WON: "Awarded",
  LOST: "Lost",
  CLOSED: "Closed",
};

export const LEAD_SOURCE_LABELS: Record<(typeof LEAD_SOURCES)[number], string> = {
  WEBSITE: "Website",
  WHATSAPP: "WhatsApp",
  PHONE: "Phone call",
  EMAIL: "Email",
  SOCIAL: "Social media",
  LISTING: "Listing (IndiaMART etc.)",
  REFERRAL: "Referral",
  OTHER: "Other",
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", message: "invalid" });
      return z.NEVER;
    }
    return date;
  });

export const leadSchema = z
  .object({
    type: z.enum(LEAD_TYPES),
    name: z.string().trim().min(2, "required").max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s-]{7,17}$/, "phone"),
    email: z.union([z.literal(""), z.email("email").max(160)]).optional().transform((value) => value || undefined),
    organisation: optionalText(160),
    clientType: z.union([z.literal(""), z.enum(CLIENT_TYPES)]).optional().transform((value) => value || undefined),
    city: optionalText(80),
    state: optionalText(80),
    workType: optionalText(160),
    estimatedValue: optionalText(60),
    deadline: optionalDate,
    preferredAt: optionalDate,
    position: optionalText(160),
    message: optionalText(4000),
    locale: optionalText(5),
    pagePath: optionalText(300),
  })
  .superRefine((lead, ctx) => {
    const require = (field: "email" | "organisation" | "workType" | "city" | "preferredAt" | "message" | "position") => {
      if (!lead[field]) ctx.addIssue({ code: "custom", message: "required", path: [field] });
    };
    if (lead.type === "TENDER") (["email", "organisation", "workType", "city"] as const).forEach(require);
    if (lead.type === "QUOTE") (["workType", "city"] as const).forEach(require);
    if (lead.type === "SITE_VISIT") (["city", "preferredAt"] as const).forEach(require);
    if (lead.type === "CONTACT") require("message");
    if (lead.type === "CAREER") (["email", "position"] as const).forEach(require);
  });

export type LeadInput = z.infer<typeof leadSchema>;

/** Lead types that may carry attachments. */
export const TYPES_WITH_FILES: LeadTypeValue[] = ["TENDER", "QUOTE", "CAREER"];

const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateReference(prefix: string, now = new Date()): string {
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = Array.from(bytes, (byte) => REF_ALPHABET[byte % REF_ALPHABET.length]).join("");
  return `${prefix}-${yymm}-${code}`;
}
