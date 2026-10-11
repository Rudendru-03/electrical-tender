/**
 * Seeds the first admin user and starter content.
 * Safe to re-run: existing rows are left as they are.
 * Projects and testimonials are SAMPLES to show the layout; replace them in the admin panel before going live.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const services = [
  {
    slug: "ht-lt-installation",
    title: "HT / LT Electrical Installation",
    icon: "zap",
    summary: "Supply, installation, testing and commissioning of high-tension and low-tension electrical systems.",
    features: ["11 kV / 33 kV HT installations", "LT distribution up to the load point", "HT and LT cable laying and termination", "Testing and commissioning with reports", "Liaison for inspection and charging approval"],
    body: "We execute complete HT and LT installations for new facilities and expansions, from the incoming supply point to final distribution.\n\n## How we execute\n\n- Site survey and load assessment\n- Material as per approved makes and specifications\n- Installation by licensed supervisors and wiremen\n- Pre-commissioning tests and handover documents",
  },
  {
    slug: "substation-transformer",
    title: "Substation and Transformer Works",
    icon: "pole",
    summary: "Indoor and outdoor substations, transformer installation, protection and metering.",
    features: ["Transformer erection and commissioning", "VCB, RMU and HT panels", "Protection relays and metering", "Substation earthing", "Oil filtration and testing"],
    body: "Turnkey substation works including civil coordination, equipment erection, cabling, earthing and commissioning.",
  },
  {
    slug: "panels-switchgear",
    title: "Panels and Switchgear",
    icon: "gauge",
    summary: "LT panels, MCC, PCC, APFC panels and distribution boards, supplied and installed.",
    features: ["PCC, MCC and distribution panels", "APFC panels for power factor", "Bus ducts and rising mains", "Panel modification and retrofitting"],
    body: "Supply and installation of panels built to your single-line diagram and specification, with testing before energising.",
  },
  {
    slug: "industrial-wiring",
    title: "Industrial Electrification",
    icon: "factory",
    summary: "Power distribution, cable trays, machine connections and plant lighting for factories and warehouses.",
    features: ["Cable tray and conduit systems", "Power cabling to machines", "Plant and high-bay lighting", "Shutdown and expansion jobs"],
    body: "Electrical works for manufacturing units and warehouses, planned around production schedules and shutdown windows.",
  },
  {
    slug: "commercial-building-wiring",
    title: "Commercial and Building Wiring",
    icon: "building",
    summary: "Internal electrification of offices, hospitals, institutions, apartments and townships.",
    features: ["Conduiting and point wiring", "Distribution boards and meter panels", "Rising mains", "Common-area and emergency lighting"],
    body: "Complete internal electrification coordinated with civil and interior work, for single buildings and large townships.",
  },
  {
    slug: "street-lighting",
    title: "Street and Area Lighting",
    icon: "lightbulb",
    summary: "Street lights, high-mast lighting and external illumination for roads, campuses and townships.",
    features: ["LED street lighting", "High-mast and flood lighting", "Feeder pillars and underground cabling", "Timer and automation controls"],
    body: "Design support, supply and installation of external lighting for municipal roads, industrial estates and campuses.",
  },
  {
    slug: "solar-epc",
    title: "Solar Power Systems",
    icon: "sun",
    summary: "Rooftop and ground-mounted solar plants on EPC basis, with net-metering support.",
    features: ["Rooftop and ground-mounted plants", "On-grid and hybrid systems", "Net-metering liaison", "Operation and maintenance"],
    body: "Solar EPC from site assessment and design to installation, commissioning and net-metering approvals.",
  },
  {
    slug: "dg-sets",
    title: "DG Sets and Backup Power",
    icon: "battery",
    summary: "DG set installation, AMF and synchronising panels, and changeover systems.",
    features: ["DG installation and exhaust piping", "AMF and synchronising panels", "Changeover and load management", "DG earthing"],
    body: "Backup power systems installed and integrated with your main distribution.",
  },
  {
    slug: "earthing-lightning-protection",
    title: "Earthing and Lightning Protection",
    icon: "shield",
    summary: "Earthing systems and lightning arresters, designed, installed and tested.",
    features: ["Plate, pipe and chemical earthing", "Lightning arresters", "Earth resistance testing", "Earthing audits"],
    body: "Earthing and lightning protection for buildings, substations and equipment, with test reports.",
  },
  {
    slug: "elv-systems",
    title: "Fire Alarm, CCTV and ELV Systems",
    icon: "cctv",
    summary: "Fire alarm, CCTV, access control and data cabling alongside the main electrical scope.",
    features: ["Fire detection and alarm", "CCTV surveillance", "Access control", "Structured data cabling"],
    body: "Extra-low-voltage systems delivered with the electrical works so one contractor is responsible for the whole scope.",
  },
  {
    slug: "amc-maintenance",
    title: "AMC and Electrical Maintenance",
    icon: "wrench",
    summary: "Annual maintenance contracts, preventive maintenance and breakdown support.",
    features: ["Preventive maintenance schedules", "Transformer and panel servicing", "Breakdown attendance", "Maintenance records and reports"],
    body: "Scheduled maintenance and breakdown support for electrical installations under annual contracts.",
  },
  {
    slug: "electrical-audit-testing",
    title: "Electrical Audit and Testing",
    icon: "clipboard",
    summary: "Safety audits, thermography, relay testing and load studies.",
    features: ["Electrical safety audit", "Insulation and earth testing", "Relay testing and calibration", "Load and power-quality study"],
    body: "Testing and audit services that identify risks and compliance gaps in existing installations.",
  },
];

const projects = [
  {
    slug: "sample-33kv-substation",
    title: "Sample: 33/11 kV Substation Augmentation",
    client: "Sample client (Government)",
    sector: "Government",
    service: "Substation and Transformer Works",
    location: "City, State",
    value: "₹0.00 crore",
    year: 2025,
    duration: "6 months",
    summary: "Sample entry. Replace with a real tender work: scope, client, value and completion details.",
    body: "This is sample content to show how a project page looks.\n\n- Describe the scope of work\n- List major equipment installed\n- Mention testing, commissioning and handover",
    featured: true,
    order: 1,
  },
  {
    slug: "sample-factory-electrification",
    title: "Sample: Factory Electrification",
    client: "Sample client (Industrial)",
    sector: "Industrial",
    service: "Industrial Electrification",
    location: "City, State",
    value: "₹0.00 lakh",
    year: 2025,
    duration: "3 months",
    summary: "Sample entry. Replace with a real industrial project and upload site photos.",
    body: "This is sample content to show how a project page looks.",
    featured: true,
    order: 2,
  },
  {
    slug: "sample-township-electrification",
    title: "Sample: Residential Township Electrification",
    client: "Sample client (Builder)",
    sector: "Residential",
    service: "Commercial and Building Wiring",
    location: "City, State",
    value: "₹0.00 crore",
    year: 2024,
    duration: "10 months",
    summary: "Sample entry. Replace with a real builder project: towers, flats and external electrification.",
    body: "This is sample content to show how a project page looks.",
    featured: true,
    order: 3,
  },
];

const credentials = [
  { title: "Electrical Contractor Licence", category: "Licences", order: 1 },
  { title: "Supervisor Competency Certificate", category: "Licences", order: 2 },
  { title: "GST Registration", category: "Tax and statutory registrations", order: 3 },
  { title: "PAN", category: "Tax and statutory registrations", order: 4 },
  { title: "EPF Registration", category: "Tax and statutory registrations", order: 5 },
  { title: "ESIC Registration", category: "Tax and statutory registrations", order: 6 },
  { title: "MSME / Udyam Registration", category: "Tax and statutory registrations", order: 7 },
];

const testimonials = [
  {
    name: "Sample name",
    designation: "Designation",
    organisation: "Sample organisation",
    quote: "Sample testimonial. Replace with the client's own words and publish it.",
    order: 1,
    published: false,
  },
];

const posts = [
  {
    slug: "documents-to-keep-ready-for-electrical-tenders",
    title: "Documents to keep ready when you invite electrical tenders",
    excerpt: "A short checklist that helps contractors price your work accurately and on time.",
    body: "A clear tender enquiry gets you comparable offers. Share these with every bidder:\n\n## Technical\n\n- Scope of work and site location\n- Bill of quantities (BOQ) in an editable format\n- Single-line diagram and layout drawings\n- Approved makes and technical specifications\n\n## Commercial\n\n- Due date and mode of submission\n- EMD, security deposit and payment terms\n- Completion period and penalty clauses\n\nIf any of these are not ready, say so in the enquiry. A site visit before pricing avoids most later variations.",
  },
  {
    slug: "preventive-maintenance-for-transformers-and-panels",
    title: "Preventive maintenance for transformers and panels",
    excerpt: "What a basic maintenance schedule for an LT/HT installation should cover.",
    body: "Most breakdowns give early signs. A simple schedule catches them.\n\n## Monthly\n\n- Visual check for oil leaks, overheating marks and loose connections\n- Record load on each phase\n\n## Half-yearly\n\n- Tighten terminations and clean panels during a planned shutdown\n- Test earth resistance\n\n## Yearly\n\n- Transformer oil test (BDV)\n- Relay testing and calibration\n- Insulation resistance test of cables and equipment\n\nKeep the readings in a register so that changes over time are visible.",
  },
];

const jobs = [
  {
    title: "Electrical Site Engineer",
    location: "Project sites",
    type: "Full-time",
    experience: "2-5 years",
    description: "Supervise electrical installation at site, coordinate with the client and prepare measurements and bills.",
    order: 1,
  },
  {
    title: "Licensed Electrical Supervisor",
    location: "Project sites",
    type: "Full-time",
    experience: "3+ years with a valid supervisor permit",
    description: "Lead a team of wiremen, ensure safe working and complete testing before energising.",
    order: 2,
  },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase();
  if (await prisma.adminUser.findUnique({ where: { email } })) {
    console.log(`Admin user ${email} already exists; password unchanged.`);
  } else {
    const generated = !process.env.SEED_ADMIN_PASSWORD;
    const password = process.env.SEED_ADMIN_PASSWORD || randomBytes(12).toString("base64url");
    await prisma.adminUser.create({
      data: { email, name: "Administrator", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log(`Created admin user ${email}`);
    if (generated) console.log(`Generated password (shown only once): ${password}`);
  }

  for (const [index, service] of services.entries()) {
    await prisma.service.upsert({ where: { slug: service.slug }, update: {}, create: { ...service, order: index + 1 } });
  }
  for (const project of projects) {
    await prisma.project.upsert({ where: { slug: project.slug }, update: {}, create: project });
  }
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...post, published: true, publishedAt: new Date() },
    });
  }
  // These have no natural unique key, so they are only seeded into an empty table.
  if ((await prisma.credential.count()) === 0) await prisma.credential.createMany({ data: credentials });
  if ((await prisma.testimonial.count()) === 0) await prisma.testimonial.createMany({ data: testimonials });
  if ((await prisma.jobOpening.count()) === 0) await prisma.jobOpening.createMany({ data: jobs });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
