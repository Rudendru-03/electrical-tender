import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // DB_POOL_MAX caps connections per process; the local `prisma dev` database only copes with a few.
  const max = Number.parseInt(process.env.DB_POOL_MAX ?? "", 10);
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ...(max > 0 ? { max } : {}) });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
