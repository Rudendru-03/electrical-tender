import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { siteConfig } from "@/config/site";

type Mail = { to: string; subject: string; text: string; replyTo?: string };

let transport: Transporter | null = null;

function getTransport() {
  const { host, port, user, pass } = siteConfig.mail;
  if (!host) return null;
  transport ??= nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });
  return transport;
}

/** Sends an email, or logs it when SMTP is not configured. Never throws. */
export async function sendMail(mail: Mail): Promise<void> {
  if (!mail.to) return;
  const smtp = getTransport();
  if (!smtp) {
    console.info(`[mail:not-configured] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
    return;
  }
  try {
    await smtp.sendMail({ from: siteConfig.mail.from, ...mail });
  } catch (error) {
    console.error(`[mail:failed] to=${mail.to} subject="${mail.subject}"`, error);
  }
}
