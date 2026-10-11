import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";

const COOKIE = "admin_session";

function secretKey(): Uint8Array {
  const { secret } = siteConfig.session;
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters (openssl rand -base64 32).");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string): Promise<void> {
  const maxAge = siteConfig.session.days * 24 * 60 * 60;
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secretKey());
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, "", { path: "/admin", maxAge: 0 });
}

export type SessionUser = { id: string; name: string; email: string; role: Role };

/** Current admin user, re-checked against the database on every request. */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  let userId: string | undefined;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    userId = payload.sub;
  } catch {
    return null;
  }
  if (!userId) return null;
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user || !user.active) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
});

export const LEAD_ROLES: Role[] = ["ADMIN", "SALES"];
export const CONTENT_ROLES: Role[] = ["ADMIN", "CONTENT"];
export const ADMIN_ONLY: Role[] = ["ADMIN"];

export function hasRole(user: SessionUser, roles: Role[]): boolean {
  return roles.includes(user.role);
}

/** Use in every admin page, server action and route handler. */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  if (roles && !hasRole(user, roles)) redirect("/admin");
  return user;
}
