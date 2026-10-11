import "server-only";
import { siteConfig } from "@/config/site";

/** Verifies a Cloudflare Turnstile token. Only called when captcha is enabled. */
export async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret: siteConfig.captcha.secretKey, response: token });
    if (ip !== "unknown") body.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("[captcha] verification request failed", error);
    return false;
  }
}
