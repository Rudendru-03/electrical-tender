import "server-only";

const env = process.env;

function text(value: string | undefined, fallback = ""): string {
  return value && value.trim() !== "" ? value.trim() : fallback;
}

function flag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") return fallback;
  return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
}

function int(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function list(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const whatsappNumber = text(env.SITE_WHATSAPP).replace(/\D/g, "");
const chatSrc = text(env.CHAT_WIDGET_SRC);
const turnstileSiteKey = text(env.TURNSTILE_SITE_KEY);
const turnstileSecretKey = text(env.TURNSTILE_SECRET_KEY);

export const siteConfig = {
  url: text(env.SITE_URL, "http://localhost:3000").replace(/\/$/, ""),
  name: text(env.SITE_NAME, "Your Company Electricals"),
  legalName: text(env.SITE_LEGAL_NAME, text(env.SITE_NAME, "Your Company Electricals")),
  establishedYear: text(env.SITE_ESTABLISHED_YEAR),
  contact: {
    phone: text(env.SITE_PHONE),
    phoneAlt: text(env.SITE_PHONE_ALT),
    whatsapp: whatsappNumber,
    address: text(env.SITE_ADDRESS),
    hours: text(env.SITE_HOURS),
    mapEmbedUrl: text(env.GOOGLE_MAPS_EMBED_URL),
    emails: {
      sales: text(env.MAIL_SALES),
      tenders: text(env.MAIL_TENDERS),
      careers: text(env.MAIL_CAREERS),
    },
  },
  social: {
    linkedin: text(env.SOCIAL_LINKEDIN),
    facebook: text(env.SOCIAL_FACEBOOK),
    instagram: text(env.SOCIAL_INSTAGRAM),
    youtube: text(env.SOCIAL_YOUTUBE),
  },
  listings: {
    googleBusiness: text(env.LISTING_GOOGLE_BUSINESS),
    indiamart: text(env.LISTING_INDIAMART),
    tradeindia: text(env.LISTING_TRADEINDIA),
    justdial: text(env.LISTING_JUSTDIAL),
  },
  channels: {
    whatsapp: flag(env.ENABLE_WHATSAPP, true) && whatsappNumber !== "",
    call: flag(env.ENABLE_CALL, true) && text(env.SITE_PHONE) !== "",
    chat: flag(env.ENABLE_CHAT, false) && chatSrc !== "",
    chatSrc,
  },
  stats: {
    years: text(env.STAT_YEARS),
    projects: text(env.STAT_PROJECTS),
    clients: text(env.STAT_CLIENTS),
    capacity: text(env.STAT_CAPACITY),
  },
  tender: {
    valueRange: text(env.TENDER_VALUE_RANGE),
    regions: list(env.TENDER_REGIONS),
  },
  leads: {
    refPrefix: text(env.LEAD_REF_PREFIX, "ET"),
    rateLimitMax: int(env.LEAD_RATE_LIMIT_MAX, 5),
    rateLimitWindowMin: int(env.LEAD_RATE_LIMIT_WINDOW_MIN, 10),
  },
  uploads: {
    dir: text(env.UPLOAD_DIR, "./storage"),
    maxFiles: int(env.UPLOAD_MAX_FILES, 5),
    maxSizeMb: int(env.UPLOAD_MAX_SIZE_MB, 15),
    // Cap on all files of one submission together. Hosts with a small request-body limit (Vercel: 4.5 MB) need this.
    maxTotalMb: int(env.UPLOAD_MAX_TOTAL_MB, int(env.UPLOAD_MAX_FILES, 5) * int(env.UPLOAD_MAX_SIZE_MB, 15)),
    allowedExt: list(text(env.UPLOAD_ALLOWED_EXT, "pdf,doc,docx,xls,xlsx,csv,dwg,dxf,zip,jpg,jpeg,png")).map((ext) =>
      ext.toLowerCase().replace(/^\./, ""),
    ),
  },
  captcha: {
    enabled: turnstileSiteKey !== "" && turnstileSecretKey !== "",
    siteKey: turnstileSiteKey,
    secretKey: turnstileSecretKey,
  },
  mail: {
    host: text(env.SMTP_HOST),
    port: int(env.SMTP_PORT, 587),
    user: text(env.SMTP_USER),
    pass: text(env.SMTP_PASS),
    from: text(env.MAIL_FROM, "Website <no-reply@example.com>"),
  },
  session: {
    secret: text(env.SESSION_SECRET),
    days: int(env.SESSION_DAYS, 7),
  },
  admin: {
    timeZone: text(env.ADMIN_TIMEZONE, "Asia/Kolkata"),
  },
  analytics: {
    gaId: text(env.GA_MEASUREMENT_ID),
  },
};

export type SiteConfig = typeof siteConfig;

/** Settings the lead forms need in the browser. */
export function getFormSettings() {
  return {
    maxFiles: siteConfig.uploads.maxFiles,
    maxSizeMb: siteConfig.uploads.maxSizeMb,
    maxTotalMb: siteConfig.uploads.maxTotalMb,
    allowedExt: siteConfig.uploads.allowedExt,
    turnstileSiteKey: siteConfig.captcha.enabled ? siteConfig.captcha.siteKey : "",
    whatsapp: siteConfig.channels.whatsapp ? siteConfig.contact.whatsapp : "",
  };
}

export type FormSettings = ReturnType<typeof getFormSettings>;

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(message: string): string {
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
