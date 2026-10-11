/**
 * CMS resource definitions. The admin list, form and save action are all driven
 * by this file, so adding a field here is enough to make it editable.
 * Kept free of server-only imports because the form (a client component) reads it.
 */

export type FieldType =
  | "text"
  | "slug"
  | "textarea"
  | "markdown"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "list"
  | "image"
  | "images"
  | "file";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: string[];
  /** Column accepts NULL; empty input is stored as NULL instead of "" / 0. */
  nullable?: boolean;
  /** Initial value for new records (booleans and numbers). */
  initial?: boolean | number;
};

export type Resource = {
  key: string;
  /** Prisma model delegate name, e.g. prisma.blogPost */
  model: "service" | "project" | "testimonial" | "credential" | "blogPost" | "jobOpening";
  label: string;
  singular: string;
  /** Field shown as the record's name in lists and used to build the slug. */
  titleField: string;
  listFields: string[];
  orderBy: Record<string, "asc" | "desc">[];
  /** Field that controls public visibility. */
  visibleField: string;
  fields: Field[];
};

const SERVICE_ICON_KEYS = [
  "zap",
  "pole",
  "gauge",
  "factory",
  "building",
  "lightbulb",
  "sun",
  "battery",
  "shield",
  "cctv",
  "wrench",
  "clipboard",
  "cable",
  "landmark",
];

const order: Field = { name: "order", label: "Sort order", type: "number", help: "Lower numbers show first.", initial: 0 };
const published: Field = { name: "published", label: "Published", type: "boolean", initial: true };

export const RESOURCES: Resource[] = [
  {
    key: "services",
    model: "service",
    label: "Services",
    singular: "service",
    titleField: "title",
    listFields: ["title", "slug", "order"],
    orderBy: [{ order: "asc" }, { title: "asc" }],
    visibleField: "published",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", help: "Leave empty to generate from the title." },
      { name: "summary", label: "Short summary", type: "textarea", required: true },
      { name: "icon", label: "Icon", type: "select", options: SERVICE_ICON_KEYS, required: true },
      { name: "features", label: "Scope items", type: "list", help: "One item per line." },
      { name: "body", label: "Description", type: "markdown" },
      order,
      published,
    ],
  },
  {
    key: "projects",
    model: "project",
    label: "Projects",
    singular: "project",
    titleField: "title",
    listFields: ["title", "client", "sector", "year"],
    orderBy: [{ order: "asc" }, { year: "desc" }],
    visibleField: "published",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", help: "Leave empty to generate from the title." },
      { name: "client", label: "Client", type: "text", required: true },
      { name: "sector", label: "Sector", type: "text", required: true, help: "Used for the filter on the projects page, e.g. Government, Industrial." },
      { name: "service", label: "Service", type: "text", nullable: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "value", label: "Contract value", type: "text", nullable: true },
      { name: "year", label: "Year", type: "number", nullable: true },
      { name: "duration", label: "Duration", type: "text", nullable: true },
      { name: "summary", label: "Short summary", type: "textarea", required: true },
      { name: "body", label: "Scope of work", type: "markdown" },
      { name: "images", label: "Photos", type: "images" },
      { name: "featured", label: "Show on home page", type: "boolean", initial: false },
      order,
      published,
    ],
  },
  {
    key: "testimonials",
    model: "testimonial",
    label: "Testimonials",
    singular: "testimonial",
    titleField: "name",
    listFields: ["name", "organisation", "order"],
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    visibleField: "published",
    fields: [
      { name: "name", label: "Person's name", type: "text", required: true },
      { name: "designation", label: "Designation", type: "text", nullable: true },
      { name: "organisation", label: "Organisation", type: "text", required: true },
      { name: "quote", label: "Testimonial", type: "textarea", required: true },
      { name: "logo", label: "Organisation logo", type: "image", nullable: true },
      order,
      published,
    ],
  },
  {
    key: "credentials",
    model: "credential",
    label: "Credentials",
    singular: "credential",
    titleField: "title",
    listFields: ["title", "category", "number"],
    orderBy: [{ order: "asc" }, { title: "asc" }],
    visibleField: "published",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true, help: "Groups items on the credentials page, e.g. Licences, Tax registrations." },
      { name: "issuer", label: "Issued by", type: "text", nullable: true },
      { name: "number", label: "Number", type: "text", nullable: true },
      { name: "validTill", label: "Valid till", type: "date", nullable: true },
      { name: "document", label: "Document copy", type: "file", nullable: true, help: "Shown publicly on the credentials page. Leave empty to show 'copy available on request'." },
      order,
      published,
    ],
  },
  {
    key: "blog",
    model: "blogPost",
    label: "Blog posts",
    singular: "blog post",
    titleField: "title",
    listFields: ["title", "slug", "publishedAt"],
    orderBy: [{ createdAt: "desc" }],
    visibleField: "published",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", help: "Leave empty to generate from the title." },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
      { name: "body", label: "Content", type: "markdown", required: true },
      { name: "cover", label: "Cover image", type: "image", nullable: true },
      { name: "publishedAt", label: "Publish date", type: "date", nullable: true },
      { ...published, initial: false },
    ],
  },
  {
    key: "jobs",
    model: "jobOpening",
    label: "Job openings",
    singular: "job opening",
    titleField: "title",
    listFields: ["title", "location", "type"],
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    visibleField: "open",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "type", label: "Employment type", type: "select", options: ["Full-time", "Part-time", "Contract", "Apprentice"], required: true },
      { name: "experience", label: "Experience", type: "text", nullable: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      order,
      { name: "open", label: "Open for applications", type: "boolean", initial: true },
    ],
  },
];

export function getResource(key: string): Resource | undefined {
  return RESOURCES.find((resource) => resource.key === key);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Result of an admin server action. `values` echoes the submission so the form can be refilled after an error. */
export type ActionState = { error?: string; fields?: Record<string, string>; ok?: string; values?: Record<string, string> };
