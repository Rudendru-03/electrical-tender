/** Client segments. Copy lives in messages/*.json under `sectors.items.<key>`. */
export const SECTORS = [
  { slug: "government", key: "government", icon: "landmark", cta: "tender" },
  { slug: "industrial-commercial", key: "industrial", icon: "factory", cta: "tender" },
  { slug: "builders-residential", key: "builders", icon: "building", cta: "visit" },
  { slug: "amc-maintenance", key: "amc", icon: "wrench", cta: "callback" },
] as const;

export type Sector = (typeof SECTORS)[number];
export type SectorKey = Sector["key"];
